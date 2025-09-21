export enum ChannelType {
  TEXT = "TEXT",
  VOICE = "VOICE",
  CATEGORY = "CATEGORY",
}

export type Channel = {
  id: string;
  name: string;
  type: ChannelType;
  parentId?: string;
};

export function fromDiscordChannels(
  discordChannels: Array<{ id: string; name: string | null; type: number; parentId: string | null | undefined }>,
): Channel[] {
  return discordChannels
    .filter((channel) => channel.type === 0 || channel.type === 2 || channel.type === 4) // TEXT, VOICE, CATEGORY
    .map((channel) => ({
      id: channel.id,
      name: channel.name || "Unknown Channel",
      type: channel.type === 0 ? ChannelType.TEXT : channel.type === 2 ? ChannelType.VOICE : ChannelType.CATEGORY,
      parentId: channel.parentId || undefined,
    }))
    .sort((a, b) => {
      // Sort by type first (CATEGORY, then TEXT, then VOICE), then by name
      const typeOrder = { [ChannelType.CATEGORY]: 0, [ChannelType.TEXT]: 1, [ChannelType.VOICE]: 2 };
      const typeComparison = typeOrder[a.type] - typeOrder[b.type];
      if (typeComparison !== 0) return typeComparison;
      return a.name.localeCompare(b.name);
    });
}
