import config from "@albion-raid-manager/core/config";
import { createDiscordTimestampWithFormat } from "@albion-raid-manager/core/utils/discord";
import { type Raid, type RaidRole, type RaidSlot } from "@albion-raid-manager/types";
import { getContentTypeInfo, getRaidRoleEmoji, RAID_STATUS_INFO } from "@albion-raid-manager/types/entities";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  MessageCreateOptions,
  MessageEditOptions,
} from "discord.js";

import { type GuildContext } from "@/modules/guild-context";
import { getSlotEmoji } from "@/utils/emojis";

import { raids } from "..";
import { getRaidBanner } from "../helpers";

export const buildRaidAnnouncementMessage = async <T extends MessageCreateOptions | MessageEditOptions>(
  raid: Raid,
  slots: RaidSlot[],
  { discord, context }: { discord: Client; context: GuildContext },
): Promise<T> => {
  const { t } = context;

  const getStatusColor = (status: string) => {
    const statusInfo = RAID_STATUS_INFO[status as keyof typeof RAID_STATUS_INFO];
    const hexColor = statusInfo?.color || "#5865f2";
    return parseInt(hexColor.replace("#", ""), 16);
  };

  const getStatusEmoji = (status: string) => {
    const statusInfo = RAID_STATUS_INFO[status as keyof typeof RAID_STATUS_INFO];
    return statusInfo?.emoji || "⚔️";
  };

  // Calculate raid statistics
  const signups = slots.filter((slot) => !!slot.userId);
  const totalSlots = slots.length;
  const filledSlots = signups.length;
  const fillPercentage = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;

  // Create progress bar
  const progressBar = createProgressBar(fillPercentage);

  // Get content type info
  const contentTypeInfo = raid.contentType ? getContentTypeInfo(raid.contentType) : null;

  // Build the main embed
  const embed = new EmbedBuilder()
    .setColor(getStatusColor(raid.status))
    .setTitle(`${getStatusEmoji(raid.status)} ${raid.title}`)
    .setDescription(raid.description || (await t("raids.description")))
    .setImage(getRaidBanner(raid.contentType ?? undefined))
    .setFooter({
      text: `Raid ID: ${raid.id}`,
    })
    .setTimestamp(new Date(raid.date));

  // Add raid date and time with better formatting
  const timestampValue = `${createDiscordTimestampWithFormat(raid.date, "d")} ${createDiscordTimestampWithFormat(raid.date, "t")}`;
  if (timestampValue && timestampValue.length > 0) {
    embed.addFields({
      name: `📅 **${t("raids.dateTime")}**`,
      value: timestampValue,
      inline: true,
    });
  }

  // Add content type field with party size info
  if (raid.contentType && raid.contentType !== "OTHER" && contentTypeInfo?.displayName) {
    const contentTypeValue = `${contentTypeInfo.emoji || ""} **${contentTypeInfo.displayName}**`.trim();
    if (contentTypeValue && contentTypeValue.length > 0) {
      embed.addFields({
        name: `🎯 **${t("raids.contentType")}**`,
        value: contentTypeValue,
        inline: true,
      });
    }
  }

  // Add location if available
  if (raid.location && raid.location.trim().length > 0) {
    const locationValue = raid.location.length > 1024 ? `${raid.location.substring(0, 1020)}...` : raid.location;
    embed.addFields({
      name: `📍 **${t("raids.location")}**`,
      value: locationValue,
      inline: true,
    });
  }

  // Add progress indicator in embed
  if (slots.length > 0) {
    const progressValue = `${progressBar} **${fillPercentage}%** ${t("raids.filled")}`;
    if (progressValue && progressValue.length > 0) {
      embed.addFields({
        name: `📊 **${t("raids.progress")}** (${filledSlots}/${totalSlots})`,
        value: progressValue,
        inline: false,
      });
    }
  }

  // Add note if available with better formatting
  if (raid.note && raid.note.trim().length > 0) {
    // Discord.js field value max length is 1024, accounting for code block formatting
    const maxNoteLength = 1024 - 8; // Reserve space for ```\n and \n```
    const truncatedNote =
      raid.note.length > maxNoteLength ? `${raid.note.substring(0, maxNoteLength - 3)}...` : raid.note;

    embed.addFields({
      name: `📝 **${t("raids.notes")}**`,
      value: `\`\`\`\n${truncatedNote}\n\`\`\``,
      inline: false,
    });
  }

  // Check if all slots are taken
  const allSlotsTaken = slots.length > 0 && slots.every((slot) => !!slot.userId);

  // Add status-specific information
  if (raid.status === "OPEN") {
    const statusMessage = allSlotsTaken
      ? `🔴 **${t("raids.statusDetails.full")}** - ${t("raids.statusDetails.fullDescription")}`
      : `🟢 **${t("raids.statusDetails.open")}** - ${t("raids.statusDetails.openDescription")}`;

    if (statusMessage && statusMessage.length > 0) {
      embed.addFields({
        name: `✅ **${t("raids.status")}**`,
        value: statusMessage.length > 1024 ? `${statusMessage.substring(0, 1020)}...` : statusMessage,
        inline: false,
      });
    }
  } else if (raid.status === "CLOSED") {
    const statusMessage = `🔴 **${t("raids.statusDetails.closed")}** - ${t("raids.statusDetails.closedDescription")}`;
    if (statusMessage && statusMessage.length > 0) {
      embed.addFields({
        name: `❌ **${t("raids.status")}**`,
        value: statusMessage.length > 1024 ? `${statusMessage.substring(0, 1020)}...` : statusMessage,
        inline: false,
      });
    }
  } else if (raid.status === "ONGOING") {
    const statusMessage = `🟡 **${t("raids.statusDetails.ongoing")}** - ${t("raids.statusDetails.ongoingDescription")}`;
    if (statusMessage && statusMessage.length > 0) {
      embed.addFields({
        name: `▶️ **${t("raids.status")}**`,
        value: statusMessage.length > 1024 ? `${statusMessage.substring(0, 1020)}...` : statusMessage,
        inline: false,
      });
    }
  }

  // Create enhanced buttons
  const signupButton = new ButtonBuilder()
    .setCustomId(`${raids.id}:signup:${raid.id}`)
    .setLabel(allSlotsTaken ? `🎯 ${t("raids.buttons.signUpFull")}` : `🎯 ${t("raids.buttons.signUp")}`)
    .setStyle(ButtonStyle.Success)
    .setDisabled(raid.status !== "OPEN" || allSlotsTaken);

  const signoutButton = new ButtonBuilder()
    .setCustomId(`${raids.id}:signout:${raid.id}`)
    .setLabel(`❌ ${t("raids.buttons.leave")}`)
    .setStyle(ButtonStyle.Danger)
    .setDisabled(raid.status !== "OPEN");

  // Build action rows with buttons
  const actionRows = [new ActionRowBuilder<ButtonBuilder>().addComponents(signupButton, signoutButton)];

  // Add web link button if dashboard URL is configured
  if (config.dashboard.url) {
    const webUrl = `${config.dashboard.url}/dashboard/${raid.serverId}/raids/${raid.id}`;
    const viewOnWebButton = new ButtonBuilder()
      .setLabel(`🌐 ${t("raids.buttons.viewOnWeb")}`)
      .setStyle(ButtonStyle.Link)
      .setURL(webUrl);

    actionRows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(viewOnWebButton));
  }

  const row = actionRows[0];
  const webRow = actionRows[1];

  // Build composition as separate content (not in embed to avoid 1024 char limit)
  let compositionContent = "";
  if (slots.length > 0) {
    const { compositionLines, roleSummary } = await buildCompositionData(slots, { discord, context });

    compositionContent = `## 👥 ${t("raids.composition")} (${filledSlots}/${totalSlots})\n\n`;
    compositionContent += compositionLines.join("\n");

    if (roleSummary) {
      compositionContent += `\n\n**${t("raids.slots.roleSummary")}:** ${roleSummary}`;
    }

    compositionContent += "\n\n"; // Add spacing before embed

    // Discord message limit is 2000 characters, truncate if needed
    if (compositionContent.length > 1900) {
      compositionContent = compositionContent.substring(0, 1897) + "...";
    }
  }

  return {
    content: compositionContent || undefined,
    embeds: [embed],
    components: webRow ? [row, webRow] : [row],
  } as unknown as T;
};

