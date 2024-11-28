import raidsController from "@/controllers/raids";
import { Build, CompositionSlot, Raid, RaidSignup, Role } from "@albion-raid-manager/database/models";
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
  slots: (CompositionSlot & { Build: Build })[],
  signups?: RaidSignup[],
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
    name: `Composition (${signups?.length || 0}/${slots.length})`,
    value: slots
      .map((slot) => {
        let row = `${emojis[slot.Build.role]} ${slot.Build.name}`;

        const signup = signups?.find((signup) => signup.slotId === slot.id);
        if (signup) row += ` - <@${signup.userId}>`;

        return row;
      })
      .join("\n"),
  });

  const confirm = new ButtonBuilder()
    .setCustomId(`${raidsController.id}:signup:${raid.id}`)
    .setLabel("Sign Up")
    .setEmoji("📜")
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(confirm);

  return {
    embeds: [embed],
    components: [row],
  } as unknown as T;
};

export const createRaidSignupReply = (
  raid: Raid,
  builds: (CompositionSlot & { Build: Build })[],
): InteractionReplyOptions => {
  const menu = new StringSelectMenuBuilder()
    .setCustomId(`${raidsController.id}:select:${raid.id}`)
    .setPlaceholder("Select a build");

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
