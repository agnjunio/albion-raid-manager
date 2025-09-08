import { ContentTypeInfo } from "@albion-raid-manager/core/entities";
import { ContentType } from "@albion-raid-manager/types";

import { detectLanguages, type MultiLanguageDictionary } from "./index";

export interface ContentTypeDictionary {
  pvpKeywords: string[];
  pveKeywords: string[];
}

export interface ContentTypeKeywords {
  [key: string]: string[];
}

export const CONTENT_TYPE_KEYWORDS: MultiLanguageDictionary<ContentTypeDictionary> = {
  en: {
    pvpKeywords: [
      "roaming",
      "ganking",
      "pvp",
      "gank",
      "roam",
      "zvz",
      "small-scale",
      "small scale",
      "roads",
      "avalon roads",
    ],
    pveKeywords: ["chest", "pve", "golden", "avalon", "ava", "avalonian", "dungeon", "fame farm", "fame farming"],
  },
  pt: {
    pvpKeywords: [
      "roaming",
      "ganking",
      "pvp",
      "gank",
      "roam",
      "zvz",
      "pequena escala",
      "estradas",
      "estradas de avalon",
    ],
    pveKeywords: ["baú", "bau", "pve", "dourado", "avalon", "ava", "avaloniano", "masmorra", "farm de fama"],
  },
  es: {
    pvpKeywords: ["roaming", "ganking", "pvp", "gank", "roam", "zvz", "pequeña escala"],
    pveKeywords: ["cofre", "pve", "dorado", "avalon", "ava", "avaloniano", "mazmorra", "farmeo de fama"],
  },
  ru: {
    pvpKeywords: ["роуминг", "ганк", "пвп", "pvp", "ганкинг", "звз", "zvz", "малая группа"],
    pveKeywords: ["сундук", "пве", "pve", "золотой", "авалон", "авалонский", "подземелье", "фарм славы"],
  },
  zh: {
    pvpKeywords: ["漫游", "抓人", "pvp", "PVP", "团战", "小规模"],
    pveKeywords: ["宝箱", "pve", "PVE", "金色", "阿瓦隆", "地牢", "刷声望"],
  },
  fr: {
    pvpKeywords: ["roaming", "ganking", "pvp", "gank", "roam", "zvz", "petite échelle"],
    pveKeywords: ["coffre", "pve", "doré", "avalon", "ava", "avalonien", "donjon", "farm de renommée"],
  },
  de: {
    pvpKeywords: ["roaming", "ganking", "pvp", "gank", "roam", "zvz", "kleiner maßstab"],
    pveKeywords: ["truhe", "pve", "golden", "avalon", "ava", "avalonisch", "verlies", "ruhm farmen"],
  },
  ja: {
    pvpKeywords: ["ローミング", "ギャンキング", "pvp", "ギャンク", "zvz", "小規模"],
    pveKeywords: ["チェスト", "pve", "ゴールデン", "アヴァロン", "ダンジョン", "名声ファーム"],
  },
  ko: {
    pvpKeywords: ["로밍", "갱킹", "pvp", "갱크", "zvz", "소규모"],
    pveKeywords: ["상자", "pve", "골든", "아발론", "던전", "명성 파밍"],
  },
};

export const FIXED_SIZE_MAPPINGS = [
  { count: 1, type: "SOLO_DUNGEON" as ContentType },
  { count: 2, type: "DEPTHS_DUO" as ContentType },
  { count: 3, type: "DEPTHS_TRIO" as ContentType },
  { count: 5, type: "HELLGATE_5V5" as ContentType },
  { count: 10, type: "HELLGATE_10V10" as ContentType },
];

export const NON_ROLE_PATTERNS = [
  /^roaming\s+as\s+\d{1,2}:\d{2}$/i,
  /^build\s+t\d+$/i,
  /^\d+\s+food\s+/i,
  /^montaria:\s+/i,
  /^@everyone$/i,
  /^@here$/i,
  /^https?:\/\//,
  /^\*\*.*\*\*$/,
];

