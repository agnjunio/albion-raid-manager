import { createDiscordTimestamp } from "@albion-raid-manager/discord";
import { type Raid, type RaidSlot } from "@albion-raid-manager/types";
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

  const embed = new EmbedBuilder()
    .setColor(getStatusColor(raid.status))
    .setTitle(`${getStatusEmoji(raid.status)} ${raid.title}`)
    .setDescription(raid.description || "Join this exciting raid adventure!")
    .setImage(getRaidBanner(raid.contentType ?? undefined))
    .setFooter({
      text: `Raid ID: ${raid.id}`,
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
