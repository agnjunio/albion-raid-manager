import { createDiscordTimestamp } from "@albion-raid-manager/discord";
import { type Raid, type RaidSlot } from "@albion-raid-manager/types";
import { getContentTypeInfo, getRaidRoleEmoji } from "@albion-raid-manager/types/entities";
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
  // Determine embed color based on raid status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "#00ff88"; // Bright green for open signups
      case "SCHEDULED":
        return "#ffbd59"; // Amber for scheduled
      case "CLOSED":
        return "#ff4757"; // Red for closed
      case "ONGOING":
        return "#ffbd59"; // Amber for ongoing
      case "FINISHED":
        return "#00ff88"; // Bright green for finished
      case "CANCELLED":
        return "#ff4757"; // Red for cancelled
      default:
        return "#ffbd59";
    }
  };

  // Get status emoji for title
  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "OPEN":
        return "🟢";
      case "SCHEDULED":
        return "🟡";
      case "CLOSED":
        return "🔴";
      case "ONGOING":
        return "▶️";
      case "FINISHED":
        return "👑";
      case "CANCELLED":
        return "❌";
      default:
        return "⚔️";
    }
  };

  const embed = new EmbedBuilder()
    .setColor(getStatusColor(raid.status))
    .setTitle(`${getStatusEmoji(raid.status)} ${raid.title}`)
    .setDescription(raid.description || "Join this exciting raid adventure!")
    .setImage(getRaidBanner(raid.contentType ?? undefined))
    .setFooter({
      text: "Albion Raid Manager • Click the buttons below to join or leave",
    })
    .setTimestamp(new Date(raid.date));

  // Add raid date and time
  embed.addFields({
    name: "📅 Date & Time",
    value: createDiscordTimestamp(raid.date),
    inline: true,
  });

  // Add content type field if available
  if (raid.contentType && raid.contentType !== "OTHER") {
    const contentTypeInfo = getContentTypeInfo(raid.contentType);
    embed.addFields({
      name: "🎯 Content Type",
      value: `${contentTypeInfo.emoji} ${contentTypeInfo.displayName}`,
      inline: true,
    });
  }

  // Add raid type
  embed.addFields({
    name: "⚙️ Raid Type",
    value: raid.type === "FIXED" ? "🔒 Fixed Composition" : "🔄 Flexible",
    inline: true,
  });

  // Add location if available
  if (raid.location) {
    embed.addFields({
      name: "📍 Location",
      value: raid.location,
      inline: true,
    });
  }

  // Add note if available
  if (raid.note) {
    embed.addFields({
      name: "📝 Note",
      value: raid.note,
      inline: false,
    });
  }

  // Build simplified composition display
  const signups = slots.filter((slot) => !!slot.userId);

  if (slots.length > 0) {
    const compositionText = slots
      .map((slot) => {
        const roleEmoji = getRaidRoleEmoji(slot.role ?? undefined);
        if (slot.userId) {
          return `${roleEmoji} **${slot.name}** - <@${slot.userId}>`;
        } else {
          return `${roleEmoji} **${slot.name}**`;
        }
      })
      .join("\n");

    embed.addFields({
      name: `👥 Raid Composition (${signups.length}/${slots.length})`,
      value: compositionText,
      inline: false,
    });
  }

  const signupButton = new ButtonBuilder()
    .setCustomId(`${raids.id}:signup:${raid.id}`)
    .setLabel("🎯 Sign Up")
    .setStyle(ButtonStyle.Success)
    .setDisabled(raid.status !== "OPEN");

  const signoutButton = new ButtonBuilder()
    .setCustomId(`${raids.id}:signout:${raid.id}`)
    .setLabel("❌ Leave")
    .setStyle(ButtonStyle.Danger)
    .setDisabled(raid.status !== "OPEN");

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(signupButton, signoutButton);

  return {
    embeds: [embed],
    components: [row],
  } as unknown as T;
};
