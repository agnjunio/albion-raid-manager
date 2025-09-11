import { prisma } from "@albion-raid-manager/core/database";
import { logger } from "@albion-raid-manager/core/logger";
import { RaidEvent } from "@albion-raid-manager/redis";
import { Client } from "discord.js";

import { handleAnnouncementCreate } from "./handleAnnouncementCreate";

interface HandleRaidEventProps {
  discord: Client;
  event: RaidEvent;
}

export async function handleRaidCreated({ discord, event }: HandleRaidEventProps) {
  const { raid } = event.data;
  logger.info(`Raid created: ${raid.id}`, { raid });

  if (raid.status === "SCHEDULED") {
    logger.debug("Raid is scheduled, will be announced later", { raidId: raid.id });
    return;
  }

  // If the raid is open, announce it immediately
  if (raid.status === "OPEN") {
    await handleAnnouncementCreate({ discord, raidId: event.entityId, serverId: event.serverId });
  }
}

export async function handleRaidUpdated({ discord, event }: HandleRaidEventProps) {
  const { raid, previousRaid } = event.data;
  logger.info(`Raid updated: ${raid.id}`, {
    raid,
    previousRaid,
    statusChanged: previousRaid?.status !== raid.status,
  });

  // Dont publish updated when the raid is in the scheduler state
  if (raid.status === "SCHEDULED") return;

  await handleAnnouncementCreate({ discord, raidId: event.entityId, serverId: event.serverId });
}

export async function handleRaidDeleted({ discord, event }: HandleRaidEventProps) {
  const { entityId, serverId, data } = event;
  const announcementMessageId = data.raid.announcementMessageId;

  logger.info(`Raid deleted: ${entityId}`, {
    raidId: entityId,
    serverId,
    hasMessageId: !!announcementMessageId,
  });

  // Only proceed if we have the message ID
  if (!announcementMessageId) {
    logger.debug(`No announcement message ID available for deleted raid: ${entityId}`);
    return;
  }

  // Try to delete the announcement message
  try {
    // Get server information to find the announcement channel
    const server = await prisma.server.findUnique({
      where: { id: serverId },
      select: { raidAnnouncementChannelId: true },
    });

    if (!server?.raidAnnouncementChannelId) {
      logger.debug(`No announcement channel configured for server: ${serverId}`);
      return;
    }

    const guild = discord.guilds.cache.get(serverId);
    if (!guild) {
      logger.warn(`Guild not found: ${serverId}`);
      return;
    }

    const channel = await guild.channels.fetch(server.raidAnnouncementChannelId);
    if (!channel?.isTextBased()) {
      logger.warn(`Announcement channel not found or not a text channel: ${server.raidAnnouncementChannelId}`);
      return;
    }

    // Delete the message using the message ID
    const message = await channel.messages.fetch(announcementMessageId);
    await message.delete();
    logger.info(`Deleted announcement message for cancelled raid: ${entityId} (message ID: ${announcementMessageId})`);
  } catch (error) {
    logger.warn(`Failed to delete announcement message for cancelled raid: ${entityId}`, {
      error,
      messageId: announcementMessageId,
    });
  }
}
