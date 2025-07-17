import { RaidRole, type Raid, type RaidSlot } from "@albion-raid-manager/core/types";
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
  parsedData: { location?: string; requirements?: string[] },
): MessageCreateOptions => {
  const embed = new EmbedBuilder()
    .setColor(0x57f287) // Green color for success
    .setTitle("✅ Raid Created Successfully")
    .setDescription(`**${raid.title}**`)
    .addFields(
      { name: "Date", value: raid.date.toLocaleDateString(), inline: true },
      { name: "Status", value: String(raid.status), inline: true },
      { name: "Slots", value: raid.slots ? raid.slots.length.toString() : "0", inline: true },
    )
    .setTimestamp();

  if (parsedData.location) {
    embed.addFields({ name: "Location", value: parsedData.location, inline: true });
  }

  if (parsedData.requirements && parsedData.requirements.length > 0) {
    embed.addFields({ name: "Requirements", value: parsedData.requirements.join(", "), inline: false });
  }

  if (raid.slots && raid.slots.length > 0) {
    const slotList = raid.slots
      .map((slot) => `• ${emojis[slot.role] || emojis.DEFAULT} ${slot.name} — ${slot.role}`)
      .join("\n");
    embed.addFields({ name: "Slots", value: slotList, inline: false });
  }

  return {
    embeds: [embed],
  };
};
