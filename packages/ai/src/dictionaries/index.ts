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
  en: [
    // Roles and positions
    "tank",
    "healer",
    "dps",
    "support",
    "caller",
    "shot caller",
    "raid leader",
    // Equipment
    "mount",
    "gear",
    "weapon",
    "armor",
    "staff",
    "bow",
    "sword",
    "hammer",
    "mace",
    // Game terms
    "dungeon",
    "raid",
    "guild",
    "party",
    "group",
    "chest",
    "loot",
    // Common phrases
    "looking for",
    "need",
    "required",
    "requirements",
    "build",
    // Time and location
    "time",
    "location",
    "departure",
    "starting",
    "meeting at",
    "leaving from",
  ],
  pt: [
    // Roles and positions
    "tanque",
    "guardiao",
    "guardião",
    "lider",
    "líder",
    "caller",
    "sanador",
    "suporte",
    "chamador",
    "raid leader",
    "lider do grupo",
    "líder do grupo",
    "lider da raid",
    "líder da raid",
    // Equipment
    "montaria",
    "equipamento",
    "arma",
    "armadura",
    "cajado",
    "arco",
    "espada",
    "martelo",
    "maça",
    // Game terms
    "masmorra",
    "raid",
    "guilda",
    "grupo",
    "party",
    "baú",
    "saque",
    "loot",
    // Common phrases
    "procurando",
    "preciso",
    "necessário",
    "requisitos",
    "build",
    "construção",
    // Time and location
    "horário",
    "horario",
    "local",
    "saída",
    "saida",
    "partida",
    "começando",
    "encontro em",
    "saindo de",
    // Mixed terms (commonly used English terms in Portuguese context)
    "tank",
    "healer",
    "dps",
    "gear",
    "build",
  ],
  es: [
    // Roles and positions
    "tanque",
    "sanador",
    "dps",
    "soporte",
    "llamador",
    "líder de raid",
    "lider de grupo",
    // Equipment
    "montura",
    "equipo",
    "arma",
    "armadura",
    "bastón",
    "arco",
    "espada",
    "martillo",
    "maza",
    // Game terms
    "mazmorra",
    "raid",
    "gremio",
    "grupo",
    "cofre",
    "botín",
    // Common phrases
    "buscando",
    "necesito",
    "requerido",
    "requisitos",
    "construcción",
    // Time and location
    "hora",
    "ubicación",
    "salida",
    "partida",
    "comenzando",
    "reunión en",
    "saliendo de",
    // Mixed terms
    "tank",
    "healer",
    "dps",
    "gear",
    "build",
  ],
  ru: [
    // Roles and positions
    "танк",
    "хилер",
    "дпс",
    "саппорт",
    "коллер",
    "лидер рейда",
    "лидер группы",
    // Equipment
    "маунт",
    "снаряжение",
    "оружие",
    "броня",
    "посох",
    "лук",
    "меч",
    "молот",
    "булава",
    // Game terms
    "подземелье",
    "рейд",
    "гильдия",
    "группа",
    "сундук",
    "добыча",
    // Common phrases
    "ищу",
    "нужен",
    "требуется",
    "требования",
    "билд",
    // Time and location
    "время",
    "место",
    "отправление",
    "начало",
    "встреча в",
    "выход из",
  ],
  zh: [
    // Roles and positions
    "坦克",
    "治疗",
    "输出",
    "辅助",
    "指挥",
    "团长",
    "队长",
    // Equipment
    "坐骑",
    "装备",
    "武器",
    "护甲",
    "法杖",
    "弓",
    "剑",
    "锤",
    "锏",
    // Game terms
    "副本",
    "团队",
    "公会",
    "队伍",
    "宝箱",
    "战利品",
    // Common phrases
    "寻找",
    "需要",
    "要求",
    "构建",
    // Time and location
    "时间",
    "地点",
    "出发",
    "开始",
    "集合点",
    "从出发",
  ],
  fr: [
    // Roles and positions
    "tank",
    "soigneur",
    "dps",
    "support",
    "appeleur",
    "chef de raid",
    "chef de groupe",
    // Equipment
    "monture",
    "équipement",
    "arme",
    "armure",
    "bâton",
    "arc",
    "épée",
    "marteau",
    "masse",
    // Game terms
    "donjon",
    "raid",
    "guilde",
    "groupe",
    "coffre",
    "butin",
    // Common phrases
    "recherche",
    "besoin",
    "requis",
    "exigences",
    "construction",
    // Time and location
    "heure",
    "lieu",
    "départ",
    "début",
    "rendez-vous à",
    "partir de",
    // Mixed terms
    "tank",
    "healer",
    "dps",
    "gear",
    "build",
  ],
  de: [
    // Roles and positions
    "panzer",
    "heiler",
    "dps",
    "unterstützung",
    "rufer",
    "raidleiter",
    "gruppenleiter",
    // Equipment
    "reittier",
    "ausrüstung",
    "waffe",
    "rüstung",
    "stab",
    "bogen",
    "schwert",
    "hammer",
    "keule",
    // Game terms
    "verlies",
    "raid",
    "gilde",
    "gruppe",
    "truhe",
    "beute",
    // Common phrases
    "suche",
    "benötigt",
    "erforderlich",
    "anforderungen",
    "build",
    // Time and location
    "zeit",
    "ort",
    "abfahrt",
    "start",
    "treffen bei",
    "abfahrt von",
    // Mixed terms
    "tank",
    "healer",
    "dps",
    "gear",
    "build",
  ],
  ja: [
    // Roles and positions
    "タンク",
    "ヒーラー",
    "DPS",
    "サポート",
    "コーラー",
    "レイドリーダー",
    "グループリーダー",
    // Equipment
    "マウント",
    "装備",
    "武器",
    "防具",
    "杖",
    "弓",
    "剣",
    "ハンマー",
    "メイス",
    // Game terms
    "ダンジョン",
    "レイド",
    "ギルド",
    "グループ",
    "宝箱",
    "ルート",
    // Common phrases
    "探しています",
    "必要",
    "要件",
    "ビルド",
    // Time and location
    "時間",
    "場所",
    "出発",
    "開始",
    "集合場所",
    "出発地点",
  ],
  ko: [
    // Roles and positions
    "탱커",
    "힐러",
    "딜러",
    "서포터",
    "콜러",
    "레이드 리더",
    "그룹 리더",
    // Equipment
    "탈것",
    "장비",
    "무기",
    "방어구",
    "지팡이",
    "활",
    "검",
    "망치",
    "철퇴",
    // Game terms
    "던전",
    "레이드",
    "길드",
    "그룹",
    "상자",
    "전리품",
    // Common phrases
    "찾는 중",
    "필요",
    "요구 사항",
    "빌드",
    // Time and location
    "시간",
    "위치",
    "출발",
    "시작",
    "만남 장소",
    "출발지",
  ],
};

