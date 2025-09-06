import { prisma } from "@albion-raid-manager/database";
import { logger } from "@albion-raid-manager/logger";
import { RaidEvent } from "@albion-raid-manager/redis";
import { Client } from "discord.js";

import { handleAnnounceRaid } from "./handleAnnounceRaid";

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
    await handleAnnounceRaid({ discord, raidId: event.entityId, serverId: event.serverId });
  }
}

export async function handleRaidUpdated({ discord, event }: HandleRaidEventProps) {
  const { raid } = event.data;
  logger.info(`Raid updated: ${raid.id}`, { raid });

  // Update the announcement if it exists
  await handleAnnounceRaid({ discord, raidId: event.entityId, serverId: event.serverId });
}

export async function handleRaidStatusChanged({ discord, event }: HandleRaidEventProps) {
  const { raid, previousStatus } = event.data;
  logger.info(`Raid status changed: ${raid.id} from ${previousStatus} to ${raid.status}`, {
    raid,
    previousStatus,
  });

  // If status changed to OPEN, announce the raid
  if (raid.status === "OPEN" && previousStatus === "SCHEDULED") {
    await handleAnnounceRaid({ discord, raidId: event.entityId, serverId: event.serverId });
  }

  // Update the announcement regardless of status change
  await handleAnnounceRaid({ discord, raidId: event.entityId, serverId: event.serverId });
}

export async function handleRaidDeleted({ discord, event }: HandleRaidEventProps) {
  const { entityId } = event;
  logger.info(`Raid deleted: ${entityId}`, { raidId: entityId, serverId: event.serverId });

  // Try to find and delete the announcement message
  try {
    const raid = await prisma.raid.findUnique({
      where: { id: event.entityId },
      include: { server: true },
    });

    if (raid?.announcementMessageId && raid.server) {
      const guild = discord.guilds.cache.get(raid.server.id);
      if (guild) {
        const channel = await guild.channels.fetch(raid.server.raidAnnouncementChannelId || "");
        if (channel?.isTextBased()) {
          try {
            const message = await channel.messages.fetch(raid.announcementMessageId);
            await message.delete();
            logger.info(`Deleted announcement message for raid: ${raid.id}`);
          } catch (error) {
            logger.warn(`Failed to delete announcement message for raid: ${raid.id}`, { error });
          }
        }
      }
    }
  } catch (error) {
    logger.error(`Error handling raid deletion: ${event.entityId}`, { error });
  }
}
