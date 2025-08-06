import { detectLanguage, type MultiLanguageDictionary } from "./index";

/**
 * Emoji indicators that suggest a line contains a role/slot
 */
export const SLOT_EMOJI_INDICATORS = /[🛡💚⚔🎯🐎❇💀🧊⚡🔴🟢🔵🟡🟣⚫🟤🌿🔥👑]/u;

/**
 * Patterns that indicate a line starts with a build/role name
 */
export const BUILD_START_PATTERNS = [
  /^garra\s*-/i,
  /^patas\s*-/i,
  /^stopper\s*-/i,
  /^healer\s*-/i,
  /^tank\s*-/i,
  /^dps\s*-/i,
  /^support\s*-/i,
  /^caller\s*-/i,
  /^mount\s*-/i,
];

/**
 * Patterns that indicate a line is clearly NOT a slot
 */
export const NON_SLOT_PATTERNS = [
  /^@everyone$/,
  /^@here$/,
  /^set\s+/i,
  /^gear\s+/i,
  /^food\s+/i,
  /^horario\s*:/i,
  /^saida\s+/i,
  /^departure\s+/i,
  /^time\s*:/i,
  /^location\s*:/i,
  /^requirements\s*:/i,
  /^mínimo\s+/i,
  /^minimum\s+/i,
  /^com\s+swaps/i,
  /^with\s+swaps/i,
  /^\*\*.*\*\*$/, // Bold text (often titles/headers)
  /^\/join/i,
  /^\/raid/i,
  /^https?:\/\//, // URLs
  /^equipamento\s+/i, // Equipment lines
  /^dps\s+food/i, // DPS food requirements
];

/**
 * Keywords for different types of requirements
 */
export interface RequirementKeywords {
  foodKeywords: string[];
  mountKeywords: string[];
  buildKeywords: string[];
  colonKeywords: string[];
}

/**
 * Role keywords that indicate a line contains a slot
 */
export interface SlotKeywords {
  roleKeywords: string[];
  roleMentionKeywords: string[];
}

/**
 * Slot keywords by language
 */
export const SLOT_KEYWORDS: MultiLanguageDictionary<SlotKeywords> = {
  en: {
    roleKeywords: ["tank", "healer", "dps", "support", "caller", "mount", "frost", "cursed", "fb", "sc"],
    roleMentionKeywords: ["tank", "healer", "dps", "support", "caller", "mount", "fb", "sc"],
  },
  pt: {
    roleKeywords: [
      "tanque",
      "sanador",
      "suporte",
      "chamador",
      "montaria",
      "fúnebre",
      "paratempo",
      "maça",
      "redenção",
      "pútrido",
      "ártico",
      "fura bruma",
      "garra",
      "patas",
      "stopper",
      "frost",
      "cursed",
      "bestona",
      "susurrante",
      "putrido",
      "artico",
      "canção",
      "cancao",
      "martelo",
      "astral",
      "aguia",
      "buscador",
      "garrinha",
      "braçadeiras",
      "mortificos",
      "cajado",
      "fogo",
      "pustulento",
      "urso",
      "adagas",
      "robe",
      "malévolo",
      "adaga",
      "pata",
      "maca",
      "bruxo",
      "besta",
      "tirão",
      "bilaminado",
      "sussurante",
      "fulgurante",
      "badon",
      "prisma",
      "fb",
      "sc",
    ],
    roleMentionKeywords: [
      "tank",
      "healer",
      "dps",
      "support",
      "caller",
      "mount",
      "fúnebre",
      "paratempo",
      "maça",
      "redenção",
      "pútrido",
      "ártico",
      "fura bruma",
      "buscador",
      "garrinha",
      "braçadeiras",
      "mortificos",
      "cajado",
      "fogo",
      "pustulento",
      "urso",
      "adagas",
      "robe",
      "malévolo",
      "fulgurante",
      "badon",
      "prisma",
      "fb",
      "sc",
    ],
  },
  es: {
    roleKeywords: ["tanque", "sanador", "soporte", "llamador", "montura"],
    roleMentionKeywords: ["tanque", "sanador", "soporte", "llamador", "montura"],
  },
  // Add other languages as needed
  ru: {
    roleKeywords: ["танк", "хилер", "дпс", "саппорт", "коллер", "маунт"],
    roleMentionKeywords: ["танк", "хилер", "дпс", "саппорт", "коллер", "маунт"],
  },
  zh: {
    roleKeywords: ["坦克", "治疗", "输出", "辅助", "指挥", "坐骑"],
    roleMentionKeywords: ["坦克", "治疗", "输出", "辅助", "指挥", "坐骑"],
  },
  fr: {
    roleKeywords: ["tank", "soigneur", "dps", "support", "appeleur", "monture"],
    roleMentionKeywords: ["tank", "soigneur", "dps", "support", "appeleur", "monture"],
  },
  de: {
    roleKeywords: ["panzer", "heiler", "dps", "unterstützung", "rufer", "reittier"],
    roleMentionKeywords: ["panzer", "heiler", "dps", "unterstützung", "rufer", "reittier"],
  },
  ja: {
    roleKeywords: ["タンク", "ヒーラー", "DPS", "サポート", "コーラー", "マウント"],
    roleMentionKeywords: ["タンク", "ヒーラー", "DPS", "サポート", "コーラー", "マウント"],
  },
  ko: {
    roleKeywords: ["탱커", "힐러", "딜러", "서포터", "콜러", "탈것"],
    roleMentionKeywords: ["탱커", "힐러", "딜러", "서포터", "콜러", "탈것"],
  },
};

