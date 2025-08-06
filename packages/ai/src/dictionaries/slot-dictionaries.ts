import { detectLanguages, type MultiLanguageDictionary } from "./index";

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
export interface SlotDictionary {
  roleKeywords: string[];
  roleMentionKeywords: string[];
  foodKeywords: string[];
  mountKeywords: string[];
  buildKeywords: string[];
  colonKeywords: string[];
}

/**
 * Slot keywords by language
 */
export const SLOT_KEYWORDS: MultiLanguageDictionary<SlotDictionary> = {
  en: {
    roleKeywords: ["tank", "healer", "dps", "support", "caller", "mount", "frost", "cursed", "fb", "sc"],
    roleMentionKeywords: ["tank", "healer", "dps", "support", "caller", "mount", "fb", "sc"],
    foodKeywords: ["food", "energy", "potion", "bread", "sandwich"],
    mountKeywords: ["mount", "wolf", "horse", "swiftclaw", "direwolf", "dire wolf", "mount:", "wolf +"],
    buildKeywords: ["build", "gear", "weapon", "armor"],
    colonKeywords: ["mount", "gear", "food", "build"],
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
  es: {
    roleKeywords: ["tanque", "sanador", "soporte", "llamador", "montura"],
    roleMentionKeywords: ["tanque", "sanador", "soporte", "llamador", "montura"],
    foodKeywords: ["comida", "energía", "poción", "pan", "sandwich"],
    mountKeywords: ["montura", "lobo", "caballo", "montura:"],
    buildKeywords: ["construcción", "equipo", "arma", "armadura"],
    colonKeywords: ["montura", "equipo", "comida", "construcción"],
  },
  // Add other languages as needed
  ru: {
    roleKeywords: ["танк", "хилер", "дпс", "саппорт", "коллер", "маунт"],
    roleMentionKeywords: ["танк", "хилер", "дпс", "саппорт", "коллер", "маунт"],
    foodKeywords: ["еда", "энергия", "зелье", "хлеб", "бутерброд"],
    mountKeywords: ["маунт", "волк", "лошадь", "маунт:"],
    buildKeywords: ["билд", "снаряжение", "оружие", "броня"],
    colonKeywords: ["маунт", "снаряжение", "еда", "билд"],
  },
  zh: {
    roleKeywords: ["坦克", "治疗", "输出", "辅助", "指挥", "坐骑"],
    roleMentionKeywords: ["坦克", "治疗", "输出", "辅助", "指挥", "坐骑"],
    foodKeywords: ["食物", "能量", "药水", "面包", "三明治"],
    mountKeywords: ["坐骑", "狼", "马", "坐骑:"],
    buildKeywords: ["构建", "装备", "武器", "护甲"],
    colonKeywords: ["坐骑", "装备", "食物", "构建"],
  },
  fr: {
    roleKeywords: ["tank", "soigneur", "dps", "support", "appeleur", "monture"],
    roleMentionKeywords: ["tank", "soigneur", "dps", "support", "appeleur", "monture"],
    foodKeywords: ["nourriture", "énergie", "potion", "pain", "sandwich"],
    mountKeywords: ["monture", "loup", "cheval", "monture:"],
    buildKeywords: ["construction", "équipement", "arme", "armure"],
    colonKeywords: ["monture", "équipement", "nourriture", "construction"],
  },
  de: {
    roleKeywords: ["panzer", "heiler", "dps", "unterstützung", "rufer", "reittier"],
    roleMentionKeywords: ["panzer", "heiler", "dps", "unterstützung", "rufer", "reittier"],
    foodKeywords: ["nahrung", "energie", "trank", "brot", "sandwich"],
    mountKeywords: ["reittier", "wolf", "pferd", "reittier:"],
    buildKeywords: ["build", "ausrüstung", "waffe", "rüstung"],
    colonKeywords: ["reittier", "ausrüstung", "nahrung", "build"],
  },
  ja: {
    roleKeywords: ["タンク", "ヒーラー", "DPS", "サポート", "コーラー", "マウント"],
    roleMentionKeywords: ["タンク", "ヒーラー", "DPS", "サポート", "コーラー", "マウント"],
    foodKeywords: ["食べ物", "エネルギー", "ポーション", "パン", "サンドイッチ"],
    mountKeywords: ["マウント", "狼", "馬", "マウント:"],
    buildKeywords: ["ビルド", "装備", "武器", "防具"],
    colonKeywords: ["マウント", "装備", "食べ物", "ビルド"],
  },
  ko: {
    roleKeywords: ["탱커", "힐러", "딜러", "서포터", "콜러", "탈것"],
    roleMentionKeywords: ["탱커", "힐러", "딜러", "서포터", "콜러", "탈것"],
    foodKeywords: ["음식", "에너지", "물약", "빵", "샌드위치"],
    mountKeywords: ["탈것", "늑대", "말", "탈것:"],
    buildKeywords: ["빌드", "장비", "무기", "방어구"],
    colonKeywords: ["탈것", "장비", "음식", "빌드"],
  },
};

/**
 * Get slot keywords for multiple languages detected in text
 *
 * @param text The text to analyze
 * @returns Combined slot keywords from detected languages
 */
export function getSlotDictionaryForText(text: string): SlotDictionary {
  const detectedLanguages = detectLanguages(text);

  if (detectedLanguages.length === 0) {
    return SLOT_KEYWORDS.en;
  }

  const combinedDictionary: SlotDictionary = {
    roleKeywords: [],
    roleMentionKeywords: [],
    foodKeywords: [],
    mountKeywords: [],
    buildKeywords: [],
    colonKeywords: [],
  };

  detectedLanguages.forEach((detectedLanguage) => {
    const langKeywords = SLOT_KEYWORDS[detectedLanguage.language] || SLOT_KEYWORDS.en;
    combinedDictionary.roleKeywords.push(...langKeywords.roleKeywords);
    combinedDictionary.roleMentionKeywords.push(...langKeywords.roleMentionKeywords);
    combinedDictionary.foodKeywords.push(...langKeywords.foodKeywords);
    combinedDictionary.mountKeywords.push(...langKeywords.mountKeywords);
    combinedDictionary.buildKeywords.push(...langKeywords.buildKeywords);
    combinedDictionary.colonKeywords.push(...langKeywords.colonKeywords);
  });

  combinedDictionary.roleKeywords = [...new Set(combinedDictionary.roleKeywords)];
  combinedDictionary.roleMentionKeywords = [...new Set(combinedDictionary.roleMentionKeywords)];
  combinedDictionary.foodKeywords = [...new Set(combinedDictionary.foodKeywords)];
  combinedDictionary.mountKeywords = [...new Set(combinedDictionary.mountKeywords)];
  combinedDictionary.buildKeywords = [...new Set(combinedDictionary.buildKeywords)];
  combinedDictionary.colonKeywords = [...new Set(combinedDictionary.colonKeywords)];

  return combinedDictionary;
}
