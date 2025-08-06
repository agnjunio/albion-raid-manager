import { ContentType, RaidType } from "@albion-raid-manager/core/types";

/**
 * Content type information with metadata
 */
export interface ContentTypeInfo {
  type: ContentType;
  keywords: string[];
  partySize: {
    min: number;
    max: number;
  };
  raidType: RaidType;
  description: string;
}

/**
 * Comprehensive mapping of Albion Online content types with their metadata
 */
export const CONTENT_TYPE_MAPPING: ContentTypeInfo[] = [
  {
    type: "SOLO_DUNGEON",
    keywords: [
      // English
      "solo dungeon",
      "solo dg",
      "solo dungeon farm",
      "solo dungeon clear",
      "solo dungeon run",
      "solo dg farm",
      "solo dg clear",
      "solo dg run",
      "solo t4",
      "solo t5",
      "solo t6",
      "solo t7",
      "solo t8",
      "solo blue",
      "solo green",
      "solo yellow",
      "solo red",
      "solo black",
      // Portuguese
      "dg solo",
      "masmorra solo",
      "masmorra individual",
      "dg solo farm",
      "dg solo clear",
      "masmorra solo farm",
      "masmorra solo clear",
      // Spanish
      "mazmorra solo",
      "mazmorra individual",
      "mazmorra solo farm",
      "mazmorra solo clear",
      // French
      "donjon solo",
      "donjon individuel",
      "donjon solo farm",
      "donjon solo clear",
      // German
      "solo dungeon",
      "einzeldungeon",
      "einzeldungeon farm",
      "einzeldungeon clear",
    ],
    partySize: { min: 1, max: 1 },
    raidType: "FIXED",
    description: "Solo dungeon clearing for farming and loot",
  },
  {
    type: "OPEN_WORLD_FARMING",
    keywords: [
      // English
      "open world",
      "ow farm",
      "ow farming",
      "open world farm",
      "open world farming",
      "resource gathering",
      "gathering",
      "farming",
      "ow",
      "open world pve",
      "t4",
      "t5",
      "t6",
      "t7",
      "t8",
      "blue",
      "green",
      "yellow",
      "red",
      "black",
      // Portuguese
      "mundo aberto",
      "ow farm",
      "ow farming",
      "farming",
      "coleta",
      "coleta de recursos",
      "fazenda",
      "farmando",
      "farmear",
      "farm mundo aberto",
      "farm ow",
      // Spanish
      "mundo abierto",
      "ow farm",
      "ow farming",
      "recolección",
      "recolección de recursos",
      "granja",
      "farmear",
      "farm mundo abierto",
      "farm ow",
      // French
      "monde ouvert",
      "ow farm",
      "ow farming",
      "récolte",
      "récolte de ressources",
      "ferme",
      "farmer",
      "farm monde ouvert",
      "farm ow",
      // German
      "offene welt",
      "ow farm",
      "ow farming",
      "sammeln",
      "ressourcensammlung",
      "farm",
      "farmen",
      "farm offene welt",
      "farm ow",
    ],
    partySize: { min: 1, max: 20 },
    raidType: "FLEX",
    description: "Open world farming and resource gathering activities",
  },
  {
    type: "GROUP_DUNGEON",
    keywords: [
      // English
      "group dungeon",
      "group dg",
      "dungeon",
      "dg",
      "group",
      "5 man",
      "5man",
      "5 player",
      "5player",
      "five man",
      "five player",
      "small group",
      "dungeon group",
      "dg group",
      "group farm",
      "group clear",
      // Portuguese
      "grupo dungeon",
      "grupo dg",
      "masmorra grupo",
      "grupo",
      "5 pessoas",
      "5pessoas",
      "cinco pessoas",
      "grupo pequeno",
      "masmorra",
      "dg",
      "grupo farm",
      "grupo clear",
      // Spanish
      "grupo mazmorra",
      "grupo dg",
      "mazmorra grupo",
      "grupo",
      "5 personas",
      "5personas",
      "cinco personas",
      "grupo pequeño",
      "mazmorra",
      "dg",
      "grupo farm",
      "grupo clear",
      // French
      "groupe donjon",
      "groupe dg",
      "donjon groupe",
      "groupe",
      "5 personnes",
      "5personnes",
      "cinq personnes",
      "petit groupe",
      "donjon",
      "dg",
      "groupe farm",
      "groupe clear",
      // German
      "gruppe dungeon",
      "gruppe dg",
      "dungeon gruppe",
      "gruppe",
      "5 leute",
      "5leute",
      "fünf leute",
      "kleine gruppe",
      "dungeon",
      "dg",
      "gruppe farm",
      "gruppe clear",
    ],
    partySize: { min: 2, max: 5 },
    raidType: "FLEX",
    description: "Small group dungeon content for 2-5 players",
  },
  {
    type: "ROADS_OF_AVALON_PVE",
    keywords: [
      // English
      "roads",
      "roads of avalon",
      "roa",
      "avalon roads",
      "7 man",
      "7man",
      "7 player",
      "7player",
      "seven man",
      "seven player",
      "roads pve",
      "avalon pve",
      "golden chest",
      "baú dourado",
      "bau dourado",
      "baú",
      "bau",
      "chest",
      "avalon chest",
      "roads chest",
      // Portuguese
      "estradas",
      "estradas de avalon",
      "estradas avalon",
      "roa",
      "7 pessoas",
      "7pessoas",
      "sete pessoas",
      "estradas pve",
      "avalon pve",
      "baú dourado",
      "bau dourado",
      "baú",
      "bau",
      "baú avalon",
      "bau avalon",
      "baú estradas",
      "bau estradas",
      // Spanish
      "caminos",
      "caminos de avalon",
      "caminos avalon",
      "roa",
      "7 personas",
      "7personas",
      "siete personas",
      "caminos pve",
      "avalon pve",
      "cofre dorado",
      "cofre",
      "cofre avalon",
      "cofre caminos",
      // French
      "routes",
      "routes d'avalon",
      "routes avalon",
      "roa",
      "7 personnes",
      "7personnes",
      "sept personnes",
      "routes pve",
      "avalon pve",
      "coffre doré",
      "coffre",
      "coffre avalon",
      "coffre routes",
      // German
      "straßen",
      "straßen von avalon",
      "straßen avalon",
      "roa",
      "7 leute",
      "7leute",
      "sieben leute",
      "straßen pve",
      "avalon pve",
      "goldene truhe",
      "truhe",
      "avalon truhe",
      "straßen truhe",
    ],
    partySize: { min: 7, max: 7 },
    raidType: "FIXED",
    description: "Roads of Avalon PvE content with golden chests",
  },
  {
    type: "DEPTHS_DUO",
    keywords: [
      // English
      "depths",
      "corrupteds",
      "corrupted",
      "depths duo",
      "depths 2v2",
      "depths 2vs2",
      "depths 2 man",
      "depths 2man",
      "depths 2 player",
      "depths 2player",
      "duo",
      "2v2",
      "2vs2",
      "2 man",
      "2man",
      "2 player",
      "2player",
      "two man",
      "two player",
      // Portuguese
      "profundezas",
      "corrompidos",
      "corrompido",
      "profundezas duo",
      "profundezas 2v2",
      "profundezas 2vs2",
      "profundezas 2 pessoas",
      "profundezas 2pessoas",
      "duo",
      "2v2",
      "2vs2",
      "2 pessoas",
      "2pessoas",
      "duas pessoas",
      // Spanish
      "profundidades",
      "corruptos",
      "corrupto",
      "profundidades duo",
      "profundidades 2v2",
      "profundidades 2vs2",
      "profundidades 2 personas",
      "profundidades 2personas",
      "duo",
      "2v2",
      "2vs2",
      "2 personas",
      "2personas",
      "dos personas",
      // French
      "profondeurs",
      "corrompus",
      "corrompu",
      "profondeurs duo",
      "profondeurs 2v2",
      "profondeurs 2vs2",
      "profondeurs 2 personnes",
      "profondeurs 2personnes",
      "duo",
      "2v2",
      "2vs2",
      "2 personnes",
      "2personnes",
      "deux personnes",
      // German
      "tiefen",
      "korrumpierte",
      "korrumpiert",
      "tiefen duo",
      "tiefen 2v2",
      "tiefen 2vs2",
      "tiefen 2 leute",
      "tiefen 2leute",
      "duo",
      "2v2",
      "2vs2",
      "2 leute",
      "2leute",
      "zwei leute",
    ],
    partySize: { min: 2, max: 2 },
    raidType: "FIXED",
    description: "Corrupted Dungeons duo content for 2 players",
  },
  {
    type: "DEPTHS_TRIO",
    keywords: [
      // English
      "depths trio",
      "depths 3v3",
      "depths 3vs3",
      "depths 3 man",
      "depths 3man",
      "depths 3 player",
      "depths 3player",
      "trio",
      "3v3",
      "3vs3",
      "3 man",
      "3man",
      "3 player",
      "3player",
      "three man",
      "three player",
      // Portuguese
      "profundezas trio",
      "profundezas 3v3",
      "profundezas 3vs3",
      "profundezas 3 pessoas",
      "profundezas 3pessoas",
      "trio",
      "3v3",
      "3vs3",
      "3 pessoas",
      "3pessoas",
      "três pessoas",
      // Spanish
      "profundidades trio",
      "profundidades 3v3",
      "profundidades 3vs3",
      "profundidades 3 personas",
      "profundidades 3personas",
      "trio",
      "3v3",
      "3vs3",
      "3 personas",
      "3personas",
      "tres personas",
      // French
      "profondeurs trio",
      "profondeurs 3v3",
      "profondeurs 3vs3",
      "profondeurs 3 personnes",
      "profondeurs 3personnes",
      "trio",
      "3v3",
      "3vs3",
      "3 personnes",
      "3personnes",
      "trois personnes",
      // German
      "tiefen trio",
      "tiefen 3v3",
      "tiefen 3vs3",
      "tiefen 3 leute",
      "tiefen 3leute",
      "trio",
      "3v3",
      "3vs3",
      "3 leute",
      "3leute",
      "drei leute",
    ],
    partySize: { min: 3, max: 3 },
    raidType: "FIXED",
    description: "Corrupted Dungeons trio content for 3 players",
  },
  {
    type: "HELLGATE_5V5",
    keywords: [
      // English
      "hellgate",
      "hg",
      "hellgate 5v5",
      "hellgate 5vs5",
      "hg 5v5",
      "hg 5vs5",
      "hg 5x5",
      "hellgate 5x5",
      "5v5",
      "5vs5",
      "5x5",
      "5 man hellgate",
      "5man hellgate",
      "5 player hellgate",
      "5player hellgate",
      "five man hellgate",
      "five player hellgate",
      // Portuguese
      "portão infernal",
      "portao infernal",
      "hg",
      "portão infernal 5v5",
      "portao infernal 5v5",
      "portão infernal 5vs5",
      "portao infernal 5vs5",
      "hg 5v5",
      "hg 5vs5",
      "hg 5x5",
      "portão infernal 5x5",
      "portao infernal 5x5",
      "5v5",
      "5vs5",
      "5x5",
      "5 pessoas hg",
      "5pessoas hg",
      "cinco pessoas hg",
      // Spanish
      "puerta infernal",
      "hg",
      "puerta infernal 5v5",
      "puerta infernal 5vs5",
      "hg 5v5",
      "hg 5vs5",
      "hg 5x5",
      "puerta infernal 5x5",
      "5v5",
      "5vs5",
      "5x5",
      "5 personas hg",
      "5personas hg",
      "cinco personas hg",
      // French
      "porte infernale",
      "hg",
      "porte infernale 5v5",
      "porte infernale 5vs5",
      "hg 5v5",
      "hg 5vs5",
      "hg 5x5",
      "porte infernale 5x5",
      "5v5",
      "5vs5",
      "5x5",
      "5 personnes hg",
      "5personnes hg",
      "cinq personnes hg",
      // German
      "höllentor",
      "hg",
      "höllentor 5v5",
      "höllentor 5vs5",
      "hg 5v5",
      "hg 5vs5",
      "hg 5x5",
      "höllentor 5x5",
      "5v5",
      "5vs5",
      "5x5",
      "5 leute hg",
      "5leute hg",
      "fünf leute hg",
    ],
    partySize: { min: 5, max: 5 },
    raidType: "FIXED",
    description: "Hellgate 5v5 PvP content",
  },
  {
    type: "HELLGATE_10V10",
    keywords: [
      // English
      "hellgate 10v10",
      "hellgate 10vs10",
      "hg 10v10",
      "hg 10vs10",
      "hg 10x10",
      "hellgate 10x10",
      "10v10",
      "10vs10",
      "10x10",
      "10 man hellgate",
      "10man hellgate",
      "10 player hellgate",
      "10player hellgate",
      "ten man hellgate",
      "ten player hellgate",
      // Portuguese
      "portão infernal 10v10",
      "portao infernal 10v10",
      "portão infernal 10vs10",
      "portao infernal 10vs10",
      "hg 10v10",
      "hg 10vs10",
      "hg 10x10",
      "portão infernal 10x10",
      "portao infernal 10x10",
      "10v10",
      "10vs10",
      "10x10",
      "10 pessoas hg",
      "10pessoas hg",
      "dez pessoas hg",
      // Spanish
      "puerta infernal 10v10",
      "puerta infernal 10vs10",
      "hg 10v10",
      "hg 10vs10",
      "hg 10x10",
      "puerta infernal 10x10",
      "10v10",
      "10vs10",
      "10x10",
      "10 personas hg",
      "10personas hg",
      "diez personas hg",
      // French
      "porte infernale 10v10",
      "porte infernale 10vs10",
      "hg 10v10",
      "hg 10vs10",
      "hg 10x10",
      "porte infernale 10x10",
      "10v10",
      "10vs10",
      "10x10",
      "10 personnes hg",
      "10personnes hg",
      "dix personnes hg",
      // German
      "höllentor 10v10",
      "höllentor 10vs10",
      "hg 10v10",
      "hg 10vs10",
      "hg 10x10",
      "höllentor 10x10",
      "10v10",
      "10vs10",
      "10x10",
      "10 leute hg",
      "10leute hg",
      "zehn leute hg",
    ],
    partySize: { min: 10, max: 10 },
    raidType: "FIXED",
    description: "Hellgate 10v10 PvP content",
  },
  {
    type: "MISTS_SOLO",
    keywords: [
      // English
      "mists",
      "mists solo",
      "mists 1v1",
      "mists 1vs1",
      "mists 1 man",
      "mists 1man",
      "mists 1 player",
      "mists 1player",
      "mist",
      "solo mists",
      "1v1 mists",
      "1vs1 mists",
      "1 man mists",
      "1man mists",
      "1 player mists",
      "1player mists",
      // Portuguese
      "névoas",
      "nevoas",
      "névoas solo",
      "nevoas solo",
      "névoas 1v1",
      "nevoas 1v1",
      "névoas 1vs1",
      "nevoas 1vs1",
      "névoas 1 pessoa",
      "nevoas 1 pessoa",
      "névoas 1pessoa",
      "nevoas 1pessoa",
      "solo névoas",
      "solo nevoas",
      "1v1 névoas",
      "1v1 nevoas",
      "1vs1 névoas",
      "1vs1 nevoas",
      // Spanish
      "nieblas",
      "nieblas solo",
      "nieblas 1v1",
      "nieblas 1vs1",
      "nieblas 1 persona",
      "nieblas 1persona",
      "solo nieblas",
      "1v1 nieblas",
      "1vs1 nieblas",
      // French
      "brumes",
      "brumes solo",
      "brumes 1v1",
      "brumes 1vs1",
      "brumes 1 personne",
      "brumes 1personne",
      "solo brumes",
      "1v1 brumes",
      "1vs1 brumes",
      // German
      "nebel",
      "nebel solo",
      "nebel 1v1",
      "nebel 1vs1",
      "nebel 1 person",
      "nebel 1person",
      "solo nebel",
      "1v1 nebel",
      "1vs1 nebel",
    ],
    partySize: { min: 1, max: 1 },
    raidType: "FIXED",
    description: "Mists solo PvP content",
  },
];

