import { detectLanguages, type MultiLanguageDictionary } from "./index";

/**
 * Emoji indicators that suggest a line contains a role/slot
 * Includes both Unicode emojis and Discord custom emoji format
 */
export const SLOT_EMOJI_INDICATORS = /[🛡💚⚔🎯🐎❇💀🧊⚡🔴🟢🔵🟡🟣⚫🟤🌿🔥👑]|<:[^:]+:\d+>/u;

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
  buildStartPatterns: RegExp[];
  nonSlotPatterns: RegExp[];
}

/**
 * Slot keywords by language
 */
export const SLOT_DICTIONARIES: MultiLanguageDictionary<SlotDictionary> = {
  en: {
    roleKeywords: ["tank", "healer", "dps", "support", "caller", "mount", "frost", "cursed", "fb", "sc"],
    roleMentionKeywords: ["tank", "healer", "dps", "support", "caller", "mount", "fb", "sc"],
    foodKeywords: ["food", "energy", "potion", "bread", "sandwich"],
    mountKeywords: ["mount", "wolf", "horse", "swiftclaw", "direwolf", "dire wolf", "mount:", "wolf +"],
    buildKeywords: ["build", "gear", "weapon", "armor"],
    colonKeywords: ["mount", "gear", "food", "build"],
    buildStartPatterns: [
      /^garra\s*-/i,
      /^patas\s*-/i,
      /^stopper\s*-/i,
      /^healer\s*-/i,
      /^tank\s*-/i,
      /^dps\s*-/i,
      /^support\s*-/i,
      /^caller\s*-/i,
      /^mount\s*-/i,
    ],
    nonSlotPatterns: [
      /^@everyone$/,
      /^@here$/,
      /^roaming\s+as\s+\d{1,2}:\d{2}/i, // "Roaming as 20:30" patterns
      /^set\s+/i,
      /^gear\s+/i,
      /^food\s+/i,
      /^time\s*:/i,
      /^location\s*:/i,
      /^requirements\s*:/i,
      /^minimum\s+/i,
      /^with\s+swaps/i,
      /^\*\*.*\*\*$/, // Bold text (often titles/headers)
      /^\/join/i,
      /^\/raid/i,
      /^https?:\/\//, // URLs
      /^equipment\s+/i,
      /^dps\s+food/i,
      /^build\s+t\d+/i,
      /^\d+\s+food\s+(boa|bread)/i,
      /^mount\s*:/i,
    ],
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
    buildStartPatterns: [
      /^garra\s*-/i,
      /^patas\s*-/i,
      /^stopper\s*-/i,
      /^tanque\s*-/i,
      /^sanador\s*-/i,
      /^suporte\s*-/i,
      /^chamador\s*-/i,
      /^montaria\s*-/i,
      /^martelo\s*-/i,
      /^cajado\s*-/i,
    ],
    nonSlotPatterns: [
      /^@everyone$/,
      /^@here$/,
      /^roaming\s+as\s+\d{1,2}:\d{2}/i, // "Roaming as 20:30" patterns (English)
      /^roaming\s+em\s+\d{1,2}:\d{2}/i, // "Roaming em 20:30" patterns (Portuguese alt)
      /^build\s+t\d+/i, // "Build T8" patterns
      /^\d+\s+food\s+boa/i, // Food requirements starting with numbers
      /^montaria\s*:/i, // Mount specifications
      /^horario\s*:/i,
      /^saida\s+/i,
      /^equipamento\s+/i,
      /^comida\s+/i,
      /^localizacao\s*:/i,
      /^requisitos\s*:/i,
      /^mínimo\s+/i,
      /^com\s+swaps/i,
      /^\*\*.*\*\*$/, // Bold text
      /^\/join/i,
      /^\/raid/i,
      /^https?:\/\//, // URLs
    ],
  },
  es: {
    roleKeywords: ["tanque", "sanador", "soporte", "llamador", "montura"],
    roleMentionKeywords: ["tanque", "sanador", "soporte", "llamador", "montura"],
    foodKeywords: ["comida", "energía", "poción", "pan", "sandwich"],
    mountKeywords: ["montura", "lobo", "caballo", "montura:"],
    buildKeywords: ["construcción", "equipo", "arma", "armadura"],
    colonKeywords: ["montura", "equipo", "comida", "construcción"],
    buildStartPatterns: [
      /^garra\s*-/i,
      /^patas\s*-/i,
      /^stopper\s*-/i,
      /^tanque\s*-/i,
      /^sanador\s*-/i,
      /^soporte\s*-/i,
      /^llamador\s*-/i,
      /^montura\s*-/i,
    ],
    nonSlotPatterns: [
      /^@everyone$/,
      /^@here$/,
      /^equipo\s+/i,
      /^comida\s+/i,
      /^horario\s*:/i,
      /^salida\s+/i,
      /^ubicación\s*:/i,
      /^requisitos\s*:/i,
      /^mínimo\s+/i,
      /^con\s+intercambios/i,
      /^\*\*.*\*\*$/, // Bold text
      /^\/join/i,
      /^\/raid/i,
      /^https?:\/\//, // URLs
    ],
  },
  // Add other languages as needed
  ru: {
    roleKeywords: ["танк", "хилер", "дпс", "саппорт", "коллер", "маунт"],
    roleMentionKeywords: ["танк", "хилер", "дпс", "саппорт", "коллер", "маунт"],
    foodKeywords: ["еда", "энергия", "зелье", "хлеб", "бутерброд"],
    mountKeywords: ["маунт", "волк", "лошадь", "маунт:"],
    buildKeywords: ["билд", "снаряжение", "оружие", "броня"],
    colonKeywords: ["маунт", "снаряжение", "еда", "билд"],
    buildStartPatterns: [
      /^garra\s*-/i,
      /^patas\s*-/i,
      /^stopper\s*-/i,
      /^танк\s*-/i,
      /^хилер\s*-/i,
      /^дпс\s*-/i,
      /^саппорт\s*-/i,
      /^коллер\s*-/i,
      /^маунт\s*-/i,
    ],
    nonSlotPatterns: [
      /^@everyone$/,
      /^@here$/,
      /^снаряжение\s+/i,
      /^еда\s+/i,
      /^время\s*:/i,
      /^отправление\s+/i,
      /^местоположение\s*:/i,
      /^требования\s*:/i,
      /^минимум\s+/i,
      /^\*\*.*\*\*$/, // Bold text
      /^\/join/i,
      /^\/raid/i,
      /^https?:\/\//, // URLs
    ],
  },
  zh: {
    roleKeywords: ["坦克", "治疗", "输出", "辅助", "指挥", "坐骑"],
    roleMentionKeywords: ["坦克", "治疗", "输出", "辅助", "指挥", "坐骑"],
    foodKeywords: ["食物", "能量", "药水", "面包", "三明治"],
    mountKeywords: ["坐骑", "狼", "马", "坐骑:"],
    buildKeywords: ["构建", "装备", "武器", "护甲"],
    colonKeywords: ["坐骑", "装备", "食物", "构建"],
    buildStartPatterns: [/^坦克\s*-/i, /^治疗\s*-/i, /^输出\s*-/i, /^辅助\s*-/i, /^指挥\s*-/i, /^坐骑\s*-/i],
    nonSlotPatterns: [
      /^@everyone$/,
      /^@here$/,
      /^装备\s+/i,
      /^食物\s+/i,
      /^时间\s*:/i,
      /^位置\s*:/i,
      /^要求\s*:/i,
      /^最低\s+/i,
      /^\*\*.*\*\*$/, // Bold text
      /^\/join/i,
      /^\/raid/i,
      /^https?:\/\//, // URLs
    ],
  },
  fr: {
    roleKeywords: ["tank", "soigneur", "dps", "support", "appeleur", "monture"],
    roleMentionKeywords: ["tank", "soigneur", "dps", "support", "appeleur", "monture"],
    foodKeywords: ["nourriture", "énergie", "potion", "pain", "sandwich"],
    mountKeywords: ["monture", "loup", "cheval", "monture:"],
    buildKeywords: ["construction", "équipement", "arme", "armure"],
    colonKeywords: ["monture", "équipement", "nourriture", "construction"],
    buildStartPatterns: [
      /^tank\s*-/i,
      /^soigneur\s*-/i,
      /^dps\s*-/i,
      /^support\s*-/i,
      /^appeleur\s*-/i,
      /^monture\s*-/i,
    ],
    nonSlotPatterns: [
      /^@everyone$/,
      /^@here$/,
      /^équipement\s+/i,
      /^nourriture\s+/i,
      /^heure\s*:/i,
      /^emplacement\s*:/i,
      /^exigences\s*:/i,
      /^minimum\s+/i,
      /^\*\*.*\*\*$/, // Bold text
      /^\/join/i,
      /^\/raid/i,
      /^https?:\/\//, // URLs
    ],
  },
  de: {
    roleKeywords: ["panzer", "heiler", "dps", "unterstützung", "rufer", "reittier"],
    roleMentionKeywords: ["panzer", "heiler", "dps", "unterstützung", "rufer", "reittier"],
    foodKeywords: ["nahrung", "energie", "trank", "brot", "sandwich"],
    mountKeywords: ["reittier", "wolf", "pferd", "reittier:"],
    buildKeywords: ["build", "ausrüstung", "waffe", "rüstung"],
    colonKeywords: ["reittier", "ausrüstung", "nahrung", "build"],
    buildStartPatterns: [
      /^panzer\s*-/i,
      /^heiler\s*-/i,
      /^dps\s*-/i,
      /^unterstützung\s*-/i,
      /^rufer\s*-/i,
      /^reittier\s*-/i,
    ],
    nonSlotPatterns: [
      /^@everyone$/,
      /^@here$/,
      /^ausrüstung\s+/i,
      /^nahrung\s+/i,
      /^zeit\s*:/i,
      /^ort\s*:/i,
      /^anforderungen\s*:/i,
      /^minimum\s+/i,
      /^\*\*.*\*\*$/, // Bold text
      /^\/join/i,
      /^\/raid/i,
      /^https?:\/\//, // URLs
    ],
  },
  ja: {
    roleKeywords: ["タンク", "ヒーラー", "DPS", "サポート", "コーラー", "マウント"],
    roleMentionKeywords: ["タンク", "ヒーラー", "DPS", "サポート", "コーラー", "マウント"],
    foodKeywords: ["食べ物", "エネルギー", "ポーション", "パン", "サンドイッチ"],
    mountKeywords: ["マウント", "狼", "馬", "マウント:"],
    buildKeywords: ["ビルド", "装備", "武器", "防具"],
    colonKeywords: ["マウント", "装備", "食べ物", "ビルド"],
    buildStartPatterns: [
      /^タンク\s*-/i,
      /^ヒーラー\s*-/i,
      /^DPS\s*-/i,
      /^サポート\s*-/i,
      /^コーラー\s*-/i,
      /^マウント\s*-/i,
    ],
    nonSlotPatterns: [
      /^@everyone$/,
      /^@here$/,
      /^装備\s+/i,
      /^食べ物\s+/i,
      /^時間\s*:/i,
      /^場所\s*:/i,
      /^要件\s*:/i,
      /^最低\s+/i,
      /^\*\*.*\*\*$/, // Bold text
      /^\/join/i,
      /^\/raid/i,
      /^https?:\/\//, // URLs
    ],
  },
  ko: {
    roleKeywords: ["탱커", "힐러", "딜러", "서포터", "콜러", "탈것"],
    roleMentionKeywords: ["탱커", "힐러", "딜러", "서포터", "콜러", "탈것"],
    foodKeywords: ["음식", "에너지", "물약", "빵", "샌드위치"],
    mountKeywords: ["탈것", "늑대", "말", "탈것:"],
    buildKeywords: ["빌드", "장비", "무기", "방어구"],
    colonKeywords: ["탈것", "장비", "음식", "빌드"],
    buildStartPatterns: [/^탱커\s*-/i, /^힐러\s*-/i, /^딜러\s*-/i, /^서포터\s*-/i, /^콜러\s*-/i, /^탈것\s*-/i],
    nonSlotPatterns: [
      /^@everyone$/,
      /^@here$/,
      /^장비\s+/i,
      /^음식\s+/i,
      /^시간\s*:/i,
      /^위치\s*:/i,
      /^요구사항\s*:/i,
      /^최소\s+/i,
      /^\*\*.*\*\*$/, // Bold text
      /^\/join/i,
      /^\/raid/i,
      /^https?:\/\//, // URLs
    ],
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
    return SLOT_DICTIONARIES.en;
  }

  const combinedDictionary: SlotDictionary = {
    roleKeywords: [],
    roleMentionKeywords: [],
    foodKeywords: [],
    mountKeywords: [],
    buildKeywords: [],
    colonKeywords: [],
    buildStartPatterns: [],
    nonSlotPatterns: [],
  };

  detectedLanguages.forEach((detectedLanguage) => {
    const langKeywords = SLOT_DICTIONARIES[detectedLanguage.language] || SLOT_DICTIONARIES.en;
    combinedDictionary.roleKeywords.push(...langKeywords.roleKeywords);
    combinedDictionary.roleMentionKeywords.push(...langKeywords.roleMentionKeywords);
    combinedDictionary.foodKeywords.push(...langKeywords.foodKeywords);
    combinedDictionary.mountKeywords.push(...langKeywords.mountKeywords);
    combinedDictionary.buildKeywords.push(...langKeywords.buildKeywords);
    combinedDictionary.colonKeywords.push(...langKeywords.colonKeywords);
    combinedDictionary.buildStartPatterns.push(...langKeywords.buildStartPatterns);
    combinedDictionary.nonSlotPatterns.push(...langKeywords.nonSlotPatterns);
  });

  combinedDictionary.roleKeywords = [...new Set(combinedDictionary.roleKeywords)];
  combinedDictionary.roleMentionKeywords = [...new Set(combinedDictionary.roleMentionKeywords)];
  combinedDictionary.foodKeywords = [...new Set(combinedDictionary.foodKeywords)];
  combinedDictionary.mountKeywords = [...new Set(combinedDictionary.mountKeywords)];
  combinedDictionary.buildKeywords = [...new Set(combinedDictionary.buildKeywords)];
  combinedDictionary.colonKeywords = [...new Set(combinedDictionary.colonKeywords)];

  return combinedDictionary;
}
