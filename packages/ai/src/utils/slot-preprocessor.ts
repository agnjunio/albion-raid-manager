import { logger } from "@albion-raid-manager/logger";

export interface ExtractedSlot {
  originalLine: string;
  buildName: string;
  userMention?: string;
}

/**
 * Extracts all slot/role/build lines from a Discord message
 * This ensures 100% slot extraction regardless of AI prompt limitations
 */
export function extractSlotLines(message: string): ExtractedSlot[] {
  const lines = message.split("\n");
  const slots: ExtractedSlot[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine) continue;

    // Skip lines that are clearly not slots
    if (isNonSlotLine(trimmedLine)) {
      // logger.debug(`Skipping non-slot line: "${trimmedLine}"`);
      continue;
    }

    // Check if this line looks like a slot
    if (isSlotLine(trimmedLine)) {
      // logger.debug(`Line recognized as slot, parsing: "${trimmedLine}"`);
      const slot = parseSlotLine(trimmedLine);
      if (slot) {
        slots.push(slot);
        // logger.debug(`Extracted slot: ${slot.originalLine} -> ${slot.buildName}`);
      } else {
        logger.debug(`Failed to parse slot from: "${trimmedLine}"`);
      }
    } // else {
    // logger.debug(`Line not recognized as slot: "${trimmedLine}"`);
    // }
  }

  logger.info(`Extracted ${slots.length} slots from message`);
  return slots;
}

/**
 * Determines if a line is a slot/role/build line
 */
function isSlotLine(line: string): boolean {
  const lowerLine = line.toLowerCase();

  // Lines with emojis followed by build/role names (simplified detection)
  if (/[🛡💚⚔🎯🐎❇💀🧊⚡🔴🟢🔵🟡🟣⚫🟤🌿🔥]/u.test(line)) {
    logger.debug(`Emoji detected in line: "${line}"`);
    return true;
  }

  // Lines ending with '-' (common slot format)
  if (line.endsWith("-")) {
    return true;
  }

  // Lines that start with build/role names (like "GARRA-")
  const buildStartPatterns = [
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

  if (buildStartPatterns.some((pattern) => pattern.test(line))) {
    return true;
  }

  // NEW: Any line with a colon and at least one word before it is a slot
  if (/^\s*\S[^:]*:\s*/.test(line)) {
    return true;
  }

  // Lines that contain role/build names without colons (like "Par de adaga", "Pata /sussurante/")
  const roleKeywords = [
    "tank",
    "healer",
    "dps",
    "support",
    "caller",
    "mount",
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
  ];

  if (roleKeywords.some((keyword) => lowerLine.includes(keyword))) {
    return true;
  }

  // Lines that contain Discord user mentions and look like slots
  if (line.includes("<@") && line.includes(">")) {
    const roleKeywords = [
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
    ];

    return roleKeywords.some((keyword) => lowerLine.includes(keyword));
  }

  return false;
}

/**
 * Determines if a line is clearly NOT a slot
 */
function isNonSlotLine(line: string): boolean {
  // Skip lines that are clearly not slots
  const nonSlotPatterns = [
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

  return nonSlotPatterns.some((pattern) => pattern.test(line));
}

/**
 * Parses a slot line to extract build name and user mention
 */
function parseSlotLine(line: string): ExtractedSlot | null {
  const trimmedLine = line.trim();

  // Extract user mention if present (both Discord ID format and regular @ mentions)
  const discordIdMatch = trimmedLine.match(/<@(\d+)>/);
  const regularMentionMatch = trimmedLine.match(/@(\w+)/);
  const userMention = discordIdMatch ? discordIdMatch[1] : regularMentionMatch ? regularMentionMatch[1] : undefined;

  // Remove user mention from the line for build name extraction
  let buildLine = trimmedLine
    .replace(/<@\d+>/, "")
    .replace(/@\w+/, "")
    .trim();

  // logger.debug(`After removing user mention: "${buildLine}"`);

  // Remove emojis and clean up the build name
  buildLine = buildLine.replace(/[🛡💚⚔🎯🐎❇💀🧊⚡🔴🟢🔵🟡🟣⚫🟤🌿🔥]/gu, "").trim();

  // logger.debug(`After removing emojis: "${buildLine}"`);

  // Remove trailing '-' if present
  buildLine = buildLine.replace(/-$/, "").trim();

  // If the line contains ':', extract the part after the colon
  if (buildLine.includes(":")) {
    const parts = buildLine.split(":");
    if (parts.length > 1 && parts.slice(1).join(":").trim()) {
      buildLine = parts.slice(1).join(":").trim();
    } else {
      // If there's no content after the colon, use the part before the colon
      buildLine = parts[0].trim();
    }
  }

  // logger.debug(`After colon processing: "${buildLine}"`);

  // For cases like FB: (armor), the parentheses are requirements, not part of the build
  // Remove parentheses content (armor requirements)
  buildLine = buildLine.replace(/\([^)]*\)/g, "").trim();

  // Clean up extra whitespace
  buildLine = buildLine.replace(/\s+/g, " ").trim();
  buildLine = buildLine.replace(/^\s*[^\w]*\s*/, "").trim(); // Remove leading invisible characters

  // logger.debug(`Final build name: "${buildLine}"`);

  if (!buildLine) {
    logger.debug(`Build name is empty, returning null`);
    return null;
  }

  return {
    originalLine: trimmedLine,
    buildName: buildLine,
    userMention,
  };
}