/**
 * Content Type Entity - Represents a specific type of content in Albion Online
 */
export class ContentTypeEntity {
  private info: ContentTypeInfo;

  constructor(contentType: ContentType) {
    const info = CONTENT_TYPE_MAPPING.find((ct) => ct.type === contentType);
    if (!info) {
      throw new Error(`Unknown content type: ${contentType}`);
    }
    this.info = info;
  }

  /**
   * Get the content type
   */
  get type(): ContentType {
    return this.info.type;
  }

  /**
   * Get the raid type (FIXED or FLEX)
   */
  get raidType(): RaidType {
    return this.info.raidType;
  }

  /**
   * Get the party size range
   */
  get partySize(): { min: number; max: number } {
    return this.info.partySize;
  }

  /**
   * Get the description
   */
  get description(): string {
    return this.info.description;
  }

  /**
   * Get all keywords for this content type
   */
  get keywords(): string[] {
    return this.info.keywords;
  }

  /**
   * Check if this content type has a fixed party size
   */
  get isFixedSize(): boolean {
    return this.info.partySize.min === this.info.partySize.max;
  }

  /**
   * Get the default location for this content type
   */
  get defaultLocation(): string {
    switch (this.info.type) {
      case "ROADS_OF_AVALON_PVE":
      case "HELLGATE_5V5":
      case "HELLGATE_10V10":
        return "Brecilien";
      case "DEPTHS_DUO":
      case "DEPTHS_TRIO":
        return "Brecilien";
      case "SOLO_DUNGEON":
      case "MISTS_SOLO":
        return "Bridgewatch";
      case "GROUP_DUNGEON":
        return "Bridgewatch";
      case "OPEN_WORLD_FARMING":
        return "Bridgewatch";
      default:
        return "Bridgewatch";
    }
  }