export const ROLE_INDICATORS = /[🛡💚⚔🎯🐎❇💀🧊⚡🔴🟢🔵🟡🟣⚫🟤🌿🔥]/u;

export const DEFAULT_OTHER_CONTENT_TYPE: ContentTypeInfo = {
  type: "OTHER" as ContentType,
  partySize: { min: 1, max: 20 },
  raidType: "FLEX" as const,
  description: "Other content type",
  displayName: "Other",
  defaultLocation: "",
  aliases: ["other", "misc", "miscellaneous"],
  isActive: true,
};

/**
 * Comprehensive multilingual keywords for each content type
 */
export const CONTENT_TYPE_KEYWORDS_MAPPING: MultiLanguageDictionary<ContentTypeKeywords> = {
  en: {
    SOLO_DUNGEON: [
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
    ],
    OPEN_WORLD_FARMING: [
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
    ],
    GROUP_DUNGEON: [
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
    ],
    ROADS_OF_AVALON_PVE: [
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
      "chest",
      "avalon chest",
      "roads chest",
    ],
    ROADS_OF_AVALON_PVP: [
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
      "roads pvp",
      "avalon pvp",
      "roaming",
      "ganking",
      "pvp",
      "player vs player",
      "roads gank",
      "avalon gank",
      "roads roam",
      "avalon roam",
    ],
    DEPTHS_DUO: [
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
    ],
    DEPTHS_TRIO: [
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
    ],
    HELLGATE_5V5: [
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
    ],
    HELLGATE_10V10: [
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
    ],
    MISTS_SOLO: [
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
    ],
    MISTS_DUO: [
      "mists duo",
      "mists 2v2",
      "mists 2vs2",
      "mists 2 man",
      "mists 2man",
      "mists 2 player",
      "mists 2player",
      "duo mists",
      "2v2 mists",
      "2vs2 mists",
    ],
    GANKING_SQUAD: ["ganking squad", "gank squad", "ganking", "gank", "squad", "roaming", "roam"],
    FIGHTING_SQUAD: ["fighting squad", "fight squad", "fighting", "fight", "squad", "organized pvp"],
    ZVZ_CALL_TO_ARMS: ["zvz", "call to arms", "cta", "zerg", "large scale", "mass pvp", "territory war"],
    AVALONIAN_DUNGEON_FULL_CLEAR: [
      "avalon",
      "ava",
      "avalon dungeon",
      "full clear",
      "avalon full clear",
      "dungeon full clear",
    ],
    AVALONIAN_DUNGEON_BUFF_ONLY: ["avalon", "ava", "avalon dungeon", "buff only", "avalon buff", "dungeon buff"],
    HELLGATE_2V2: [
      "hellgate 2v2",
      "hellgate 2vs2",
      "hg 2v2",
      "hg 2vs2",
      "hg 2x2",
      "hellgate 2x2",
      "2v2",
      "2vs2",
      "2x2",
      "2 man hellgate",
      "2man hellgate",
      "2 player hellgate",
      "2player hellgate",
    ],
    OTHER: ["other", "misc", "miscellaneous", "unknown"],
  },
  pt: {
    SOLO_DUNGEON: [
      "dg solo",
      "masmorra solo",
      "masmorra individual",
      "dg solo farm",
      "dg solo clear",
      "masmorra solo farm",
      "masmorra solo clear",
    ],
    OPEN_WORLD_FARMING: [
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
    ],
    GROUP_DUNGEON: [
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
    ],
    ROADS_OF_AVALON_PVE: [
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
    ],
    ROADS_OF_AVALON_PVP: [
      "estradas",
      "estradas de avalon",
      "estradas avalon",
      "roa",
      "7 pessoas",
      "7pessoas",
      "sete pessoas",
      "estradas pvp",
      "avalon pvp",
      "roaming",
      "ganking",
      "pvp",
      "estradas gank",
      "avalon gank",
      "estradas roam",
      "avalon roam",
    ],
    DEPTHS_DUO: [
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
    ],
    DEPTHS_TRIO: [
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
    ],
    HELLGATE_5V5: [
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
    ],
    HELLGATE_10V10: [
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
    ],
    MISTS_SOLO: [
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
    ],
    MISTS_DUO: ["névoas duo", "nevoas duo", "névoas 2v2", "nevoas 2v2", "duo névoas", "duo nevoas"],
    GANKING_SQUAD: ["esquadrão ganking", "esquadrão gank", "ganking", "gank", "esquadrão", "roaming"],
    FIGHTING_SQUAD: ["esquadrão luta", "esquadrão fight", "luta", "fight", "esquadrão"],
    ZVZ_CALL_TO_ARMS: ["zvz", "chamada às armas", "cta", "zerg", "grande escala", "guerra territorial"],
    AVALONIAN_DUNGEON_FULL_CLEAR: ["avalon", "ava", "masmorra avalon", "limpeza completa", "avalon limpeza"],
    AVALONIAN_DUNGEON_BUFF_ONLY: ["avalon", "ava", "masmorra avalon", "só buff", "avalon buff"],
    HELLGATE_2V2: ["portão infernal 2v2", "portao infernal 2v2", "hg 2v2", "hg 2vs2", "2v2", "2vs2"],
    OTHER: ["outro", "misc", "diversos", "desconhecido"],
  },
  // Add more languages as needed...
};