/**
 * Represents a language with its detection score
 */
export interface LanguageScore {
  language: SupportedLanguage;
  score: number;
  confidence: number;
}

/**
 * Detects languages used in a text based on keyword patterns
 * Returns a sorted list of languages by score
 */
export function detectLanguages(text: string): LanguageScore[] {
  const lowerText = text.toLowerCase();
  const scores: Record<SupportedLanguage, number> = {} as Record<SupportedLanguage, number>;
  const matchedPatterns: Record<SupportedLanguage, Set<string>> = {} as Record<SupportedLanguage, Set<string>>;
  const totalPatterns: Record<SupportedLanguage, number> = {} as Record<SupportedLanguage, number>;
  const textLength = text.length;

  // Initialize scores and pattern tracking
  SUPPORTED_LANGUAGES.forEach((lang) => {
    // English starts with a small bias as it's commonly mixed with other languages
    scores[lang] = lang === "en" ? 0.5 : 0;
    matchedPatterns[lang] = new Set();
    totalPatterns[lang] = LANGUAGE_PATTERNS[lang].length;
  });

  // Count matches for each language with improved scoring
  for (const [language, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    const lang = language as SupportedLanguage;

    for (const pattern of patterns) {
      // Check if pattern exists in text
      if (lowerText.includes(pattern)) {
        // Add to matched patterns set to avoid duplicate counting
        if (!matchedPatterns[lang].has(pattern)) {
          matchedPatterns[lang].add(pattern);

          // Base score based on pattern length (longer patterns get higher scores)
          // This helps prioritize specific phrases over common short words
          const baseScore = Math.min(3, pattern.length / 3);

          // Bonus for word boundaries (whole words match better than partial matches)
          try {
            const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const wordBoundaryRegex = new RegExp(`\\b${escapedPattern}\\b`, "i");
            const isWholeWord = wordBoundaryRegex.test(lowerText);
            const boundaryBonus = isWholeWord ? 1.5 : 1;

            // Calculate final score for this pattern
            const patternScore = baseScore * boundaryBonus;

            // Add to language score
            scores[lang] += patternScore;
          } catch {
            // Fallback if regex fails
            scores[lang] += baseScore;
          }
        }
      }
    }
  }

  // Create sorted list of languages by score
  const languageScores: LanguageScore[] = SUPPORTED_LANGUAGES.map((language) => {
    const score = scores[language];
    const matchCount = matchedPatterns[language].size;

    // Calculate confidence based on:
    // 1. Percentage of matched patterns
    // 2. Total score relative to text length
    // 3. Number of unique patterns matched
    const patternRatio = totalPatterns[language] > 0 ? matchCount / totalPatterns[language] : 0;
    const scoreToLengthRatio = textLength > 0 ? score / (textLength / 10) : 0;
    const confidence = patternRatio * 0.7 + scoreToLengthRatio * 0.3;

    return {
      language,
      score,
      confidence,
    };
  });

  // Sort by score (descending), then by confidence if scores are equal
  // Filter out languages with no matches or very low scores
  return languageScores
    .filter((score) => score.score > 0.5)
    .sort((a, b) => {
      if (Math.abs(b.score - a.score) < 0.5) {
        return b.confidence - a.confidence;
      }
      return b.score - a.score;
    });
}

export * from "./content-type-dictionaries";
export * from "./message-dictionaries";
export * from "./role-dictionaries";
export * from "./slot-dictionaries";