// Helper function to create a visual progress bar
function createProgressBar(percentage: number, length: number = 10): string {
  const filled = Math.round((percentage / 100) * length);
  const empty = length - filled;

  const filledBar = "█".repeat(filled);
  const emptyBar = "░".repeat(empty);

  return `\`${filledBar}${emptyBar}\``;
}

async function buildCompositionData(
  slots: RaidSlot[],
  { discord, context }: { discord: Client; context: GuildContext },
): Promise<{ compositionLines: string[]; roleSummary: string }> {
  const { t } = context;

  if (slots.length === 0) {
    return { compositionLines: [t("raids.slots.noSlots")], roleSummary: "" };
  }

  // Only use mentions for raids with 20 or fewer slots to avoid spam
  const useMentions = slots.length <= 20;

  const compositionLines = [];
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const slotNumber = (i + 1).toString().padStart(2, "0");
    const roleEmoji = await getSlotEmoji(slot, { discord });

    if (slot.userId) {
      let userDisplay: string;

      if (useMentions) {
        userDisplay = `<@${slot.userId}>`;
      } else {
        try {
          const user = await discord.users.fetch(slot.userId);
          userDisplay = user.displayName || user.username;
        } catch {
          userDisplay = `User ${slot.userId.substring(0, 8)}`;
        }
      }

      compositionLines.push(`${slotNumber}. ${roleEmoji} **${slot.name}** - ${userDisplay}`);
    } else {
      compositionLines.push(`${slotNumber}. ${roleEmoji} **${slot.name}** - *${t("raids.slots.available")}*`);
    }
  }

  // Add role summary if there are multiple roles
  const roleCounts = slots.reduce(
    (acc, slot) => {
      const role = slot.role || "UNKNOWN";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const roleSummary = Object.entries(roleCounts)
    .map(([role, count]) => `${getRaidRoleEmoji(role as RaidRole)} ${count}`)
    .join(" • ");

  return { compositionLines, roleSummary };
}
