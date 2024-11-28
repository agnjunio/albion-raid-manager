import raidsController from "@/controllers/raids";
import { Build, Raid, RaidSlot, Role } from "@albion-raid-manager/database/models";
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

const emojis = {
  [Role.CALLER]: "🧠",
  [Role.TANK]: "🛡️",
  [Role.HEALER]: "💚",
  [Role.MEELE_DPS]: "⚔️",
  [Role.RANGED_DPS]: "🏹",
  [Role.SUPPORT]: "💊",
  [Role.BATTLEMOUNT]: "🐎",
};

export const getRaidAnnouncementMessage = <T extends MessageCreateOptions | MessageEditOptions>(
  raid: Raid,
  slots: (RaidSlot & { build: Build })[],
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
      .sort((a, b) => a.id - b.id)
      .map((slot) => {
        let row = `${emojis[slot.build.role]} ${slot.build.name}`;
        if (slot.userId) row += ` - <@${slot.userId}>`;
        return row;
      })
      .join("\n"),
  });

  const signupButton = new ButtonBuilder()
    .setCustomId(`${raidsController.id}:signup:${raid.id}`)
    .setLabel("Sign Up")
    .setStyle(ButtonStyle.Success);

  const signoutButon = new ButtonBuilder()
    .setCustomId(`${raidsController.id}:signout:${raid.id}`)
    .setLabel("Leave")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(signupButton, signoutButon);

  return {
    embeds: [embed],
    components: [row],
  } as unknown as T;
};

export const createRaidSignupReply = (
  raid: Raid,
  slots: (RaidSlot & { build: Build })[],
  users?: User[],
): InteractionReplyOptions => {
  const menu = new StringSelectMenuBuilder()
    .setCustomId(`${raidsController.id}:select:${raid.id}`)
    .setPlaceholder("Select a build");

  for (const slot of slots.sort((a, b) => a.id - b.id)) {
    const { name, role } = slot.build;
    let label = name;
    if (slot.userId) {
      label += ` - `;
      const user = users?.find((user) => user.id === slot.userId);
      label += user ? `[${user.displayName}]` : `[Taken]`;
    }
    const option = new StringSelectMenuOptionBuilder()
      .setValue(`${slot.id}`)
      .setLabel(label)
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
