import { logger } from "@albion-raid-manager/core/logger";

import { SLOT_EMOJI_INDICATORS, getSlotDictionaryForText } from "../../dictionaries";

import { createPreprocessor, type Preprocessor } from "./";

/**
 * Regular expressions used for slot detection and parsing
 */
const PATTERNS = {
  /** Matches time patterns like "12:30" or "23:45" */
  TIME_PATTERN: /\d{1,2}:\d{2}/,
  /** Matches colon-based slot definitions, excluding time patterns */
  SLOT_WITH_COLON: /^\s*\S[^:]*:\s*/,
  /** Matches lines starting with letters/numbers, optionally followed by a user mention */
  BUILD_WITH_MENTION: /^\s*[\p{L}\p{N}]+(?:\s*[/]?\s*[\p{L}\p{N}]+)*\s*(?:@\w+|<@!?\d+>)?/u,
  /** Matches Discord user ID mentions like "<@123456789>" */
  DISCORD_ID_MENTION: /<@!?(\d+)>/,
  /** Matches regular @ mentions with support for accented characters */
  REGULAR_MENTION: /@([\w\u00C0-\u017F]+)/u,
  /** Matches any emoji or emoji component */
  EMOJI: /[\p{Emoji}\p{Emoji_Component}]/gu,
  /** Matches custom Discord emoji format like "<:name:123456789>" */
  CUSTOM_EMOJI: /<:[^:]+:\d+>/g,
  /** Matches parenthetical content (typically armor requirements) */
  PARENTHESES: /\([^)]*\)/g,
  /** Matches trailing punctuation */
  TRAILING_PUNCTUATION: /[.!?]+$/,
  /** Matches non-alphanumeric leading characters */
  NON_ALPHANUMERIC_START: /^\s*[^\p{L}\p{N}]*\s*/u,
};

/**
 * Represents an extracted slot from a Discord message
 * @example
 * // Message: "Bruxa: <@123456789>"
 * // Results in:
 * {
 *   originalLine: "Bruxa: <@123456789>",
 *   buildName: "Bruxa",
 *   userMention: "123456789"
 * }
 */
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
      logger.debug(`Skipping non-slot line: "${trimmedLine}"`);
      continue;
    }

    // Check if this line looks like a slot
    if (isSlotLine(trimmedLine)) {
      logger.debug(`Line recognized as slot, parsing: "${trimmedLine}"`);
      const slot = parseSlotLine(trimmedLine);
      if (slot) {
        slots.push(slot);
        logger.debug(`Extracted slot: ${slot.originalLine} -> ${slot.buildName}`);
      } else {
        logger.debug(`Failed to parse slot from: "${trimmedLine}"`);
      }
    } else {
      logger.debug(`Line not recognized as slot: "${trimmedLine}"`);
    }
  }

  logger.info(`Extracted ${slots.length} slots from message`);
  return slots;
}

/**
 * Determines if a line is a slot/role/build line
 */
function isSlotLine(line: string): boolean {
  const lowerLine = line.toLowerCase();

  // Get language-specific keywords and patterns
  const slotKeywords = getSlotDictionaryForText(line);

  // Lines with emojis followed by build/role names (simplified detection)
  if (SLOT_EMOJI_INDICATORS.test(line)) {
    logger.debug(`Emoji detected in line: "${line}"`);
    return true;
  }

  // Lines ending with '-' (common slot format)
  if (line.endsWith("-")) {
    return true;
  }

  // Lines that start with build/role names (language-specific patterns)
  if (slotKeywords.buildStartPatterns.some((pattern: RegExp) => pattern.test(line))) {
    return true;
  }

  // Lines with a colon pattern that look like slots (but not time patterns)
  if (PATTERNS.SLOT_WITH_COLON.test(line) && !PATTERNS.TIME_PATTERN.test(line)) {
    return true;
  }

  // Lines that follow a slot definition and contain a user mention or build-related patterns
  if (PATTERNS.BUILD_WITH_MENTION.test(line)) {
    return true;
  }

  // Lines that contain role/build names without colons
  if (slotKeywords.roleKeywords.some((keyword: string) => lowerLine.includes(keyword))) {
    return true;
  }

  // Lines that contain Discord user mentions and look like slots
  if (line.includes("<@") && line.includes(">")) {
    return slotKeywords.roleMentionKeywords.some((keyword: string) => lowerLine.includes(keyword));
  }

  return false;
}

/**
 * Determines if a line is clearly NOT a slot
 */
function isNonSlotLine(line: string): boolean {
  // Get language-specific non-slot patterns
  const slotKeywords = getSlotDictionaryForText(line);

  // Skip lines that are clearly not slots using language-specific patterns
  return slotKeywords.nonSlotPatterns.some((pattern: RegExp) => pattern.test(line));
}

/**
 * Parses a slot line to extract build name and user mention
 */