/**
 * Requirement keywords by language
 */
export const REQUIREMENT_KEYWORDS: MultiLanguageDictionary<RequirementKeywords> = {
  en: {
    foodKeywords: ["food", "energy", "potion", "bread", "sandwich"],
    mountKeywords: ["mount", "wolf", "horse", "swiftclaw", "direwolf", "dire wolf", "mount:", "wolf +"],
    buildKeywords: ["build", "gear", "weapon", "armor"],
    colonKeywords: ["mount", "gear", "food", "build"],
  },
  pt: {
    foodKeywords: [
      "comida",
      "energia",
      "poção",
      "pocao",
      "ruins",
      "ruinas",
      "ruína",
      "ruina",
      "boa",
      "pão",
      "pao",
      "sanduíche",
      "sanduiche",
    ],
    mountKeywords: ["montaria", "lobo", "cavalo", "lobo direto", "montaria:", "lobo +"],
    buildKeywords: ["construção", "construcao", "equipamento", "arma", "armadura"],
    colonKeywords: ["montaria", "equipamento", "comida", "construção", "construcao"],
  },
  // Add other languages as needed
  es: {
    foodKeywords: ["comida", "energía", "poción", "pan", "sandwich"],
    mountKeywords: ["montura", "lobo", "caballo", "montura:"],
    buildKeywords: ["construcción", "equipo", "arma", "armadura"],
    colonKeywords: ["montura", "equipo", "comida", "construcción"],
  },
  ru: {
    foodKeywords: ["еда", "энергия", "зелье", "хлеб", "бутерброд"],
    mountKeywords: ["маунт", "волк", "лошадь", "маунт:"],
    buildKeywords: ["билд", "снаряжение", "оружие", "броня"],
    colonKeywords: ["маунт", "снаряжение", "еда", "билд"],
  },
  zh: {
    foodKeywords: ["食物", "能量", "药水", "面包", "三明治"],
    mountKeywords: ["坐骑", "狼", "马", "坐骑:"],
    buildKeywords: ["构建", "装备", "武器", "护甲"],
    colonKeywords: ["坐骑", "装备", "食物", "构建"],
  },
  fr: {
    foodKeywords: ["nourriture", "énergie", "potion", "pain", "sandwich"],
    mountKeywords: ["monture", "loup", "cheval", "monture:"],
    buildKeywords: ["construction", "équipement", "arme", "armure"],
    colonKeywords: ["monture", "équipement", "nourriture", "construction"],
  },
  de: {
    foodKeywords: ["nahrung", "energie", "trank", "brot", "sandwich"],
    mountKeywords: ["reittier", "wolf", "pferd", "reittier:"],
    buildKeywords: ["build", "ausrüstung", "waffe", "rüstung"],
    colonKeywords: ["reittier", "ausrüstung", "nahrung", "build"],
  },
  ja: {
    foodKeywords: ["食べ物", "エネルギー", "ポーション", "パン", "サンドイッチ"],
    mountKeywords: ["マウント", "狼", "馬", "マウント:"],
    buildKeywords: ["ビルド", "装備", "武器", "防具"],
    colonKeywords: ["マウント", "装備", "食べ物", "ビルド"],
  },
  ko: {
    foodKeywords: ["음식", "에너지", "물약", "빵", "샌드위치"],
    mountKeywords: ["탈것", "늑대", "말", "탈것:"],
    buildKeywords: ["빌드", "장비", "무기", "방어구"],
    colonKeywords: ["탈것", "장비", "음식", "빌드"],
  },
};

/**
 * Get slot keywords for a given text by detecting its language
 */
export function getSlotKeywordsForText(text: string): SlotKeywords {
  const language = detectLanguage(text);
  return SLOT_KEYWORDS[language] || SLOT_KEYWORDS.en;
}

/**
 * Get requirement keywords for a given text by detecting its language
 */
export function getRequirementKeywordsForText(text: string): RequirementKeywords {
  const language = detectLanguage(text);
  return REQUIREMENT_KEYWORDS[language] || REQUIREMENT_KEYWORDS.en;
}
