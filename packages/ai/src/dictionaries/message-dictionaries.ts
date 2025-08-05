import { detectLanguage, type SupportedLanguage } from "./index";

export interface MessageKeywords {
  roleKeywords: string[];
  requirementKeywords: string[];
  timeLocationKeywords: string[];
}

export type MultiLanguageMessageKeywords = Record<SupportedLanguage, MessageKeywords>;

// Comprehensive message keywords for all supported languages
export const MESSAGE_KEYWORDS: MultiLanguageMessageKeywords = {
  en: {
    roleKeywords: ["tank", "healer", "dps", "support", "caller", "mount"],
    requirementKeywords: [
      "t8",
      "t7",
      "8.1",
      "7.3",
      "t6",
      "6.1",
      "t5",
      "5.1",
      "food",
      "mount",
      "gear",
      "weapon",
      "armor",
      "spec",
      "call",
      "swap",
      "full",
    ],
    timeLocationKeywords: [
      "departure",
      "start",
      "time",
      "location",
      "destination",
      "bau",
      "roads",
      "avalon",
      "ganks",
      "brecilian",
      "brecilien",
      "caerleon",
      "bridgewatch",
      "fort sterling",
      "lymhurst",
      "martlock",
      "thetford",
      "dungeon",
    ],
  },
  pt: {
    roleKeywords: [
      "tanque",
      "sanador",
      "suporte",
      "chamador",
      "montaria",
      "aguia",
      "artico",
      "astral",
      "canção",
      "cancao",
      "fb",
      "fura bruma",
      "ga",
      "guardian",
      "maça",
      "martelo",
      "monarca",
      "para-tempo",
      "patas de urso",
      "prisma",
      "pássaro",
      "putrido",
      "queda",
      "redemption",
      "redenção",
      "sagrado",
      "stopper",
    ],
    requirementKeywords: [
      "energia",
      "montaria",
      "equipamento",
      "arma",
      "armadura",
      "especialização",
      "chamada",
      "troca",
      "completo",
    ],
    timeLocationKeywords: ["saida", "saidá", "partida", "início", "horário", "local", "destino", "mazmorra"],
  },
  es: {
    roleKeywords: ["tanque", "sanador", "soporte", "llamador", "montura"],
    requirementKeywords: [
      "energía",
      "montura",
      "equipo",
      "arma",
      "armadura",
      "especialización",
      "llamada",
      "cambio",
      "completo",
    ],
    timeLocationKeywords: ["salida", "partida", "inicio", "hora", "lugar", "destino", "mazmorra"],
  },
  ru: {
    roleKeywords: ["танк", "хилер", "дпс", "саппорт", "коллер", "маунт"],
    requirementKeywords: [
      "еда",
      "энергия",
      "маунт",
      "снаряжение",
      "оружие",
      "броня",
      "специализация",
      "вызов",
      "смена",
      "полный",
    ],
    timeLocationKeywords: ["выход", "отправление", "начало", "время", "место", "назначение", "подземелье"],
  },
  zh: {
    roleKeywords: ["坦克", "治疗", "输出", "辅助", "指挥", "坐骑"],
    requirementKeywords: ["食物", "能量", "坐骑", "装备", "武器", "护甲", "专精", "召唤", "切换", "完整"],
    timeLocationKeywords: ["出发", "开始", "时间", "地点", "目的地", "副本"],
  },
  fr: {
    roleKeywords: ["tank", "soigneur", "dps", "support", "appeleur", "monture"],
    requirementKeywords: [
      "nourriture",
      "monture",
      "équipement",
      "arme",
      "armure",
      "spécialisation",
      "appel",
      "changement",
      "complet",
    ],
    timeLocationKeywords: ["départ", "début", "heure", "lieu", "destination", "donjon"],
  },
  de: {
    roleKeywords: ["panzer", "heiler", "dps", "unterstützung", "rufer", "reittier"],
    requirementKeywords: [
      "nahrung",
      "reittier",
      "ausrüstung",
      "waffe",
      "rüstung",
      "spezialisierung",
      "ruf",
      "wechsel",
      "vollständig",
    ],
    timeLocationKeywords: ["abfahrt", "start", "zeit", "ort", "ziel", "dungeon"],
  },
  ja: {
    roleKeywords: ["タンク", "ヒーラー", "DPS", "サポート", "コーラー", "マウント"],
    requirementKeywords: ["食べ物", "マウント", "装備", "武器", "防具", "特化", "呼び出し", "切り替え", "完全"],
    timeLocationKeywords: ["出発", "開始", "時間", "場所", "目的地", "ダンジョン"],
  },
  ko: {
    roleKeywords: ["탱커", "힐러", "딜러", "서포터", "콜러", "탈것"],
    requirementKeywords: ["음식", "탈것", "장비", "무기", "방어구", "전문화", "소환", "전환", "완전"],
    timeLocationKeywords: ["출발", "시작", "시간", "장소", "목적지", "던전"],
  },
};

/**
 * Gets message keywords for a specific language
 */
export function getMessageKeywordsForLanguage(language: SupportedLanguage): MessageKeywords {
  return MESSAGE_KEYWORDS[language] || MESSAGE_KEYWORDS.en;
}

/**
 * Gets message keywords for the detected language of a text
 */
export function getMessageKeywordsForText(text: string): MessageKeywords {
  const language = detectLanguage(text);
  return getMessageKeywordsForLanguage(language);
}

/**
 * Gets all keywords for a specific language and category
 */
export function getKeywordsByCategory(language: SupportedLanguage, category: keyof MessageKeywords): string[] {
  const keywords = getMessageKeywordsForLanguage(language);
  return keywords[category] || [];
}