  /**
   * Check if a message matches this content type based on keywords
   */
  matchesMessage(message: string): { matches: boolean; confidence: number } {
    const normalizedMessage = message.toLowerCase().trim();
    let matchCount = 0;

    for (const keyword of this.info.keywords) {
      if (normalizedMessage.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }

    const confidence = matchCount / this.info.keywords.length;
    return {
      matches: confidence > 0,
      confidence: Math.max(confidence, matchCount > 0 ? 0.3 : 0),
    };
  }

  /**
   * Get the complete content type information
   */
  getInfo(): ContentTypeInfo {
    return { ...this.info };
  }

  /**
   * Static method to get content type info by type
   */
  static getInfo(contentType: ContentType): ContentTypeInfo | null {
    return CONTENT_TYPE_MAPPING.find((info) => info.type === contentType) || null;
  }

  /**
   * Static method to get all available content types
   */
  static getAllTypes(): ContentType[] {
    return CONTENT_TYPE_MAPPING.map((info) => info.type);
  }

  /**
   * Static method to detect content type from message
   */
  static detectFromMessage(message: string): { type: ContentType; confidence: number; info: ContentTypeInfo } | null {
    const lowerMessage = message.toLowerCase();

    // Avalon Roads (7 players)
    if (lowerMessage.includes("roads") || lowerMessage.includes("avalon")) {
      const info = CONTENT_TYPE_MAPPING.find((ct) => ct.type === "ROADS_OF_AVALON_PVE");
      if (info) return { type: "ROADS_OF_AVALON_PVE", confidence: 0.9, info };
    }

    // Hellgates
    if (lowerMessage.includes("hellgate") || lowerMessage.includes("hg")) {
      if (lowerMessage.includes("10v10") || lowerMessage.includes("10vs10")) {
        const info = CONTENT_TYPE_MAPPING.find((ct) => ct.type === "HELLGATE_10V10");
        if (info) return { type: "HELLGATE_10V10", confidence: 0.9, info };
      }
      if (lowerMessage.includes("5v5") || lowerMessage.includes("5vs5")) {
        const info = CONTENT_TYPE_MAPPING.find((ct) => ct.type === "HELLGATE_5V5");
        if (info) return { type: "HELLGATE_5V5", confidence: 0.9, info };
      }
      const info = CONTENT_TYPE_MAPPING.find((ct) => ct.type === "HELLGATE_5V5");
      if (info) return { type: "HELLGATE_5V5", confidence: 0.7, info };
    }

    // Depths
    if (lowerMessage.includes("depths")) {
      if (lowerMessage.includes("duo") || lowerMessage.includes("2v2")) {
        const info = CONTENT_TYPE_MAPPING.find((ct) => ct.type === "DEPTHS_DUO");
        if (info) return { type: "DEPTHS_DUO", confidence: 0.9, info };
      }
      if (lowerMessage.includes("trio") || lowerMessage.includes("3v3")) {
        const info = CONTENT_TYPE_MAPPING.find((ct) => ct.type === "DEPTHS_TRIO");
        if (info) return { type: "DEPTHS_TRIO", confidence: 0.9, info };
      }
      const info = CONTENT_TYPE_MAPPING.find((ct) => ct.type === "DEPTHS_DUO");
      if (info) return { type: "DEPTHS_DUO", confidence: 0.7, info };
    }

    // Solo content
    if (lowerMessage.includes("solo") || lowerMessage.includes("1v1")) {
      if (lowerMessage.includes("mists")) {
        const info = CONTENT_TYPE_MAPPING.find((ct) => ct.type === "MISTS_SOLO");
        if (info) return { type: "MISTS_SOLO", confidence: 0.9, info };
      }
      const info = CONTENT_TYPE_MAPPING.find((ct) => ct.type === "SOLO_DUNGEON");
      if (info) return { type: "SOLO_DUNGEON", confidence: 0.8, info };
    }

    // Group dungeons
    if (lowerMessage.includes("dungeon") || lowerMessage.includes("dungeons")) {
      const info = CONTENT_TYPE_MAPPING.find((ct) => ct.type === "GROUP_DUNGEON");
      if (info) return { type: "GROUP_DUNGEON", confidence: 0.7, info };
    }

    // Open world
    if (lowerMessage.includes("open world") || lowerMessage.includes("farming") || lowerMessage.includes("gathering")) {
      const info = CONTENT_TYPE_MAPPING.find((ct) => ct.type === "OPEN_WORLD_FARMING");
      if (info) return { type: "OPEN_WORLD_FARMING", confidence: 0.6, info };
    }

    return null;
  }

  /**
   * Static method to normalize content type from string
   */
  static normalizeFromString(contentType: string): ContentType {
    const normalized = contentType.toUpperCase().replace(/[^A-Z_]/g, "");

    switch (normalized) {
      case "ROADS_OF_AVALON_PVE":
      case "AVALON_ROADS":
      case "ROADS":
        return "ROADS_OF_AVALON_PVE";
      case "HELLGATE_2V2":
      case "HG_2V2":
      case "HG_2X2":
      case "HELLGATE":
        return "HELLGATE_2V2";
      case "HELLGATE_5V5":
      case "HG_5V5":
      case "HG_5X5":
        return "HELLGATE_5V5";
      case "HELLGATE_10V10":
      case "HG_10V10":
      case "HG_10X10":
        return "HELLGATE_10V10";
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

export const detectContentType = (
  message: string,
): { type: ContentType; confidence: number; partySize: { min: number; max: number } } | null => {
  const result = ContentTypeEntity.detectFromMessage(message);
  if (!result) return null;

  return {
    type: result.type,
    confidence: result.confidence,
    partySize: result.info.partySize,
  };
};
