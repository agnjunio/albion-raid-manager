import { ContentType } from "@albion-raid-manager/core/types";

import { detectLanguage, type MultiLanguageDictionary } from "./index";

/**
 * Fixed-size content type mappings based on role count
 */
export const FIXED_SIZE_MAPPINGS = [
  { count: 1, type: "SOLO_DUNGEON" as ContentType },
  { count: 2, type: "DEPTHS_DUO" as ContentType },
  { count: 3, type: "DEPTHS_TRIO" as ContentType },
  { count: 5, type: "HELLGATE_5V5" as ContentType },
  { count: 10, type: "HELLGATE_10V10" as ContentType },
];

/**
 * Patterns that indicate a line is clearly NOT a role
 */
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

/**
 * Role indicators (emojis) that suggest a line contains a role
 */
export const ROLE_INDICATORS = /[🛡💚⚔🎯🐎❇💀🧊⚡🔴🟢🔵🟡🟣⚫🟤🌿🔥]/u;

/**
 * Content type keywords by language for Roads of Avalon content
 */
export interface ContentTypeKeywords {
  pvpKeywords: string[];
  pveKeywords: string[];
}

export const CONTENT_TYPE_KEYWORDS: MultiLanguageDictionary<ContentTypeKeywords> = {
  en: {
    pvpKeywords: ["roaming", "ganking", "pvp", "gank", "roam", "zvz", "small-scale", "small scale"],
    pveKeywords: ["chest", "pve", "golden", "avalon", "ava", "avalonian", "dungeon", "fame farm", "fame farming"],
  },
  pt: {
    pvpKeywords: ["roaming", "ganking", "pvp", "gank", "roam", "zvz", "pequena escala"],
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

export const DEFAULT_OTHER_CONTENT_TYPE = {
  type: "OTHER" as ContentType,
  keywords: [] as string[],
  partySize: { min: 1, max: 20 },
  raidType: "FLEX" as const,
  description: "Other content type",
};

export function getContentTypeKeywordsForText(text: string): ContentTypeKeywords {
  const language = detectLanguage(text);
  return CONTENT_TYPE_KEYWORDS[language] || CONTENT_TYPE_KEYWORDS.en;
}
