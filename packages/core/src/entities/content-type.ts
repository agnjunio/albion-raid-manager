import { ContentType, RaidType } from "@albion-raid-manager/types";

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
    type: "AVALONIAN_DUNGEON",
    partySize: { min: 10, max: 20 },
    raidType: "FIXED",
    description: "Avalonian Dungeon content",
    displayName: "Avalonian Dungeon",
    defaultLocation: "Brecilien",
    aliases: ["avalon", "ava"],
    isActive: false,
  },
  {
    type: "ROADS_OF_AVALON",
    partySize: { min: 7, max: 7 },
    raidType: "FIXED",
    description: "Roads of Avalon content with fights and/or golden chests",
    displayName: "Roads of Avalon",
    defaultLocation: "Brecilien",
    aliases: ["roads", "roa", "avalon"],
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
    type: "OPEN_WORLD_GANKING",
    partySize: { min: 5, max: 20 },
    raidType: "FLEX",
    description: "Ganking squad for open world PvP",
    displayName: "Open World Ganking",
    defaultLocation: "",
    aliases: ["gank", "ganking", "squad"],
    isActive: false,
  },
  {
    type: "OPEN_WORLD_SMALL_SCALE",
    partySize: { min: 5, max: 20 },
    raidType: "FLEX",
    description: "Open World small scale PvP",
    displayName: "Open World Small Scale",
    defaultLocation: "",
    aliases: ["small scale", "fighting", "squad"],
    isActive: false,
  },
  {
    type: "OPEN_WORLD_ZVZ",
    partySize: { min: 20, max: 100 },
    raidType: "FLEX",
    description: "ZvZ call to arms for large scale battles",
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
    partySize: { min: 1, max: 20 },
    raidType: "FLEX",
    description: "Other content type not specifically categorized",
    displayName: "Other",
    defaultLocation: "",
    aliases: ["other", "misc", "miscellaneous"],
    isActive: false,
  },
];

export class ContentTypeEntity {
  private info: ContentTypeInfo;

  constructor(contentType: ContentType) {
    const info = CONTENT_TYPE_MAPPING.find((ct) => ct.type === contentType);
    if (!info) {
      throw new Error(`Unknown content type: ${contentType}`);
    }
    this.info = info;
  }

  get type(): ContentType {
    return this.info.type;
  }

  get raidType(): RaidType {
    return this.info.raidType;
  }

  get partySize(): { min: number; max: number } {
    return this.info.partySize;
  }

  get description(): string {
    return this.info.description;
  }

  get aliases(): string[] {
    return this.info.aliases;
  }

  get isFixedSize(): boolean {
    return this.info.partySize.min === this.info.partySize.max;
  }

  get isFlexSize(): boolean {
    return this.info.partySize.min !== this.info.partySize.max;
  }

  get maxPlayers(): number {
    return this.info.partySize.max;
  }

  get minPlayers(): number {
    return this.info.partySize.min;
  }

  get defaultLocation(): string {
    switch (this.info.type) {
      case "ROADS_OF_AVALON":
      case "HELLGATE_2V2":
      case "HELLGATE_5V5":
      case "AVALONIAN_DUNGEON":
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
  }

  getInfo(): ContentTypeInfo {
    return { ...this.info };
  }

  static getInfo(contentType: ContentType): ContentTypeInfo | null {
    return CONTENT_TYPE_MAPPING.find((info) => info.type === contentType) || null;
  }

  static getAllTypes(): ContentType[] {
    return CONTENT_TYPE_MAPPING.map((info) => info.type);
  }

  static getActiveTypes(): ContentType[] {
    return CONTENT_TYPE_MAPPING.filter((info) => info.isActive).map((info) => info.type);
  }

  static getRaidConfiguration(contentType: ContentType): {
    type: RaidType;
    maxPlayers: number;
    shouldCreateSlots: boolean;
  } {
    const entity = new ContentTypeEntity(contentType);

    return {
      type: entity.raidType,
      maxPlayers: entity.maxPlayers,
      shouldCreateSlots: entity.isFixedSize,
    };
  }

  static normalizeFromString(contentType: string): ContentType {
    const normalized = contentType.toUpperCase().replace(/[^A-Z_]/g, "");

    switch (normalized) {
      case "ROADS_OF_AVALON":
      case "AVALON_ROADS":
      case "ROADS":
        return "ROADS_OF_AVALON";
      case "HELLGATE_2V2":
      case "HG_2V2":
      case "HG_2X2":
      case "HELLGATE":
        return "HELLGATE_2V2";
      case "HELLGATE_5V5":
      case "HG_5V5":
      case "HG_5X5":
        return "HELLGATE_5V5";
      case "AVALONIAN_DUNGEON":
      case "AVALON":
      case "AVA":
        return "AVALONIAN_DUNGEON";
      case "DEPTHS_DUO":
      case "DUO":
        return "DEPTHS_DUO";
      case "DEPTHS_TRIO":
      case "TRIO":
        return "DEPTHS_TRIO";
      case "SOLO_DUNGEON":
      case "SOLO":
        return "SOLO_DUNGEON";
      case "MISTS_SOLO":
      case "MISTS":
        return "MISTS_SOLO";
      case "GROUP_DUNGEON":
      case "DUNGEON":
        return "GROUP_DUNGEON";
      case "OPEN_WORLD_FARMING":
      case "OPEN_WORLD":
      case "FARMING":
        return "OPEN_WORLD_FARMING";
      case "OPEN_WORLD_GANKING":
      case "GANKING":
        return "OPEN_WORLD_GANKING";
      case "OPEN_WORLD_SMALL_SCALE":
      case "SMALL_SCALE":
        return "OPEN_WORLD_SMALL_SCALE";
      case "OPEN_WORLD_ZVZ":
      case "ZVZ":
        return "OPEN_WORLD_ZVZ";
      default:
        return "GROUP_DUNGEON";
    }
  }
}

// Export utility functions for backward compatibility
export const getContentTypeInfo = (contentType: ContentType): ContentTypeInfo | null =>
  ContentTypeEntity.getInfo(contentType);

export const getDefaultLocation = (contentType: ContentType): string =>
  new ContentTypeEntity(contentType).defaultLocation;

export const normalizeContentType = (contentType: string): ContentType =>
  ContentTypeEntity.normalizeFromString(contentType);

// Export active content types list
export const CONTENT_TYPE_LIST: ContentType[] = ContentTypeEntity.getActiveTypes();
