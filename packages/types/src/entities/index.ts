import { ContentType, RaidType } from "../../generated/index";

export interface ContentTypeInfo {
  type: ContentType;
  partySize: {
    min: number;
    max: number;
  };
  raidType: RaidType;
  description: string;
  displayName: string;
  defaultLocation: string;
  aliases: string[];
  isActive: boolean;
}

export const CONTENT_TYPE_MAPPING: ContentTypeInfo[] = [
  {
    type: "SOLO_DUNGEON",
    partySize: { min: 1, max: 1 },
    raidType: "FIXED",
    description: "Solo dungeon clearing for farming and loot",
    displayName: "Solo Dungeon",
    defaultLocation: "",
    aliases: ["solo", "dg", "dungeon"],
    isActive: false,
  },
  {
    type: "OPEN_WORLD_FARMING",
    partySize: { min: 1, max: 20 },
    raidType: "FLEX",
    description: "Open world farming and resource gathering activities",
    displayName: "Open World Farming",
    defaultLocation: "",
    aliases: ["ow", "farming", "gathering"],
    isActive: false,
  },
  {
    type: "GROUP_DUNGEON",
    partySize: { min: 2, max: 5 },
    raidType: "FLEX",
    description: "Small group dungeon content for 2-5 players",
    displayName: "Group Dungeon",
    defaultLocation: "",
    aliases: ["group", "dg", "dungeon"],
    isActive: false,
  },
  {
    type: "AVALONIAN_DUNGEON_FULL_CLEAR",
    partySize: { min: 20, max: 20 },
    raidType: "FIXED",
    description: "Avalonian Dungeon full clear with all bosses",
    displayName: "Avalonian Dungeon (Full Clear)",
    defaultLocation: "Brecilien",
    aliases: ["avalon", "ava", "full clear"],
    isActive: false,
  },
  {
    type: "AVALONIAN_DUNGEON_BUFF_ONLY",
    partySize: { min: 20, max: 20 },
    raidType: "FIXED",
    description: "Avalonian Dungeon buff only run",
    displayName: "Avalonian Dungeon (Buff Only)",
    defaultLocation: "Brecilien",
    aliases: ["avalon", "ava", "buff only"],
    isActive: false,
  },
  {
    type: "ROADS_OF_AVALON_PVE",
    partySize: { min: 7, max: 7 },
    raidType: "FIXED",
    description: "Roads of Avalon PvE content with golden chests",
    displayName: "Roads of Avalon (PvE)",
    defaultLocation: "Brecilien",
    aliases: ["roads", "roa", "avalon pve"],
    isActive: true,
  },
  {
    type: "ROADS_OF_AVALON_PVP",
    partySize: { min: 7, max: 7 },
    raidType: "FIXED",
    description: "Roads of Avalon PvP content for roaming and ganking",
    displayName: "Roads of Avalon (PvP)",
    defaultLocation: "Brecilien",
    aliases: ["roads", "roa", "avalon pvp"],
    isActive: true,
  },
  {
    type: "DEPTHS_DUO",
    partySize: { min: 2, max: 2 },
    raidType: "FIXED",
    description: "Corrupted Dungeons duo content for 2 players",
    displayName: "Depths (Duo)",
    defaultLocation: "Brecilien",
    aliases: ["depths", "duo", "2v2"],
    isActive: false,
  },
  {
    type: "DEPTHS_TRIO",
    partySize: { min: 3, max: 3 },
    raidType: "FIXED",
    description: "Corrupted Dungeons trio content for 3 players",
    displayName: "Depths (Trio)",
    defaultLocation: "Brecilien",
    aliases: ["depths", "trio", "3v3"],
    isActive: false,
  },
  {
    type: "GANKING_SQUAD",
    partySize: { min: 5, max: 20 },
    raidType: "FLEX",
    description: "Ganking squad for open world PvP",
    displayName: "Ganking Squad",
    defaultLocation: "",
    aliases: ["gank", "ganking", "squad"],
    isActive: false,
  },
  {
    type: "FIGHTING_SQUAD",
    partySize: { min: 5, max: 20 },
    raidType: "FLEX",
    description: "Fighting squad for organized PvP",
    displayName: "Fighting Squad",
    defaultLocation: "",
    aliases: ["fight", "fighting", "squad"],
    isActive: false,
  },
  {
    type: "ZVZ_CALL_TO_ARMS",
    partySize: { min: 20, max: 100 },
    raidType: "FLEX",
    description: "ZvZ call to arms for large scale battles",
    displayName: "ZvZ Call to Arms",
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
    type: "HELLGATE_10V10",
    partySize: { min: 10, max: 10 },
    raidType: "FIXED",
    description: "Hellgate 10v10 PvP content",
    displayName: "Hellgate (10v10)",
    defaultLocation: "Brecilien",
    aliases: ["hellgate", "hg", "10v10"],
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
    partySize: { min: 1, max: 20 },
    raidType: "FLEX",
    description: "Other content type not specifically categorized",
    displayName: "Other",
    defaultLocation: "",
    aliases: ["other", "misc", "miscellaneous"],
    isActive: false,
  },
];

export const getDefaultLocation = (contentType: ContentType): string => {
  const info = CONTENT_TYPE_MAPPING.find((ct) => ct.type === contentType);
  if (!info) return "";

  switch (info.type) {
    case "ROADS_OF_AVALON_PVE":
    case "ROADS_OF_AVALON_PVP":
    case "HELLGATE_5V5":
    case "HELLGATE_10V10":
      return "Brecilien";
    case "DEPTHS_DUO":
    case "DEPTHS_TRIO":
      return "Brecilien";
    case "SOLO_DUNGEON":
    case "MISTS_SOLO":
      return "";
    case "GROUP_DUNGEON":
      return "";
    case "OPEN_WORLD_FARMING":
      return "";
    default:
      return "";
  }
};

// Export active content types list
export const CONTENT_TYPE_LIST: ContentType[] = CONTENT_TYPE_MAPPING.filter((info) => info.isActive).map(
  (info) => info.type,
);
