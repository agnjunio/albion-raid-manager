import raidsController from "@/controllers/raids";
import { Build, CompositionBuild, Raid, Role } from "@albion-raid-manager/database/models";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  InteractionReplyOptions,
  MessageCreateOptions,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

export const createRaidAnnouncementMessage = (raid: Raid): MessageCreateOptions => {
  const embed = new EmbedBuilder()
    .setColor("#ffbd59")
    .setTitle("Raid Announcement")
    .setDescription(`A new raid has been scheduled. Click sign up to join.`)
    .setTimestamp(new Date(raid.date));

  const confirm = new ButtonBuilder()
    .setCustomId(`${raidsController.id}:signup:${raid.id}`)
    .setLabel("Sign Up")
    .setEmoji("📜")
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(confirm);

  return {
    embeds: [embed],
    components: [row],
  };
};

export const createRaidSignupReply = (
  raid: Raid,
  builds: (CompositionBuild & { Build: Build })[],
): InteractionReplyOptions => {
  const menu = new StringSelectMenuBuilder()
    .setCustomId(`${raidsController.id}:select:${raid.id}`)
    .setPlaceholder("Select a build");

  const emojis = {
    [Role.CALLER]: "🧠",
    [Role.TANK]: "🛡️",
    [Role.HEALER]: "💚",
    [Role.MEELE_DPS]: "⚔️",
    [Role.RANGED_DPS]: "🏹",
    [Role.SUPPORT]: "💊",
    [Role.BATTLEMOUNT]: "🐎",
  };

  for (const build of builds) {
    const { name, role } = build.Build;
    const option = new StringSelectMenuOptionBuilder()
      .setValue(`${build.id}`)
      .setLabel(name)
      .setEmoji(emojis[role] || "❔");
    menu.addOptions(option);
  }

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

  return {
    content: `Signing up for the raid: ${raid.description}. Please select a build.`,
    ephemeral: true,
    components: [row],
  };
};
