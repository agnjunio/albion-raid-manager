import { logger } from "@albion-raid-manager/core/logger/index";
import { AlbionService } from "@albion-raid-manager/core/services";
import { RaidSlot } from "@albion-raid-manager/types";
import { getRaidRoleEmoji } from "@albion-raid-manager/types/entities";
import { Client } from "discord.js";

interface GetApplicationEmojisProps {
  discord: Client;
}

export async function createAlbionItemEmoji(item: string, { discord }: GetApplicationEmojisProps) {
  if (!discord.application) return;

  const { itemId, enchantment } = AlbionService.items.getItemIdAndEnchantment(item);
  const name = `${itemId}_${enchantment}`;

  try {
    const image = await fetch(AlbionService.items.getAlbionItemImageUrl(itemId, { quality: 4, enchantment }), {
      headers: {
        "Content-Type": "image/png",
      },
    });
    const buffer = Buffer.from(await image.arrayBuffer());
    const emoji = await discord.application.emojis.create({ name, attachment: buffer });
    return emoji;
  } catch (error) {
    logger.warn(`Failed to create Albion item emoji: ${name} / ${error}`, { error });
    return;
  }
}

export async function getSlotEmoji(slot: RaidSlot, { discord }: GetApplicationEmojisProps) {
  if (!slot.weapon || !discord.application) return getRaidRoleEmoji(slot.role);
  if (!discord.application.emojis.cache.size) await discord.application.emojis.fetch();

  const { itemId, enchantment } = AlbionService.items.getItemIdAndEnchantment(slot.weapon);
  const name = `${itemId}_${enchantment}`;

  let emoji = discord.application.emojis.cache.find((emoji) => emoji.name === name);
  if (!emoji?.id) {
    emoji = await createAlbionItemEmoji(slot.weapon, { discord });
  }

  if (!emoji) return getRaidRoleEmoji(slot.role);
  return `<:${emoji.name}:${emoji.id}>`;
}
