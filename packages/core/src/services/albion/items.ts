interface GetAlbionItemImageUrlProps {
  enchantment?: 0 | 1 | 2 | 3 | 4;
  quality?: 0 | 1 | 2 | 3 | 4 | 5;
}

export function getItemIdAndEnchantment(item: string): { itemId: string; enchantment: 0 | 1 | 2 | 3 | 4 } {
  const match = item.match(/@(\d+)$/);
  if (match) {
    return { itemId: item.replace(/@\d+$/, ""), enchantment: Number(match[1]) as 0 | 1 | 2 | 3 | 4 };
  }
  return { itemId: item, enchantment: 0 };
}

export function getAlbionItemImageUrl(item: string, { enchantment = 0, quality = 0 }: GetAlbionItemImageUrlProps = {}) {
  return `https://render.albiononline.com/v1/item/${item}${enchantment > 0 ? `@${enchantment}` : ""}?quality=${quality}`;
}