/**
 * Get content type dictionary for multiple languages detected in text
 *
 * @param text The text to analyze
 * @returns Combined content type dictionary from detected languages
 */
export function getContentTypeDictionaryForText(text: string): ContentTypeDictionary {
  const detectedLanguages = detectLanguages(text);

  if (detectedLanguages.length === 0) {
    return CONTENT_TYPE_KEYWORDS.en;
  }

  const combinedDictionary: ContentTypeDictionary = {
    pvpKeywords: [],
    pveKeywords: [],
  };

  detectedLanguages.forEach((detectedLanguage) => {
    const langKeywords = CONTENT_TYPE_KEYWORDS[detectedLanguage.language] || CONTENT_TYPE_KEYWORDS.en;
    combinedDictionary.pvpKeywords.push(...langKeywords.pvpKeywords);
    combinedDictionary.pveKeywords.push(...langKeywords.pveKeywords);
  });

  combinedDictionary.pvpKeywords = [...new Set(combinedDictionary.pvpKeywords)];
  combinedDictionary.pveKeywords = [...new Set(combinedDictionary.pveKeywords)];

  return combinedDictionary;
}

/**
 * Get keywords for a specific content type in multiple languages
 *
 * @param contentType The content type to get keywords for
 * @param text The text to analyze for language detection
 * @returns Array of keywords for the content type
 */
export function getContentTypeKeywords(contentType: ContentType, text: string): string[] {
  const detectedLanguages = detectLanguages(text);
  const keywords: string[] = [];

  if (detectedLanguages.length === 0) {
    // Default to English if no language detected
    const enKeywords = CONTENT_TYPE_KEYWORDS_MAPPING.en[contentType] || [];
    keywords.push(...enKeywords);
  } else {
    // Add keywords from all detected languages
    detectedLanguages.forEach((detectedLanguage) => {
      const langKeywords = CONTENT_TYPE_KEYWORDS_MAPPING[detectedLanguage.language]?.[contentType] || [];
      keywords.push(...langKeywords);
    });
  }

  // Remove duplicates and return
  return [...new Set(keywords)];
}

/**
 * Check if a message matches a content type based on multilingual keywords
 *
 * @param message The message to check
 * @param contentType The content type to match against
 * @returns Object with match result and confidence
 */
export function matchesContentType(
  message: string,
  contentType: ContentType,
): { matches: boolean; confidence: number } {
  const keywords = getContentTypeKeywords(contentType, message);
  const normalizedMessage = message.toLowerCase().trim();
  let matchCount = 0;

  for (const keyword of keywords) {
    if (normalizedMessage.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  }

  const confidence = keywords.length > 0 ? matchCount / keywords.length : 0;
  return {
    matches: confidence > 0,
    confidence: Math.max(confidence, matchCount > 0 ? 0.3 : 0),
  };
}
