import { getLocation } from "@albion-raid-manager/core/entities";
import { createDiscordTimestamp } from "@albion-raid-manager/core/utils/discord";
import { type Raid, type RaidSlot } from "@albion-raid-manager/types";
import { getContentTypeInfo, getRaidRoleEmoji } from "@albion-raid-manager/types/entities";
import { EmbedBuilder, MessageCreateOptions } from "discord.js";

import { type GuildContext } from "@/modules/guild-context";

export const buildRaidCreationConfirmationMessage = async (
  raid: Raid,
  slots: RaidSlot[],
  context: GuildContext,
  parsedData: { location?: string; requirements?: string[] },
): Promise<MessageCreateOptions> => {
  const title = await context.t("raids.creation.successTitle");
  const dateLabel = await context.t("raids.creation.date");
  const statusLabel = await context.t("raids.creation.status");
  const slotsLabel = await context.t("raids.creation.slots");

  const embed = new EmbedBuilder()
    .setColor(0x57f287) // Green color for success
    .setTitle(title)
    .setDescription(`**${raid.title}**`)
    .addFields(
      { name: dateLabel, value: createDiscordTimestamp(raid.date), inline: true },
      { name: statusLabel, value: String(raid.status), inline: true },
      { name: slotsLabel, value: raid.slots ? raid.slots.length.toString() : "0", inline: true },
    )
    .setTimestamp();

  // Add content type field if available
  if (raid.contentType && raid.contentType !== "OTHER") {
    const contentTypeInfo = getContentTypeInfo(raid.contentType);
    const contentTypeLabel = await context.t("raids.creation.contentType");
    embed.addFields({
      name: contentTypeLabel,
      value: `${contentTypeInfo.emoji} ${contentTypeInfo.displayName}`,
      inline: true,
    });
  }

  if (parsedData.location) {
    const location = getLocation(parsedData.location);
    const locationLabel = await context.t("raids.creation.location");
    embed.addFields({ name: locationLabel, value: location.name, inline: true });
  }

  if (parsedData.requirements && parsedData.requirements.length > 0) {
    const requirementsList = parsedData.requirements.map((req) => `• ${req}`).join("\n");
    const requirementsLabel = await context.t("raids.creation.requirements");
    embed.addFields({ name: requirementsLabel, value: requirementsList, inline: false });
  }

  if (raid.slots && raid.slots.length > 0) {
    const slotList = raid.slots
      .map((slot) => `${getRaidRoleEmoji(slot.role)} ${slot.name} — ${slot.role || "Unknown"}`)
      .join("\n");
    const slotsListLabel = await context.t("raids.creation.slotsList");
    embed.addFields({ name: slotsListLabel, value: slotList, inline: false });
  }

  return {
    embeds: [embed],
  };
};
