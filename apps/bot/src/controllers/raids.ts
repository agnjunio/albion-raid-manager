import { ClientError, ErrorCodes } from "@/errors";
import { createRaidAnnouncementMessage, createRaidSignupReply } from "@/messages/raids";
import { runCronjob } from "@albion-raid-manager/common/scheduler";
import { getErrorMessage } from "@albion-raid-manager/common/utils";
import { prisma } from "@albion-raid-manager/database";
import { RaidStatus } from "@albion-raid-manager/database/models";
import logger from "@albion-raid-manager/logger";
import { differenceInMinutes } from "date-fns";
import { Client, Events, Interaction } from "discord.js";
import { EventEmitter } from "stream";
import { Controller } from ".";

const raidEvents = new EventEmitter();

const handleAnnounceRaids = async ({ discord }: { discord: Client }) => {
  logger.verbose("Checking for raid announcements");

  const now = new Date();
  const raids = await prisma.raid
    .findMany({
      where: {
        status: RaidStatus.SCHEDULED,
      },
      include: {
        guild: true,
      },
    })
    .then((raids) => {
      return raids.filter((raid) => {
        return differenceInMinutes(new Date(raid.date), now) < 30;
      });
    });
  if (!raids.length) return;

  logger.debug(`Announcing ${raids.length} scheuled raids.`, {
    raids: raids.length,
  });

  for (const raid of raids) {
    try {
      logger.info(`Announcing raid: ${raid.id}`, { raid });

      await prisma.raid.update({
        where: { id: raid.id },
        data: { status: RaidStatus.OPEN },
      });

      if (!raid.guild.announcementChannelId)
        throw new Error(`Announcement channel not set for guild: ${raid.guild.name}`);

      const guild = discord.guilds.cache.get(raid.guild.discordId);
      if (!guild) throw new Error(`Discord guild not found: ${raid.guild.discordId}`);

      const channel = await guild.channels.fetch(raid.guild.announcementChannelId);
      if (!channel) throw new Error(`Announcement channel not found: ${raid.guild.announcementChannelId}`);
      if (!channel.isTextBased())
        throw new Error(`Announcement channel is not a text channel: ${raid.guild.announcementChannelId}`);

      const message = await channel.send(createRaidAnnouncementMessage(raid));

      await prisma.raid.update({
        where: { id: raid.id },
        data: { announcementMessageId: message.id },
      });
      raidEvents.emit("raidAnnounced", { raid, message });
    } catch (error) {
      logger.warn(`Failed to announce raid: ${raid.id} (${getErrorMessage(error)})`, {
        raid,
        guild: raid.guild,
        error,
      });
    }
  }
};

const handleSignup = async ({ interaction }: { discord: Client; interaction: Interaction }) => {
  try {
    if (!interaction.isButton()) throw new Error("Invalid interaction type");

    const raidId = interaction.customId.split(":")[2];
    if (!raidId) throw new Error("Missing raid id");

    const raid = await prisma.raid.findUnique({
      where: { id: Number(raidId) },
      include: {
        guild: true,
        composition: {
          include: {
            compositionBuilds: {
              include: {
                Build: true,
              },
            },
          },
        },
      },
    });

    if (!raid) throw new Error("Raid not found");
    if (raid.status !== RaidStatus.OPEN) throw new Error("Raid is not open for signups");

    await interaction.reply(createRaidSignupReply(raid, raid.composition.compositionBuilds));
  } catch (error) {
    if (!interaction.isRepliable()) return;
    if (interaction.replied) return;

    logger.error(`Failed to sign up for raid: ${getErrorMessage(error)}`, { interaction: interaction.toJSON(), error });
    await interaction.reply({
      content: `Failed to sign up for the raid. Please try again later.`,
      ephemeral: true,
    });
  }
};

const handleSelect = async ({ interaction }: { discord: Client; interaction: Interaction }) => {
  try {
    if (!interaction.isStringSelectMenu()) throw new Error("Invalid interaction type");

    const raidId = interaction.customId.split(":")[2];

    const raid = await prisma.raid.findUnique({
      where: { id: Number(raidId) },
    });

    if (!raid) throw new Error("Raid not found");
    if (raid.status !== RaidStatus.OPEN) throw new Error("Raid is not open for signups");

    const slot = Number(interaction.values[0]);
    if (isNaN(slot)) throw new Error("Invalid slot selected");

    const existingSignups = await prisma.raidSignup.findMany({
      where: {
        raidId: raid.id,
      },
    });

    if (existingSignups.some((signup) => signup.compositionBuildId === slot && signup.userId !== interaction.user.id)) {
      throw new ClientError(ErrorCodes.SLOT_TAKEN, "Slot already taken, please select another one.");
    }

    const signup = await prisma.raidSignup.upsert({
      where: {
        id: raid.id,
        userId: interaction.user.id,
      },
      update: {
        compositionBuildId: slot,
      },
      create: {
        raidId: raid.id,
        userId: interaction.user.id,
        compositionBuildId: slot,
      },
    });

    await interaction.update({
      content: `You have signed up for the raid! Good luck!`,
      components: [],
    });
    raidEvents.emit("raidSignup", {
      raid,
      user: interaction.user,
      signup,
    });
  } catch (error) {
    if (!interaction.isRepliable()) return;
    if (interaction.replied) return;

    logger.error(`Failed to select build for raid: ${getErrorMessage(error)}`, {
      interaction: interaction.toJSON(),
      error,
    });

    const content =
      error instanceof ClientError
        ? `Failed to select build: ${error.message}`
        : `Failed to select build. Please try again later.`;
    await interaction.reply({
      content,
      ephemeral: true,
    });
  }
};

const raidsController: Controller = {
  id: "raids",
  init: async ({ discord }) => {
    runCronjob({
      name: "Announce Raids",
      cron: "*/30 * * * *", // Every 30 minutes
      callback: () => handleAnnounceRaids({ discord }),
      runOnStart: true,
    });

    discord.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isMessageComponent()) return;

      const [controllerId, action] = interaction.customId.split(":");

      if (controllerId !== raidsController.id) return;
      if (action === "signup") return handleSignup({ discord, interaction });
      if (action === "select") return handleSelect({ discord, interaction });

      logger.warn(`Unknown action: ${interaction.customId}`, { interaction: interaction.toJSON() });
    });

    raidEvents.on("raidAnnounced", ({ raid, message }) => {
      logger.info(`Raid announced: ${raid.id}`, { raid, message: message.toJSON() });
    });

    raidEvents.on("raidSignup", ({ signup, raid, user }) => {
      logger.info(`User ${user.displayName} signed up for raid: ${raid.id}`, {
        signup,
        raid,
        user: user.toJSON(),
      });
    });
  },
};

export default raidsController;
