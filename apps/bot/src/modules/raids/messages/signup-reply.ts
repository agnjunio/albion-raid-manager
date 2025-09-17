import { type Raid } from "@albion-raid-manager/types";
import {
  ActionRowBuilder,
  Client,
  InteractionReplyOptions,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

import { type GuildContext } from "@/modules/guild-context";
import { getSlotEmoji } from "@/utils/emojis";

import { raids } from "..";

export const buildRaidSignupReply = async (
  raid: Raid,
  { discord, context }: { discord: Client; context: GuildContext },
): Promise<InteractionReplyOptions> => {
  if (!raid.slots) throw new Error("Raid slots not found");

  const users = await Promise.all(
    raid.slots.filter((slot) => !!slot.userId).map(async (slot) => discord.users.fetch(slot.userId as string)),
  );

  const placeholder = await context.t("raids.signup.selectBuild");
  const menu = new StringSelectMenuBuilder().setCustomId(`${raids.id}:select:${raid.id}`).setPlaceholder(placeholder);

  for (const slot of raid.slots) {
    // Skip if the slot is already taken
    if (slot.userId) continue;

    const emoji = await getSlotEmoji(slot, { discord });

    let label = slot.name;
    if (slot.userId) {
      label += ` - `;
      const user = users?.find((user) => user.id === slot.userId);
      const takenText = await context.t("raids.slots.taken");
      label += user ? `[${user.displayName}]` : `[${takenText}]`;
    }
    const option = new StringSelectMenuOptionBuilder().setValue(`${slot.id}`).setLabel(label).setEmoji(emoji);
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
