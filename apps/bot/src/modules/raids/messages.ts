import { RaidRole, type ContentType, type Raid, type RaidSlot } from "@albion-raid-manager/core/types";
import { createDiscordTimestamp } from "@albion-raid-manager/discord";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  InteractionReplyOptions,
  MessageCreateOptions,
  MessageEditOptions,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  User,
} from "discord.js";

import { raids } from ".";

const emojis: Record<RaidRole | "DEFAULT", string> = {
  DEFAULT: "❔",
  CALLER: "🧠",
  TANK: "🛡️",
  HEALER: "💚",
  MELEE_DPS: "⚔️",
  RANGED_DPS: "🏹",
  SUPPORT: "💊",
  BATTLEMOUNT: "🐎",
};

// Content type emojis
const contentTypeEmojis: Record<ContentType, string> = {
  SOLO_DUNGEON: "🏰",
  OPEN_WORLD_FARMING: "🌾",
  GROUP_DUNGEON: "⚔️",
  AVALONIAN_DUNGEON_FULL_CLEAR: "👑",
  AVALONIAN_DUNGEON_BUFF_ONLY: "⚡",
  ROADS_OF_AVALON_PVE: "🛤️",
  ROADS_OF_AVALON_PVP: "🗡️",
  DEPTHS_DUO: "🕳️",
  DEPTHS_TRIO: "🕳️",
  GANKING_SQUAD: "🎭",
  FIGHTING_SQUAD: "⚔️",
  ZVZ_CALL_TO_ARMS: "🏰",
  HELLGATE_2V2: "🔥",
  HELLGATE_5V5: "🔥",
  HELLGATE_10V10: "🔥",
  MISTS_SOLO: "🌫️",
  MISTS_DUO: "🌫️",
  OTHER: "❓",
};

// Content type display names
const contentTypeNames: Record<ContentType, string> = {
  SOLO_DUNGEON: "Solo Dungeon",
  OPEN_WORLD_FARMING: "Open World Farming",
  GROUP_DUNGEON: "Group Dungeon",
  AVALONIAN_DUNGEON_FULL_CLEAR: "Avalonian Dungeon (Full Clear)",
  AVALONIAN_DUNGEON_BUFF_ONLY: "Avalonian Dungeon (Buff Only)",
  ROADS_OF_AVALON_PVE: "Roads of Avalon (PvE)",
  ROADS_OF_AVALON_PVP: "Roads of Avalon (PvP)",
  DEPTHS_DUO: "Depths (Duo)",
  DEPTHS_TRIO: "Depths (Trio)",
  GANKING_SQUAD: "Ganking Squad",
  FIGHTING_SQUAD: "Fighting Squad",
  ZVZ_CALL_TO_ARMS: "ZvZ/Call to Arms",
  HELLGATE_2V2: "Hellgate (2v2)",
  HELLGATE_5V5: "Hellgate (5v5)",
  HELLGATE_10V10: "Hellgate (10v10)",
  MISTS_SOLO: "Mists (Solo)",
  MISTS_DUO: "Mists (Duo)",
  OTHER: "Other",
};

export const buildRaidAnnouncementMessage = <T extends MessageCreateOptions | MessageEditOptions>(
  raid: Raid,
  slots: RaidSlot[],
): T => {
  const embed = new EmbedBuilder()
    .setColor("#ffbd59")
    .setTitle(raid.description)
    .setDescription(`Raid is open for registration! Click sign up to join.`)
    .setFooter({
      text: "Powered by Albion Raid Manager",
    })
    .setTimestamp(new Date(raid.date));

  embed.addFields({
    name: "Status",
    value: raid.status,
  });

  // Add content type field if available
  if (raid.contentType && raid.contentType !== "OTHER") {
    const contentTypeEmoji = contentTypeEmojis[raid.contentType];
    const contentTypeName = contentTypeNames[raid.contentType];
    embed.addFields({
      name: "Content Type",
      value: `${contentTypeEmoji} ${contentTypeName}`,
      inline: true,
    });
  }

  const signups = slots.filter((slot) => !!slot.userId);
  embed.addFields({
    name: `Composition (${signups.length}/${slots.length})`,
    value: slots
      .map((slot) => {
        let row = `${emojis.DEFAULT} ${slot.name}`;
        if (slot.userId) row += ` - <@${slot.userId}>`;
        return row;
      })
      .join("\n"),
  });

  const signupButton = new ButtonBuilder()
    .setCustomId(`${raids.id}:signup:${raid.id}`)
    .setLabel("Sign Up")
    .setStyle(ButtonStyle.Success);

  const signoutButon = new ButtonBuilder()
    .setCustomId(`${raids.id}:signout:${raid.id}`)
    .setLabel("Leave")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(signupButton, signoutButon);

  return {
    embeds: [embed],
    components: [row],
  } as unknown as T;
};

export const buildRaidSignupReply = (raid: Raid, slots: RaidSlot[], users?: User[]): InteractionReplyOptions => {
  const menu = new StringSelectMenuBuilder()
    .setCustomId(`${raids.id}:select:${raid.id}`)
    .setPlaceholder("Select a build");

  for (const slot of slots) {
    let label = slot.name;
    if (slot.userId) {
      label += ` - `;
      const user = users?.find((user) => user.id === slot.userId);
      label += user ? `[${user.displayName}]` : `[Taken]`;
    }
    const option = new StringSelectMenuOptionBuilder().setValue(`${slot.id}`).setLabel(label).setEmoji(emojis.DEFAULT);
    menu.addOptions(option);
  }

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

  return {
    content: `Signing up for the raid: ${raid.description}. Please select a build.`,
    ephemeral: true,
    components: [row],
  };
};

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
    const contentTypeEmoji = contentTypeEmojis[raid.contentType];
    const contentTypeName = contentTypeNames[raid.contentType];
    embed.addFields({
      name: "Content Type",
      value: `${contentTypeEmoji} ${contentTypeName}`,
      inline: true,
    });
  }

  if (parsedData.location) {
    embed.addFields({ name: "Location", value: parsedData.location, inline: true });
  }

  if (parsedData.requirements && parsedData.requirements.length > 0) {
    const requirementsList = parsedData.requirements.map((req) => `• ${req}`).join("\n");
    embed.addFields({ name: "Requirements", value: requirementsList, inline: false });
  }

  if (raid.slots && raid.slots.length > 0) {
    const slotList = raid.slots
      .map((slot) => `${emojis[slot.role] || emojis.DEFAULT} ${slot.name} — ${slot.role}`)
      .join("\n");
    embed.addFields({ name: "Slots", value: slotList, inline: false });
  }

  return {
    embeds: [embed],
  };
};
