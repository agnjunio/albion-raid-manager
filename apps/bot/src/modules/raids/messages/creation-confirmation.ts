import { getLocation } from "@albion-raid-manager/core/entities";
import { createDiscordTimestamp } from "@albion-raid-manager/discord";
import { type Raid, type RaidSlot } from "@albion-raid-manager/types";
import { getContentTypeInfo, getRaidRoleEmoji } from "@albion-raid-manager/types/entities";
import { EmbedBuilder, MessageCreateOptions } from "discord.js";

export const buildRaidCreationConfirmationMessage = (
  raid: Raid,
  slots: RaidSlot[],
  parsedData: { location?: string; requirements?: string[] },
): MessageCreateOptions => {
  const embed = new EmbedBuilder()
    .setColor(0x57f287) // Green color for success
    .setTitle("✅ Raid Created Successfully")
    .setDescription(`**${raid.title}**`)
    .addFields(
      { name: "Date", value: createDiscordTimestamp(raid.date), inline: true },
      { name: "Status", value: String(raid.status), inline: true },
      { name: "Slots", value: raid.slots ? raid.slots.length.toString() : "0", inline: true },
    )
    .setTimestamp();

  // Add content type field if available
  if (raid.contentType && raid.contentType !== "OTHER") {
    const contentTypeInfo = getContentTypeInfo(raid.contentType);
    embed.addFields({
      name: "Content Type",
      value: `${contentTypeInfo.emoji} ${contentTypeInfo.displayName}`,
      inline: true,
    });
  }

  if (parsedData.location) {
    const location = getLocation(parsedData.location);
    embed.addFields({ name: "Location", value: location.name, inline: true });
  }

  if (parsedData.requirements && parsedData.requirements.length > 0) {
    const requirementsList = parsedData.requirements.map((req) => `• ${req}`).join("\n");
    embed.addFields({ name: "Requirements", value: requirementsList, inline: false });
  }

  if (raid.slots && raid.slots.length > 0) {
    const slotList = raid.slots
      .map((slot) => `${getRaidRoleEmoji(slot.role)} ${slot.name} — ${slot.role || "Unknown"}`)
      .join("\n");
    embed.addFields({ name: "Slots", value: slotList, inline: false });
  }

  return {
    embeds: [embed],
  };
};
