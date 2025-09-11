import { CONTENT_TYPE_MAPPING, ContentTypeInfo } from "@albion-raid-manager/core/entities";
import { ContentType } from "@albion-raid-manager/types";

import {
  DEFAULT_OTHER_CONTENT_TYPE,
  FIXED_SIZE_MAPPINGS,
  NON_ROLE_PATTERNS,
  ROLE_INDICATORS,
  getContentTypeDictionaryForText,
  matchesContentType,
} from "../../dictionaries";

import { createPreprocessor, type Preprocessor } from "./";

/**
 * Extract the number of roles from a message
 */
function extractRoleCount(text: string): number {
  const lines = text.split("\n");
  let roleCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (!trimmedLine) continue;
    if (isNonRoleLine(trimmedLine)) continue;

    if (trimmedLine.includes("<@") && trimmedLine.includes(">")) {
      roleCount++;
      continue;
    }

    if (trimmedLine.match(/^.+[-:=]\s*$/) || trimmedLine.match(/^.+[-:=]\s*[^-\s]+$/)) {
      roleCount++;
    }

    if (ROLE_INDICATORS.test(trimmedLine)) {
      roleCount++;
    }
  }

  return roleCount;
}

/**
 * Determines if a line is clearly NOT a role
 */
function isNonRoleLine(line: string): boolean {
  return NON_ROLE_PATTERNS.some((pattern: RegExp) => pattern.test(line));
}

/**
 * Detects content type for fixed-size activities based on role count
 */
function detectFixedSizeContentType(
  roleCount: number,
  text?: string,
): { type: ContentType; confidence: number; info: ContentTypeInfo } | null {
  // Special handling for 7 players - could be either ROADS_OF_AVALON_PVE or ROADS_OF_AVALON_PVP
  if (roleCount === 7 && text) {
    const normalizedText = text.toLowerCase();
    const dictionary = getContentTypeDictionaryForText(text);
    const hasPvpKeywords = dictionary.pvpKeywords.some((keyword: string) => normalizedText.includes(keyword));
    const hasPveKeywords = dictionary.pveKeywords.some((keyword: string) => normalizedText.includes(keyword));

    let contentType: ContentType;
    if (hasPvpKeywords) {
      contentType = "ROADS_OF_AVALON"; // If PvP keywords are present, it's Roads
    } else if (hasPveKeywords) {
      contentType = "ROADS_OF_AVALON"; // Otherwise check for PvE keywords
    } else {
      contentType = "ROADS_OF_AVALON"; // Default to Roads for Roads content with no keywords
    }

    const info = CONTENT_TYPE_MAPPING.find((ct) => ct.type === contentType);
    if (info) {
      return { type: contentType, confidence: 0.85, info };
    }
  }

  const mapping = FIXED_SIZE_MAPPINGS.find((m: { count: number; type: ContentType }) => m.count === roleCount);
  if (mapping) {
    const info = CONTENT_TYPE_MAPPING.find((ct) => ct.type === mapping.type);
    if (info) {
      return { type: mapping.type, confidence: 0.85, info };
    }
  }

  return null;
}

/**
 * Detect content type from text using comprehensive keyword matching
 */
export function detectContentType(text: string): { type: ContentType; confidence: number; info: ContentTypeInfo } {
  const normalizedText = text.toLowerCase().trim();
  let bestMatch: { type: ContentType; confidence: number; info: ContentTypeInfo } | null = null;

  const roleCount = extractRoleCount(text);

  if (roleCount > 0) {
    const fixedSizeMatch = detectFixedSizeContentType(roleCount, normalizedText);
    if (fixedSizeMatch) {
      return fixedSizeMatch;
    }
  }

  // Use the new comprehensive keyword matching system
  for (const contentInfo of CONTENT_TYPE_MAPPING) {
    const matchResult = matchesContentType(text, contentInfo.type);

    if (matchResult.matches) {
      let confidence = matchResult.confidence;

      // Boost confidence for fixed-size content types when role count matches
      const isFixedSize = contentInfo.partySize.min === contentInfo.partySize.max;
      if (isFixedSize) {
        const expectedRoleCount = contentInfo.partySize.min;
        if (roleCount === expectedRoleCount) {
          confidence += 0.3;
        } else if (roleCount > 0) {
          confidence -= 0.8;
        }
      }

      if (confidence > 0 && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = { type: contentInfo.type, confidence, info: contentInfo };
      }
    }
  }

  if (bestMatch && bestMatch.confidence >= 0.02) {
    const isFixedSize = bestMatch.info.partySize.min === bestMatch.info.partySize.max;
    if (isFixedSize && bestMatch.confidence < 0.15) {
      return {
        type: "OTHER",
        confidence: 0,
        info: DEFAULT_OTHER_CONTENT_TYPE,
      };
    }
    return bestMatch;
  }

  return {
    type: "OTHER",
    confidence: 0,
    info: DEFAULT_OTHER_CONTENT_TYPE,
  };
}

function preAssignContentType(
  text: string,
  roleCount: number,
): { type: ContentType; confidence: number; info: ContentTypeInfo } | null {
  const detection = detectContentType(text);

  // If no specific content type was detected but we have 2-5 roles, default to GROUP_DUNGEON
  if (detection.confidence < 0.1 && roleCount >= 2 && roleCount <= 5) {
    const groupDungeonInfo = CONTENT_TYPE_MAPPING.find((ct) => ct.type === "GROUP_DUNGEON");
    if (groupDungeonInfo) {
      return {
        type: "GROUP_DUNGEON",
        confidence: 0.2,
        info: groupDungeonInfo,
      };
    }
  }

  return detection.confidence >= 0.1 ? detection : null;
}

export const contentTypePreprocessor: Preprocessor = createPreprocessor((context) => {
  const roleCount = context.metadata.slotCount;
  const contentType = preAssignContentType(context.originalMessage, roleCount);

  // If no content type detected, but there are 2-5 roles, default to GROUP_DUNGEON
  if (!contentType) {
    const roleCount = extractRoleCount(context.originalMessage);
    if (roleCount >= 2 && roleCount <= 5) {
      const groupDungeonInfo = CONTENT_TYPE_MAPPING.find((ct) => ct.type === "GROUP_DUNGEON");
      if (groupDungeonInfo) {
        return {
          preAssignedContentType: {
            type: "GROUP_DUNGEON",
            confidence: 0.2,
            partySize: groupDungeonInfo.partySize,
            raidType: groupDungeonInfo.raidType,
          },
        };
      }
    }
  }

  return {
    preAssignedContentType: contentType
      ? {
          type: contentType.type,
          confidence: contentType.confidence,
          partySize: contentType.info.partySize,
          raidType: contentType.info.raidType,
        }
      : null,
  };
});
