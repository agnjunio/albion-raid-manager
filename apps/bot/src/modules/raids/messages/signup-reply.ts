import { type Raid, type RaidSlot } from "@albion-raid-manager/types";
import { getRaidRoleEmoji } from "@albion-raid-manager/types/entities";
import {
  ActionRowBuilder,
  InteractionReplyOptions,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  User,
} from "discord.js";

import { type GuildContext } from "@/modules/guild-context";

import { raids } from "..";

export const buildRaidSignupReply = async (
  raid: Raid,
  slots: RaidSlot[],
  context: GuildContext,
  users?: User[],
): Promise<InteractionReplyOptions> => {
  const placeholder = await context.t("raids.signup.selectBuild");
  const menu = new StringSelectMenuBuilder().setCustomId(`${raids.id}:select:${raid.id}`).setPlaceholder(placeholder);

  for (const slot of slots) {
    // Skip if the slot is already taken
    if (slot.userId) continue;

    let label = slot.name;
    if (slot.userId) {
      label += ` - `;
      const user = users?.find((user) => user.id === slot.userId);
      const takenText = await context.t("raids.slots.taken");
      label += user ? `[${user.displayName}]` : `[${takenText}]`;
    }
    const option = new StringSelectMenuOptionBuilder()
      .setValue(`${slot.id}`)
      .setLabel(label)
      .setEmoji(getRaidRoleEmoji(slot.role));
    menu.addOptions(option);
  }

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

  const content = await context.t("raids.signup.content", {
    description: raid.description || (await context.t("raids.description")),
  });

  return {
    content,
    ephemeral: true,
    components: [row],
  };
};
