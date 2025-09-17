import { logger } from "@albion-raid-manager/core/logger";
import { RaidService, ServersService } from "@albion-raid-manager/core/services";
import { Raid } from "@albion-raid-manager/types";
import { RAID_STATUS_INFO } from "@albion-raid-manager/types/entities";
import { Client, EmbedBuilder, Message, MessageCreateOptions } from "discord.js";

import { GuildContext } from "@/modules/guild-context";

interface CreateNotificationThreadProps {
  discord: Client;
  message: Message;
  raid: Raid;
  context: GuildContext;
}

export async function createNotificationThread({ message, raid, context }: CreateNotificationThreadProps) {
  const { t } = context;

  try {
    const thread = await message.startThread({
      name: raid.title,
      autoArchiveDuration: 1440,
      reason: "Raid event notifications thread",
    });

    // Send initial thread message with translations
    const welcomeMessage = t("notifications.thread.welcome", { raidTitle: raid.title });
    const purposeMessage = t("notifications.thread.purpose");
    const updatesMessage = t("notifications.thread.updates");
    const changesMessage = t("notifications.thread.changes");
    const coordinationMessage = t("notifications.thread.coordination");
    const discussionMessage = t("notifications.thread.discussion");
    const noteMessage = t("notifications.thread.note");

    const content = `${welcomeMessage}\n\n${purposeMessage}\n${updatesMessage}\n${changesMessage}\n${coordinationMessage}\n${discussionMessage}\n\n${noteMessage}`;

    await thread.send({ content });

    logger.verbose(`Created thread for raid ${raid.id}`, {
      raidId: raid.id,
      threadId: thread.id,
      threadName: thread.name,
    });
  } catch (error) {
    logger.error(`Failed to create thread for raid ${raid.id}`, {
      raidId: raid.id,
      error,
    });
  }
}

interface ThreadUpdateData {
  newStatus?: string;
  currentSignups?: number;
  totalSlots?: number;
  reason?: string;
  content?: string;
  embed?: EmbedBuilder;
}

interface SendThreadUpdateProps {
  discord: Client;
  raidId: string;
  updateType: "status_change" | "slot_update" | "reminder" | "cancellation" | "general";
  data?: ThreadUpdateData;
  context: GuildContext;
}

export async function sendThreadUpdate({ discord, raidId, updateType, data = {}, context }: SendThreadUpdateProps) {
  const { t } = context;
  const raid = await RaidService.findRaidById(raidId);

  if (!raid || !raid.announcementMessageId) {
    logger.warn(`Raid not found or no thread ID: ${raidId}`, { raidId });
    return;
  }

  const server = await ServersService.getServerById(raid.serverId);
  if (!server || !server.raidAnnouncementChannelId) return;

  const channel = discord.channels.cache.get(server.raidAnnouncementChannelId);
  if (!channel || !channel.isTextBased() || channel.isDMBased()) return;

  const message = await channel.messages.fetch(raid.announcementMessageId);
  if (!message) {
    logger.warn(`Message not found: ${raid.announcementMessageId}`, { raidId });
    return;
  }

  const thread = message.thread;
  if (!thread || !thread.isThread()) {
    logger.warn(`Notification thread not found or not a thread.`, {
      raidId,
      serverId: raid.serverId,
      channelId: server.raidAnnouncementChannelId,
      messageId: raid.announcementMessageId,
    });
    return;
  }

  try {
    let content = "";
    let embed: EmbedBuilder | undefined;

    switch (updateType) {
      case "status_change":
        content = `${t("notifications.statusChange.title")}\n\n${t("notifications.statusChange.message", { raidTitle: raid.title, newStatus: data.newStatus || "Unknown" })}`;
        embed = new EmbedBuilder()
          .setColor(getStatusColor(data.newStatus || "Unknown"))
          .setTitle(`Status: ${data.newStatus || "Unknown"}`)
          .setTimestamp();
        break;

      case "slot_update":
        content = `${t("notifications.rosterUpdate.title")}\n\n${t("notifications.rosterUpdate.message")}`;
        embed = new EmbedBuilder()
          .setColor("#00ff00")
          .setTitle("Roster Change")
          .setDescription(
            t("notifications.rosterUpdate.signups", { current: data.currentSignups, total: data.totalSlots }),
          )
          .setTimestamp();
        break;

      case "reminder":
        content = `${t("notifications.reminder.title")}\n\n${t("notifications.reminder.message", { raidTitle: raid.title })}`;
        embed = new EmbedBuilder()
          .setColor("#ffaa00")
          .setTitle("Raid Starting Soon")
          .setDescription(t("notifications.reminder.description", { raidTitle: raid.title }))
          .setTimestamp();
        break;

      case "cancellation":
        content = `${t("notifications.cancellation.title")}\n\n${t("notifications.cancellation.message", { raidTitle: raid.title })}`;
        embed = new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle("Raid Cancelled")
          .setDescription(data.reason || t("notifications.cancellation.reason"))
          .setTimestamp();
        break;

      case "general":
        content = data.content || "General raid update";
        if (data.embed) {
          embed = data.embed;
        }
        break;
    }

    const messageOptions: MessageCreateOptions = { content };
    if (embed) {
      messageOptions.embeds = [embed];
    }

    await thread.send(messageOptions);

    logger.info(`Sent ${updateType} update to thread for raid ${raidId}`, {
      raidId,
      threadId: raid.announcementThreadId,
      updateType,
    });
  } catch (error) {
    logger.error(`Failed to send ${updateType} update to thread for raid ${raidId}`, {
      raidId,
      threadId: raid.announcementThreadId,
      updateType,
      error,
    });
  }
}

function getStatusColor(status: string): number {
  const statusInfo = RAID_STATUS_INFO[status as keyof typeof RAID_STATUS_INFO];
  const color = statusInfo?.color || RAID_STATUS_INFO.SCHEDULED.color;
  return parseInt(color.replace("#", ""), 16);
}
