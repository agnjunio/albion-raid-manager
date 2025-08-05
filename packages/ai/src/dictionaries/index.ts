export interface DictionaryEntry {
  role: string;
  confidence: number;
  patterns: string[];
}

export interface LanguageDictionary {
  [role: string]: DictionaryEntry;
}

export interface MultiLanguageDictionary {
  [language: string]: LanguageDictionary;
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
  pt: ["tanque", "sanador", "suporte", "montaria", "equipamento", "arma"],
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

/**
 * Gets dictionary entries for a specific language
 */
import { ROLE_DICTIONARIES } from "./role-dictionaries";

export function getDictionaryForLanguage(language: SupportedLanguage): LanguageDictionary {
  return ROLE_DICTIONARIES[language] || ROLE_DICTIONARIES.en;
}

/**
 * Gets dictionary entries for the detected language of a text
 */
export function getDictionaryForText(text: string): LanguageDictionary {
  const language = detectLanguage(text);
  return getDictionaryForLanguage(language);
}

/**
 * Finds a role assignment for a given slot name using the appropriate language dictionary
 */
export function findRoleAssignment(slotName: string): { role: string; confidence: number } | null {
  const dictionary = getDictionaryForText(slotName);
  const lowerSlot = slotName.toLowerCase();

  for (const [role, entry] of Object.entries(dictionary)) {
    if (entry.patterns.some((pattern) => lowerSlot.includes(pattern))) {
      return {
        role,
        confidence: entry.confidence,
      };
    }
  }

  return null;
}

/**
 * Gets all role patterns for a specific role and language
 */
export function getRolePatterns(role: string, language: SupportedLanguage = "en"): string[] {
  const dictionary = getDictionaryForLanguage(language);
  return dictionary[role]?.patterns || [];
}

/**
 * Gets all supported roles for a language
 */
export function getSupportedRoles(language: SupportedLanguage = "en"): string[] {
  const dictionary = getDictionaryForLanguage(language);
  return Object.keys(dictionary);
}
