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
  reason?: string;
  timeLeft?: string;
}

interface SendThreadUpdateProps {
  discord: Client;
  raidId: string;
  updateType: "status_change" | "reminder" | "cancellation";
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
    let content: string | undefined;
    let embed: EmbedBuilder | undefined;

    switch (updateType) {
      case "status_change": {
        const statusKey = (data.newStatus || "Unknown").toLowerCase();

        embed = new EmbedBuilder().setColor(getStatusColor(data.newStatus || "Unknown")).setTimestamp();

        if (statusKey === "open") {
          embed.setDescription(t("notifications.statusChange.open"));
        } else if (statusKey === "closed") {
          embed.setDescription(t("notifications.statusChange.closed"));
        } else if (statusKey === "ongoing") {
          embed.setDescription(t("notifications.statusChange.ongoing"));
        } else if (statusKey === "cancelled") {
          embed.setDescription(t("notifications.statusChange.cancelled"));
        } else if (statusKey === "finished") {
          embed.setDescription(t("notifications.statusChange.finished"));
        }

        break;
      }

      case "reminder":
        content = `${t("notifications.reminder.title")}\n\n${t("notifications.reminder.message", { raidTitle: raid.title })}`;

        if (data.timeLeft) {
          content += `\n\n${t("notifications.reminder.timeLeft", { timeLeft: data.timeLeft })}`;
        }

        content += `\n\n${t("notifications.reminder.preparation")}`;
        content += `\n\n${t("notifications.reminder.excitement")}`;

        break;

      case "cancellation": {
        content = `${t("notifications.cancellation.title")}\n\n${t("notifications.cancellation.message", { raidTitle: raid.title })}`;

        const reason = data.reason || t("notifications.cancellation.defaultReason");
        content += `\n\n${t("notifications.cancellation.reason", { reason })}`;
        content += `\n\n${t("notifications.cancellation.apology")}`;
        content += `\n\n${t("notifications.cancellation.nextTime")}`;

        break;
      }
    }

    const messageOptions: MessageCreateOptions = { content };
    if (embed) {
      messageOptions.embeds = [embed];
    }

    await thread.send(messageOptions);

    logger.info(`Sent ${updateType} update to thread for raid ${raidId}`, {
      raidId,
      messageId: raid.announcementMessageId,
      updateType,
    });
  } catch (error) {
    logger.error(`Failed to send ${updateType} update to thread for raid ${raidId}`, {
      raidId,
      messageId: raid.announcementMessageId,
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
