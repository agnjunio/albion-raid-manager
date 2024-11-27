import { createRaidAnnouncementMessage, createRaidSignupReply } from "@/messages/raids";
import { runCronjob } from "@albion-raid-manager/common/scheduler";
import { getErrorMessage } from "@albion-raid-manager/common/utils";
import { prisma } from "@albion-raid-manager/database";
import { RaidStatus } from "@albion-raid-manager/database/models";
import logger from "@albion-raid-manager/logger";
import { differenceInMinutes } from "date-fns";
import { Client, Events, Interaction } from "discord.js";
import { Controller } from ".";

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

      await channel.send(createRaidAnnouncementMessage(raid));
    } catch (error) {
      logger.warn(`Failed to announce raid: ${raid.id} (${getErrorMessage(error)})`, {
        raid,
        guild: raid.guild,
        error,
      });
    }
  }
};

const handleSignup = async ({ discord, interaction }: { discord: Client; interaction: Interaction }) => {
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

    const guild = discord.guilds.cache.get(raid.guild.discordId);
    if (!guild) throw new Error("Guild not found");

    const member = await guild.members.fetch(interaction.user.id);
    if (!member) return;

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

const handleSelect = async ({ discord, interaction }: { discord: Client; interaction: Interaction }) => {
  try {
    // await prisma.raidSignup.create({
    //   data: {
    //     raidId: raid.id,
    //     userId: member.id,
    //     buildId: 1, // TODO
    //   },
    // });
  } catch (error) {
    if (!interaction.isRepliable()) return;
    if (interaction.replied) return;

    logger.error(`Failed to select build for raid: ${getErrorMessage(error)}`, {
      interaction: interaction.toJSON(),
      error,
    });
    await interaction.reply({
      content: `Failed to select build. Please try again later.`,
      ephemeral: true,
    });
  }
};

const raidsController: Controller = {
  id: "raids",
  init: async (discord: Client) => {
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
  },
};

export default raidsController;
