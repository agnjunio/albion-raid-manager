import { createDiscordTimestamp } from "@albion-raid-manager/core/utils/discord";
import { type Raid, type RaidRole, type RaidSlot } from "@albion-raid-manager/types";
import { getContentTypeInfo, getRaidRoleEmoji, RAID_STATUS_INFO } from "@albion-raid-manager/types/entities";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageCreateOptions,
  MessageEditOptions,
} from "discord.js";

import { raids } from "..";
import { getRaidBanner } from "../helpers";

export const buildRaidAnnouncementMessage = <T extends MessageCreateOptions | MessageEditOptions>(
  raid: Raid,
  slots: RaidSlot[],
): T => {
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
    .setDescription(raid.description || "Join this exciting raid adventure!")
    .setImage(getRaidBanner(raid.contentType ?? undefined))
    .setFooter({
      text: `Raid ID: ${raid.id}`,
    })
    .setTimestamp(new Date(raid.date));

  // Add raid date and time with better formatting
  embed.addFields({
    name: "📅 **Date & Time**",
    value: createDiscordTimestamp(raid.date),
    inline: true,
  });

  // Add content type field with party size info
  if (raid.contentType && raid.contentType !== "OTHER") {
    embed.addFields({
      name: "🎯 **Content Type**",
      value: `${contentTypeInfo?.emoji} **${contentTypeInfo?.displayName}**`,
      inline: true,
    });
  }

  // Add location if available
  if (raid.location) {
    embed.addFields({
      name: "📍 **Location**",
      value: raid.location,
      inline: true,
    });
  }

  // Add raid composition with enhanced display
  if (slots.length > 0) {
    const compositionText = buildCompositionText(slots, signups, totalSlots);

    embed.addFields({
      name: `👥 **Raid Composition** (${filledSlots}/${totalSlots})`,
      value: compositionText,
      inline: false,
    });

    // Add progress indicator
    embed.addFields({
      name: "📊 **Progress**",
      value: `${progressBar} **${fillPercentage}%** filled`,
      inline: false,
    });
  }

  // Add note if available with better formatting
  if (raid.note) {
    embed.addFields({
      name: "📝 **Important Notes**",
      value: `\`\`\`\n${raid.note}\n\`\`\``,
      inline: false,
    });
  }

  // Check if all slots are taken
  const allSlotsTaken = slots.length > 0 && slots.every((slot) => !!slot.userId);

  // Add status-specific information
  if (raid.status === "OPEN") {
    const statusMessage = allSlotsTaken
      ? "🔴 **Raid Full** - All slots are taken, but you can still join the waitlist!"
      : "🟢 **Open for Signups** - Click the button below to join!";

    embed.addFields({
      name: "✅ **Status**",
      value: statusMessage,
      inline: false,
    });
  } else if (raid.status === "CLOSED") {
    embed.addFields({
      name: "❌ **Status**",
      value: "🔴 **Signups Closed** - Raid is full or closed for new participants",
      inline: false,
    });
  } else if (raid.status === "ONGOING") {
    embed.addFields({
      name: "▶️ **Status**",
      value: "🟡 **Raid in Progress** - The adventure has begun!",
      inline: false,
    });
  }

  // Create enhanced buttons
  const signupButton = new ButtonBuilder()
    .setCustomId(`${raids.id}:signup:${raid.id}`)
    .setLabel(allSlotsTaken ? "🎯 Full" : "🎯 Sign Up")
    .setStyle(ButtonStyle.Success)
    .setDisabled(raid.status !== "OPEN" || allSlotsTaken);

  const signoutButton = new ButtonBuilder()
    .setCustomId(`${raids.id}:signout:${raid.id}`)
    .setLabel("❌ Leave")
    .setStyle(ButtonStyle.Danger)
    .setDisabled(raid.status !== "OPEN");

  // Add view details button
  const viewDetailsButton = new ButtonBuilder()
    .setCustomId(`${raids.id}:details:${raid.id}`)
    .setLabel("📋 View Details")
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
function buildCompositionText(slots: RaidSlot[], _signups: RaidSlot[], _totalSlots: number): string {
  if (slots.length === 0) {
    return "No slots configured yet.";
  }

  const compositionLines = slots.map((slot, index) => {
    const roleEmoji = getRaidRoleEmoji(slot.role ?? undefined);
    const slotNumber = (index + 1).toString().padStart(2, "0");

    if (slot.userId) {
      return `${slotNumber}. ${roleEmoji} **${slot.name}** - <@${slot.userId}>`;
    } else {
      return `${slotNumber}. ${roleEmoji} **${slot.name}** - *Available*`;
    }
  });

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

  return `${compositionLines.join("\n")}\n\n**Role Summary:** ${roleSummary}`;
}
