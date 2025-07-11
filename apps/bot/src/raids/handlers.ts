import { getErrorMessage } from "@albion-raid-manager/core/utils";
import { prisma } from "@albion-raid-manager/database";
import logger from "@albion-raid-manager/logger";
import { Client, Interaction, MessageCreateOptions, MessageEditOptions } from "discord.js";

import { ClientError, ErrorCodes } from "@/errors";

import { Raid, RaidStatus } from "../../../../packages/core/src/types.bkp";

import { raidEvents } from "./events";
import { buildRaidAnnouncementMessage, buildRaidSignupReply } from "./messages";

export const handleAnnounceRaids = async ({ discord }: { discord: Client }) => {
  logger.verbose("Checking for raid announcements");

  const raids = await prisma.raid.findMany({
    where: {
      status: RaidStatus.SCHEDULED,
    },
    include: {
      guild: true,
      slots: true,
    },
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

      if (!raid.guild.raidAnnouncementChannelId)
        throw new Error(`Announcement channel not set for guild: ${raid.guild.name}`);

      const guild = discord.guilds.cache.get(raid.guild.discordId);
      if (!guild) throw new Error(`Discord guild not found: ${raid.guild.discordId}`);

      const channel = await guild.channels.fetch(raid.guild.raidAnnouncementChannelId);
      if (!channel) throw new Error(`Announcement channel not found: ${raid.guild.raidAnnouncementChannelId}`);
      if (!channel.isTextBased())
        throw new Error(`Announcement channel is not a text channel: ${raid.guild.raidAnnouncementChannelId}`);

      const message = await channel.send(buildRaidAnnouncementMessage<MessageCreateOptions>(raid, raid.slots));

      await prisma.raid.update({
        where: { id: raid.id },
        data: { announcementMessageId: message.id },
      });
      raidEvents.emit("raidAnnounced", raid);
    } catch (error) {
      logger.warn(`Failed to announce raid: ${raid.id} (${getErrorMessage(error)})`, {
        raid,
        guild: raid.guild,
        error,
      });
    }
  }
};

export const handleSignup = async ({ discord, interaction }: { discord: Client; interaction: Interaction }) => {
  try {
    if (!interaction.isButton()) throw new Error("Invalid interaction type");

    const raidId = interaction.customId.split(":")[2];
    if (!raidId) throw new Error("Missing raid id");

    const raid = await prisma.raid.findUnique({
      where: { id: raidId },
      include: {
        guild: true,
        slots: true,
      },
    });

    if (!raid) throw new Error("Raid not found");
    if (raid.status !== RaidStatus.OPEN) throw new Error("Raid is not open for signups");

    const users = await Promise.all(
      raid.slots.filter((slot) => !!slot.userId).map(async (slot) => discord.users.fetch(slot.userId as string)),
    );
    await interaction.reply(buildRaidSignupReply(raid, raid.slots, users));
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

export const handleSelectRole = async ({ interaction }: { discord: Client; interaction: Interaction }) => {
  if (!interaction.isStringSelectMenu()) return;

  try {
    const raidId = interaction.customId.split(":")[2];

    const raid = await prisma.raid.findUnique({
      where: { id: raidId },
      include: {
        slots: true,
      },
    });

    if (!raid) throw new Error("Raid not found");
    if (raid.status !== RaidStatus.OPEN) throw new Error("Raid is not open for signups");

    const slot = interaction.values[0];

    if (
      raid.slots.some((raidSlot) => raidSlot.id === slot && raidSlot.userId && raidSlot.userId !== interaction.user.id)
    ) {
      throw new ClientError(ErrorCodes.SLOT_TAKEN, "Slot already taken, please select another one.");
    }

    const currentSlotId = raid.slots.find((raidSlot) => raidSlot.userId === interaction.user.id)?.id;
    if (currentSlotId) {
      await prisma.raidSlot.update({
        where: {
          id: currentSlotId,
        },
        data: {
          userId: null,
        },
      });
    }

    const user = await prisma.user.upsert({
      where: { id: interaction.user.id },
      update: {
        username: interaction.user.username,
        avatar: interaction.user.avatar,
      },
      create: {
        id: interaction.user.id,
        username: interaction.user.username,
        avatar: interaction.user.avatar,
      },
    });

    await prisma.raidSlot.update({
      where: {
        id: slot,
      },
      data: {
        userId: user.id,
      },
    });

    await interaction.update({
      content: `You have signed up for the raid! Good luck!`,
      components: [],
    });
    raidEvents.emit("raidSignup", raid, interaction.user);
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
    await interaction.update({
      content,
    });
  }
};

export const handleSignout = async ({ interaction }: { discord: Client; interaction: Interaction }) => {
  if (!interaction.isButton()) return;

  try {
    const raidId = interaction.customId.split(":")[2];
    if (!raidId) throw new Error("Missing raid id");

    const raid = await prisma.raid.findUnique({
      where: { id: raidId },
      include: {
        slots: true,
      },
    });

    if (!raid) throw new Error("Raid not found");
    if (raid.status !== RaidStatus.OPEN)
      throw new ClientError(ErrorCodes.RAID_NOT_OPEN, "Raid is not open for leaving");

    const slot = raid.slots.find((slot) => slot.userId === interaction.user.id);
    if (!slot) throw new ClientError(ErrorCodes.USER_NOT_SIGNED, "User is not signed up for the raid");

    await prisma.raidSlot.update({
      where: { id: slot.id },
      data: { userId: null },
    });

    await interaction.reply({
      content: `You have left the raid. We hope to see you next time!`,
      ephemeral: true,
    });
    raidEvents.emit("raidSignout", raid, interaction.user);
  } catch (error) {
    if (!interaction.isRepliable()) return;
    if (interaction.replied) return;

    logger.error(`Failed to sign out for raid: ${getErrorMessage(error)}`, {
      interaction: interaction.toJSON(),
      error,
    });

    const content =
      error instanceof ClientError
        ? `Failed to leave raid: ${error.message}`
        : `Failed to leave raid. Please try again later.`;
    await interaction.reply({
      content,
      ephemeral: true,
    });
  }
};

export const updateRaidAnnouncement = async (discord: Client, raid: Raid) => {
  if (!raid.announcementMessageId) return;

  const guild = await prisma.guild.findUnique({
    where: { id: raid.guildId },
  });
  if (!guild || !guild.raidAnnouncementChannelId) return;

  const channel = discord.channels.cache.get(guild.raidAnnouncementChannelId);
  if (!channel?.isTextBased()) return;

  const message = await channel.messages.fetch(raid.announcementMessageId);
  if (!message) return;

  const slots = await prisma.raidSlot.findMany({
    where: { raidId: raid.id },
  });
  await message.edit(buildRaidAnnouncementMessage<MessageEditOptions>(raid, slots));
};