function parseSlotLine(line: string): ExtractedSlot | null {
  const trimmedLine = line.trim();

  // Extract user mention if present (both Discord ID format and regular @ mentions)
  const discordIdMatch = trimmedLine.match(PATTERNS.DISCORD_ID_MENTION);
  const regularMentionMatch = trimmedLine.match(PATTERNS.REGULAR_MENTION);
  const userMention = discordIdMatch ? discordIdMatch[1] : regularMentionMatch ? regularMentionMatch[1] : undefined;

  // Remove user mention from the line for build name extraction
  let buildLine = trimmedLine
    .replace(new RegExp(PATTERNS.DISCORD_ID_MENTION.source, "g"), "") // Convert to global regex
    .replace(new RegExp(PATTERNS.REGULAR_MENTION.source, "gu"), "") // Convert to global regex
    .trim();

  logger.debug(`After removing user mention: "${buildLine}"`);

  // Remove emojis and custom Discord emojis, preserve accented characters
  buildLine = buildLine.replace(PATTERNS.EMOJI, "").trim();
  buildLine = buildLine.replace(PATTERNS.CUSTOM_EMOJI, "").trim();

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

  // Clean up extra whitespace and normalize the build name
  buildLine = buildLine
    .replace(/\s*\/\s*/g, " ") // Replace slashes with spaces
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(PATTERNS.NON_ALPHANUMERIC_START, "") // Remove leading non-alphanumeric chars
    .trim();

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

/**
 * Extracts requirements from a message
 * @param message - The Discord message
 * @returns Array of requirement strings
 */
export function extractRequirements(message: string): string[] {
  const lines = message.split("\n");
  const requirements: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Look for requirement patterns
    if (isRequirementLine(trimmedLine)) {
      const requirement = parseRequirementLine(trimmedLine);
      if (requirement) {
        requirements.push(requirement);
      }
    }
  }

  // Also check for requirements that span multiple lines or are in the same line
  const fullText = message.toLowerCase();

  // Extract gear tier requirements
  const gearTierMatch = fullText.match(/\bt\d+\.?\d*\b/gi);
  if (gearTierMatch) {
    requirements.push(...gearTierMatch.map((match) => match.toUpperCase()));
  }

  // Extract food requirements
  const foodPatterns = [/\d+\s+food\s+boa\s+e?\s*\d+\s+ruins?/gi, /\d+\s+food\s+boa/gi, /\d+\s+ruins?/gi];

  for (const pattern of foodPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      requirements.push(...match);
    }
  }

  return requirements;
}

/**
 * Determines if a line contains requirements
 */
function isRequirementLine(line: string): boolean {
  const lowerLine = line.toLowerCase();

  if (/t\d+\.?\d*/.test(line)) return true;
  if (/\d+\.\d+/.test(line)) return true;

  const dictionary = getSlotDictionaryForText(line);

  if (dictionary.foodKeywords.some((keyword: string) => lowerLine.includes(keyword))) return true;
  if (dictionary.mountKeywords.some((keyword: string) => lowerLine.includes(keyword))) return true;
  if (dictionary.buildKeywords.some((keyword: string) => lowerLine.includes(keyword))) return true;
  if (line.includes(":")) {
    if (dictionary.colonKeywords.some((keyword: string) => lowerLine.includes(keyword))) return true;
  }

  return false;
}

/**
 * Parses a requirement line to extract the requirement text
 */
function parseRequirementLine(line: string): string | null {
  const trimmedLine = line.trim();
  if (!trimmedLine) return null;

  // Remove common prefixes
  let requirement = trimmedLine
    .replace(/^(?:build|gear|equipamento|weapon|arma|armor|armadura)\s*:?\s*/i, "")
    .replace(/^(?:food|comida|energia|energy)\s*:?\s*/i, "")
    .replace(/^(?:mount|montaria)\s*:?\s*/i, "")
    .trim();

  // If the line contains ':', extract the part after the colon
  if (requirement.includes(":")) {
    const parts = requirement.split(":");
    if (parts.length > 1 && parts.slice(1).join(":").trim()) {
      requirement = parts.slice(1).join(":").trim();
    } else {
      requirement = parts[0].trim();
    }
  }

  // Clean up extra whitespace and remove trailing punctuation
  requirement = requirement.replace(/\s+/g, " ").trim();
  requirement = requirement.replace(/[.!?]+$/, "").trim();

  return requirement || null;
}

export const slotPreprocessor: Preprocessor = createPreprocessor((context) => {
  const slots = extractSlotLines(context.originalMessage);
  const slotStrings = slots.map((slot) => {
    if (slot.userMention) {
      return `${slot.buildName} <@${slot.userMention}>`;
    }
    return slot.buildName;
  });

  return {
    extractedSlots: slotStrings,
    metadata: {
      ...context.metadata,
      slotCount: slots.length,
    },
  };
});

export const requirementPreprocessor: Preprocessor = createPreprocessor((context) => {
  const requirements = extractRequirements(context.originalMessage);

  return {
    extractedRequirements: requirements,
    metadata: {
      ...context.metadata,
      requirementCount: requirements.length,
    },
  };
});
