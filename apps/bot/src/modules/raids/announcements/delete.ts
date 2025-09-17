import { ServersService } from "@albion-raid-manager/core/index";
import { logger } from "@albion-raid-manager/core/logger";
import { Client } from "discord.js";

interface DeleteAnnouncementProps {
  discord: Client;
  serverId: string;
  announcementMessageId: string;
}

export async function deleteAnnouncement({ discord, serverId, announcementMessageId }: DeleteAnnouncementProps) {
  const server = await ServersService.getServerById(serverId);
  if (!server || !server.raidAnnouncementChannelId) {
    logger.warn(`Server not found or no announcement channel ID: ${serverId}`, { serverId });
    return;
  }

  const channel = discord.channels.cache.get(server.raidAnnouncementChannelId);
  if (!channel || !channel.isTextBased() || channel.isDMBased()) {
    logger.warn(`Announcement channel not found or not a text channel: ${server.raidAnnouncementChannelId}`, {
      serverId,
    });
    return;
  }

  const message = await channel.messages.fetch(announcementMessageId);
  if (!message) {
    logger.warn(`Message not found ID: ${announcementMessageId}`, { announcementMessageId });
    return;
  }

  try {
    if (message.hasThread && message.thread) {
      await message.thread.delete("Raid announcement deleted");
    }

    await message.delete();

    logger.info(`Deleted announcement ${announcementMessageId}`, {
      messageId: announcementMessageId,
      serverId,
    });
  } catch (error) {
    logger.error(`Failed to delete announcement ${announcementMessageId}`, {
      announcementMessageId,
      serverId,
      error,
    });
  }
}
