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
    "tank",
    "healer",
    "dps",
    "support",
    "tanque",
    "sanador",
    "танк",
    "хилер",
    "坦克",
    "治疗",
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
    "t8",
    "t7",
    "8.1",
    "7.3",
    "food",
    "energia",
    "montaria",
    "mount",
    "gear",
    "weapon",
    "armor",
    "spec",
    "call",
    "swap",
    "full",
    "еда",
    "энергия",
    "маунт",
    "食物",
    "能量",
    "坐骑",
  ];

  // Time/location keywords
  const timeLocationKeywords = [
    "saida",
    "saidá",
    "departure",
    "start",
    "salida",
    "выход",
    "出发",
    "bau",
    "roads",
    "avalon",
    "mazmorra",
    "подземелье",
    "副本",
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
