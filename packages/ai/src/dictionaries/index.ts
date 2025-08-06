export interface MultiLanguageDictionary<T> {
  [language: string]: T;
}

// Supported languages
export const SUPPORTED_LANGUAGES = [
  "en", // English
  "pt", // Portuguese
  "es", // Spanish
  "ru", // Russian
  "zh", // Chinese
  "fr", // French
  "de", // German
  "ja", // Japanese
  "ko", // Korean
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Language detection patterns
export const LANGUAGE_PATTERNS: Record<SupportedLanguage, string[]> = {
  en: ["tank", "healer", "dps", "support", "mount", "gear", "weapon"],
  pt: [
    "tanque",
    "guardiao",
    "guardião",
    "lider",
    "líder",
    "caller",
    "sanador",
    "suporte",
    "montaria",
    "equipamento",
    "martelo",
    "machado",
    "claymore",
    "lider do grupo",
    "líder do grupo",
  ],
  es: ["tanque", "sanador", "soporte", "montura", "equipo", "arma"],
  ru: ["танк", "хилер", "дпс", "саппорт", "маунт", "снаряжение", "оружие"],
  zh: ["坦克", "治疗", "输出", "辅助", "坐骑", "装备", "武器"],
  fr: ["tank", "soigneur", "dps", "support", "monture", "équipement", "arme"],
  de: ["panzer", "heiler", "dps", "unterstützung", "reittier", "ausrüstung", "waffe"],
  ja: ["タンク", "ヒーラー", "DPS", "サポート", "マウント", "装備", "武器"],
  ko: ["탱커", "힐러", "딜러", "서포터", "탈것", "장비", "무기"],
};

/**
 * Detects the primary language of a text based on keyword patterns
 */
export function detectLanguage(text: string): SupportedLanguage {
  const lowerText = text.toLowerCase();
  const scores: Record<SupportedLanguage, number> = {} as Record<SupportedLanguage, number>;

  // Initialize scores
  SUPPORTED_LANGUAGES.forEach((lang) => {
    scores[lang] = 0;
  });

  // Count matches for each language
  for (const [language, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    for (const pattern of patterns) {
      if (lowerText.includes(pattern)) {
        scores[language as SupportedLanguage]++;
      }
    }
  }

  // Find language with highest score
  let bestLanguage: SupportedLanguage = "en";
  let bestScore = 0;

  for (const [language, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestLanguage = language as SupportedLanguage;
    }
  }

  return bestLanguage;
}

export * from "./content-type-dictionaries";
export * from "./message-dictionaries";
export * from "./role-dictionaries";
export * from "./slot-dictionaries";
