import { createDiscordTimestamp } from "@albion-raid-manager/core/utils/discord";
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
  embed.addFields({
    name: `📅 **${t("raids.dateTime")}**`,
    value: createDiscordTimestamp(raid.date),
    inline: true,
  });

  // Add content type field with party size info
  if (raid.contentType && raid.contentType !== "OTHER") {
    embed.addFields({
      name: `🎯 **${t("raids.contentType")}**`,
      value: `${contentTypeInfo?.emoji} **${contentTypeInfo?.displayName}**`,
      inline: true,
    });
  }

  // Add location if available
  if (raid.location) {
    embed.addFields({
      name: `📍 **${t("raids.location")}**`,
      value: raid.location,
      inline: true,
    });
  }

  // Add raid composition with enhanced display
  if (slots.length > 0) {
    const compositionText = await buildCompositionText(slots, { discord, context });

    embed.addFields({
      name: `👥 **${t("raids.composition")}** (${filledSlots}/${totalSlots})`,
      value: compositionText,
      inline: false,
    });

    // Add progress indicator
    embed.addFields({
      name: `📊 **${t("raids.progress")}**`,
      value: `${progressBar} **${fillPercentage}%** ${t("raids.filled")}`,
      inline: false,
    });
  }

  // Add note if available with better formatting
  if (raid.note) {
    embed.addFields({
      name: `📝 **${t("raids.notes")}**`,
      value: `\`\`\`\n${raid.note}\n\`\`\``,
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

    embed.addFields({
      name: `✅ **${t("raids.status")}**`,
      value: statusMessage,
      inline: false,
    });
  } else if (raid.status === "CLOSED") {
    embed.addFields({
      name: `❌ **${t("raids.status")}**`,
      value: `🔴 **${t("raids.statusDetails.closed")}** - ${t("raids.statusDetails.closedDescription")}`,
      inline: false,
    });
  } else if (raid.status === "ONGOING") {
    embed.addFields({
      name: `▶️ **${t("raids.status")}**`,
      value: `🟡 **${t("raids.statusDetails.ongoing")}** - ${t("raids.statusDetails.ongoingDescription")}`,
      inline: false,
    });
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

  // Add view details button
  const viewDetailsButton = new ButtonBuilder()
    .setCustomId(`${raids.id}:details:${raid.id}`)
    .setLabel(`📋 ${t("raids.buttons.viewDetails")}`)
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(false);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(signupButton, signoutButton, viewDetailsButton);

  return {
    embeds: [embed],
    components: [row],
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

// Helper function to build composition text with better formatting
async function buildCompositionText(
  slots: RaidSlot[],
  { discord, context }: { discord: Client; context: GuildContext },
): Promise<string> {
  const { t } = context;

  if (slots.length === 0) {
    return t("raids.slots.noSlots");
  }

  const compositionLines = [];
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const slotNumber = (i + 1).toString().padStart(2, "0");
    const roleEmoji = await getSlotEmoji(slot, { discord });

    if (slot.userId) {
      compositionLines.push(`${slotNumber}. ${roleEmoji} **${slot.name}** - <@${slot.userId}>`);
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

  return `${compositionLines.join("\n")}\n\n**${t("raids.slots.roleSummary")}:** ${roleSummary}`;
}
