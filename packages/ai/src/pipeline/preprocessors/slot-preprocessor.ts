import { logger } from "@albion-raid-manager/logger";

import {
  BUILD_START_PATTERNS,
  NON_SLOT_PATTERNS,
  SLOT_EMOJI_INDICATORS,
  getRequirementKeywordsForText,
  getSlotKeywordsForText,
} from "../../dictionaries";

import { createPreprocessor, type Preprocessor } from "./";

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
  if (SLOT_EMOJI_INDICATORS.test(line)) {
    logger.debug(`Emoji detected in line: "${line}"`);
    return true;
  }

  // Lines ending with '-' (common slot format)
  if (line.endsWith("-")) {
    return true;
  }

  // Lines that start with build/role names (like "GARRA-")
  if (BUILD_START_PATTERNS.some((pattern: RegExp) => pattern.test(line))) {
    return true;
  }

  // NEW: Any line with a colon and at least one word before it is a slot
  if (/^\s*\S[^:]*:\s*/.test(line)) {
    return true;
  }

  // Get language-specific keywords
  const slotKeywords = getSlotKeywordsForText(line);

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
  // Skip lines that are clearly not slots
  return NON_SLOT_PATTERNS.some((pattern: RegExp) => pattern.test(line));
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
  buildLine = buildLine.replace(SLOT_EMOJI_INDICATORS, "").trim();

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

  // Gear tier patterns
  if (/t\d+\.?\d*/.test(line)) return true;
  if (/\d+\.\d+/.test(line)) return true;

  // Get language-specific requirement keywords
  const requirementKeywords = getRequirementKeywordsForText(line);

  // Food and consumable patterns
  if (requirementKeywords.foodKeywords.some((keyword: string) => lowerLine.includes(keyword))) return true;

  // Mount patterns
  if (requirementKeywords.mountKeywords.some((keyword: string) => lowerLine.includes(keyword))) return true;

  // Build requirements
  if (requirementKeywords.buildKeywords.some((keyword: string) => lowerLine.includes(keyword))) return true;

  // Specific patterns that indicate requirements
  if (line.includes(":")) {
    if (requirementKeywords.colonKeywords.some((keyword: string) => lowerLine.includes(keyword))) return true;
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
