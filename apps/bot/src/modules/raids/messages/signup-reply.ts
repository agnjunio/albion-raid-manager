import { type Raid, type RaidSlot } from "@albion-raid-manager/types";
import { getRaidRoleEmoji } from "@albion-raid-manager/types/entities";
import {
  ActionRowBuilder,
  InteractionReplyOptions,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  User,
} from "discord.js";

import { raids } from "..";

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
    const option = new StringSelectMenuOptionBuilder()
      .setValue(`${slot.id}`)
      .setLabel(label)
      .setEmoji(getRaidRoleEmoji(slot.role));
    menu.addOptions(option);
  }

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

  return {
    content: `Signing up for the raid: ${raid.description}. Please select a build.`,
    ephemeral: true,
    components: [row],
  };
};
