import { RaidService } from "@albion-raid-manager/core/services";
import { logger } from "@albion-raid-manager/logger";
import { Client } from "discord.js";

interface HandleRaidEventProps {
  discord: Client;
  raidId: string;
}

export async function handleAnnouncementDelete({ discord, raidId }: HandleRaidEventProps) {
  const raid = await RaidService.findRaidById(raidId, { server: true });

  if (!raid || !raid.announcementMessageId || !raid.server?.raidAnnouncementChannelId) {
    logger.warn(`Raid not found or no announcement message ID or announcement channel ID: ${raidId}`, { raidId });
    return;
  }

  const channel = discord.channels.cache.get(raid.server.raidAnnouncementChannelId);
  if (!channel || !channel.isTextBased() || channel.isDMBased()) {
    logger.warn(`Announcement channel not found or not a text channel: ${raid.announcementMessageId}`, {
      raidId,
    });
    return;
  }

  await channel.messages.fetch(raid.announcementMessageId).then((message) => message.delete());
}
