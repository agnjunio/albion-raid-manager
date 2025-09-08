import { ContentType, RaidType } from "@albion-raid-manager/types";

export type ContentTypeInfo = {
  type: ContentType;
  partySize: {
    min?: number;
    max?: number;
  };
  raidType: RaidType;
  description: string;
  displayName: string;
  defaultLocation?: string;
  aliases: string[];
  isActive: boolean;
};

export const CONTENT_TYPE_INFO: ContentTypeInfo[] = [
  {
    type: "SOLO_DUNGEON",
    partySize: { min: 1, max: 1 },
    raidType: "FIXED",
    description: "Solo dungeon clearing for farming and loot",
    displayName: "Solo Dungeon",
    aliases: ["solo", "dg", "dungeon"],
    isActive: false,
  },
  {
    type: "OPEN_WORLD_FARMING",
    partySize: { min: 1, max: 20 },
    raidType: "FLEX",
    description: "Open world farming and resource gathering activities. Suitable for police content.",
    displayName: "Open World Farming",
    aliases: ["ow", "farming", "gathering"],
    isActive: false,
  },
  {
    type: "GROUP_DUNGEON",
    partySize: { min: 0, max: 5 },
    raidType: "FLEX",
    description: "Small group dungeon content for 2-5 players",
    displayName: "Group Dungeon",
    aliases: ["group", "dg", "dungeon"],
    isActive: false,
  },
  {
    type: "AVALONIAN_DUNGEON",
    partySize: { min: 10, max: 20 },
    raidType: "FIXED",
    description: "Avalonian Dungeon",
    displayName: "Avalonian Dungeon",
    aliases: ["avalon", "ava", "buff only"],
    isActive: false,
  },
  {
    type: "ROADS_OF_AVALON",
    partySize: { min: 7, max: 7 },
    raidType: "FIXED",
    description: "Roads of Avalon content with fights and/or golden chests",
    displayName: "Roads of Avalon",
    aliases: ["roads", "roa", "avalon pve"],
    isActive: true,
    defaultLocation: "Brecilien",
  },
  {
    type: "DEPTHS_DUO",
    partySize: { min: 2, max: 2 },
    raidType: "FIXED",
    description: "Corrupted Dungeons duo content for 2 players",
    displayName: "Depths (Duo)",
    aliases: ["depths", "duo", "2v2"],
    isActive: false,
  },
  {
    type: "DEPTHS_TRIO",
    partySize: { min: 3, max: 3 },
    raidType: "FIXED",
    description: "Corrupted Dungeons trio content for 3 players",
    displayName: "Depths (Trio)",
    aliases: ["depths", "trio", "3v3"],
    isActive: false,
  },
  {
    type: "OPEN_WORLD_GANKING",
    partySize: { min: 0, max: 20 },
    raidType: "FLEX",
    description: "Ganking squad for open world PvP",
    displayName: "Open World Ganking",
    aliases: ["gank", "ganking", "squad"],
    isActive: false,
  },
  {
    type: "OPEN_WORLD_SMALL_SCALE",
    partySize: { min: 0, max: 20 },
    raidType: "FLEX",
    description: "Open World ",
    displayName: "Open World Small Scale",
    defaultLocation: "",
    aliases: ["small scale", "small scale roaming", "squad"],
    isActive: false,
  },
  {
    type: "OPEN_WORLD_ZVZ",
    partySize: { min: 0, max: 100 },
    raidType: "FLEX",
    description: "Open World ZvZ for large scale battles. Suited for Guild's calls to arms.",
    displayName: "Open World ZvZ (CTA)",
    defaultLocation: "",
    aliases: ["zvz", "call to arms", "cta"],
    isActive: false,
  },
  {
    type: "HELLGATE_2V2",
    partySize: { min: 2, max: 2 },
    raidType: "FIXED",
    description: "Hellgate 2v2 PvP content",
    displayName: "Hellgate (2v2)",
    defaultLocation: "Brecilien",
    aliases: ["hellgate", "hg", "2v2"],
    isActive: false,
  },
  {
    type: "HELLGATE_5V5",
    partySize: { min: 5, max: 5 },
    raidType: "FIXED",
    description: "Hellgate 5v5 PvP content",
    displayName: "Hellgate (5v5)",
    defaultLocation: "Brecilien",
    aliases: ["hellgate", "hg", "5v5"],
    isActive: false,
  },
  {
    type: "MISTS_SOLO",
    partySize: { min: 1, max: 1 },
    raidType: "FIXED",
    description: "Mists solo PvP content",
    displayName: "Mists (Solo)",
    defaultLocation: "",
    aliases: ["mists", "solo", "1v1"],
    isActive: false,
  },
  {
    type: "MISTS_DUO",
    partySize: { min: 2, max: 2 },
    raidType: "FIXED",
    description: "Mists duo PvP content",
    displayName: "Mists (Duo)",
    defaultLocation: "",
    aliases: ["mists", "duo", "2v2"],
    isActive: false,
  },
  {
    type: "OTHER",
    partySize: { min: 0, max: 0 },
    raidType: "FLEX",
    description: "Other content type not specifically categorized",
    displayName: "Other",
    defaultLocation: "",
    aliases: ["other", "misc", "miscellaneous"],
    isActive: true,
  },
];

// Convenience function to get the content type info for a given content type
export function getContentTypeInfo(contentType?: string): ContentTypeInfo {
  const otherContentTypeInfo = CONTENT_TYPE_INFO.find((cti) => cti.type === "OTHER");
  if (!otherContentTypeInfo) {
    throw new Error("Other content type not found");
  }
  const contentTypeInfo = CONTENT_TYPE_INFO.find((cti) => cti.type === contentType);
  return contentTypeInfo ?? otherContentTypeInfo;
}
