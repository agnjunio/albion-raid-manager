/**
 * Pre-processes Discord messages to reduce token usage while preserving essential raid information
 */

export interface PreprocessedMessage {
  content: string;
  originalLength: number;
  processedLength: number;
  tokenReduction: number;
}

/**
 * Removes unnecessary content from Discord messages to reduce tokens
 */
export function preprocessMessage(message: string): PreprocessedMessage {
  const originalLength = message.length;

  let processed = message
    // Remove mass mentions
    .replace(/@everyone|@here/g, "")
    // Remove user mentions but keep usernames
    .replace(/<@\d+>/g, "")
    // Remove excessive line breaks
    .replace(/\n{3,}/g, "\n\n")
    // Remove excessive spaces
    .replace(/[ ]{2,}/g, " ")
    // Remove common Discord formatting
    .replace(/\*\*|\*|__|~~|`/g, "")
    // Remove URLs
    .replace(/https?:\/\/[^\s]+/g, "")
    // Remove emojis (but keep all Unicode letters and accents)
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "")
    // Remove excessive punctuation
    .replace(/[!?]{2,}/g, "!")
    .trim();

  // Extract only relevant sections
  processed = extractRelevantContent(processed);

  const processedLength = processed.length;
  const tokenReduction = originalLength - processedLength;

  return {
    content: processed,
    originalLength,
    processedLength,
    tokenReduction,
  };
}

/**
 * Extracts only content relevant to raid information
 */
function extractRelevantContent(message: string): string {
  const lines = message.split("\n");
  const relevantLines: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Keep lines with raid-relevant keywords
    if (isRelevantLine(trimmedLine)) {
      relevantLines.push(trimmedLine);
    }
  }

  return relevantLines.join("\n");
}

/**
 * Determines if a line contains relevant raid information
 */
function isRelevantLine(line: string): boolean {
  const lowerLine = line.toLowerCase();

  // Role keywords (basic ones, AI handles detailed role mapping)
  const roleKeywords = [
    // English
    "tank",
    "healer",
    "dps",
    "support",
    "caller",
    "mount",
    // Portuguese
    "tanque",
    "sanador",
    "suporte",
    "chamador",
    "montaria",
    // Spanish
    "tanque",
    "sanador",
    "soporte",
    "llamador",
    "montura",
    // Russian
    "танк",
    "хилер",
    "дпс",
    "саппорт",
    "коллер",
    "маунт",
    // Chinese
    "坦克",
    "治疗",
    "输出",
    "辅助",
    "指挥",
    "坐骑",
    // French
    "tank",
    "soigneur",
    "dps",
    "support",
    "appeleur",
    "monture",
    // German
    "tank",
    "heiler",
    "dps",
    "unterstützung",
    "rufer",
    "reittier",
    // Japanese
    "タンク",
    "ヒーラー",
    "DPS",
    "サポート",
    "コーラー",
    "マウント",
    // Korean
    "탱커",
    "힐러",
    "딜러",
    "서포터",
    "콜러",
    "탈것",
    // Specific weapon/build names (kept for legacy, but not relied on)
    "putrido",
    "artico",
    "canção",
    "cancao",
    "fura bruma",
    "stopper",
    "martelo",
    "patas de urso",
    "astral",
    "aguia",
    "monarca",
    "redenção",
    "queda",
    "sagrado",
    "para-tempo",
    "fb",
    "guardian",
    "redemption",
  ];

  // Requirement keywords
  const requirementKeywords = [
    // Gear tiers
    "t8",
    "t7",
    "8.1",
    "7.3",
    "t6",
    "6.1",
    "t5",
    "5.1",
    // English
    "food",
    "mount",
    "gear",
    "weapon",
    "armor",
    "spec",
    "call",
    "swap",
    "full",
    // Portuguese
    "energia",
    "montaria",
    "equipamento",
    "arma",
    "armadura",
    "especialização",
    "chamada",
    "troca",
    "completo",
    // Spanish
    "energía",
    "montura",
    "equipo",
    "arma",
    "armadura",
    "especialización",
    "llamada",
    "cambio",
    "completo",
    // Russian
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
    // Chinese
    "食物",
    "能量",
    "坐骑",
    "装备",
    "武器",
    "护甲",
    "专精",
    "召唤",
    "切换",
    "完整",
    // French
    "nourriture",
    "monture",
    "équipement",
    "arme",
    "armure",
    "spécialisation",
    "appel",
    "changement",
    "complet",
    // German
    "nahrung",
    "reittier",
    "ausrüstung",
    "waffe",
    "rüstung",
    "spezialisierung",
    "ruf",
    "wechsel",
    "vollständig",
    // Japanese
    "食べ物",
    "マウント",
    "装備",
    "武器",
    "防具",
    "特化",
    "呼び出し",
    "切り替え",
    "完全",
    // Korean
    "음식",
    "탈것",
    "장비",
    "무기",
    "방어구",
    "전문화",
    "소환",
    "전환",
    "완전",
  ];

  // Time/location keywords
  const timeLocationKeywords = [
    // English
    "departure",
    "start",
    "time",
    "location",
    "destination",
    // Portuguese
    "saida",
    "saidá",
    "partida",
    "início",
    "horário",
    "local",
    "destino",
    // Spanish
    "salida",
    "partida",
    "inicio",
    "hora",
    "lugar",
    "destino",
    // Russian
    "выход",
    "отправление",
    "начало",
    "время",
    "место",
    "назначение",
    // Chinese
    "出发",
    "开始",
    "时间",
    "地点",
    "目的地",
    // French
    "départ",
    "début",
    "heure",
    "lieu",
    "destination",
    // German
    "abfahrt",
    "start",
    "zeit",
    "ort",
    "ziel",
    // Japanese
    "出発",
    "開始",
    "時間",
    "場所",
    "目的地",
    // Korean
    "출발",
    "시작",
    "시간",
    "장소",
    "목적지",
    // Game locations
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
    // Dungeon terms
    "mazmorra",
    "подземелье",
    "副本",
    "dungeon",
    "donjon",
    "dungeon",
    "ダンジョン",
    "던전",
  ];

  // Broad role line detection: any line with a colon and at least one word before it
  const isRoleLine = /\w[^\n]{0,30}:/.test(line);

  // Check if line contains any relevant keywords or looks like a role line
  const allKeywords = [...roleKeywords, ...requirementKeywords, ...timeLocationKeywords];
  return (
    allKeywords.some((keyword) => lowerLine.includes(keyword)) ||
    isRoleLine ||
    line.includes("@") || // User mentions
    line.includes("/join") || // Guild commands
    /^\d{1,2}:\d{2}/.test(line) || // Time patterns
    /[Tt]\d+\.?\d*/.test(line)
  ); // Gear tier patterns
}

/**
 * Creates a compact version of the message for token optimization
 */
export function createCompactMessage(message: string): string {
  const processed = preprocessMessage(message);

  // Further compress by removing common words
  return processed.content
    .replace(/\b(?:the|and|or|but|in|on|at|to|for|of|with|by)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}
