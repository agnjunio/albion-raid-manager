import { CONTENT_TYPE_MAPPING, ContentTypeInfo } from "@albion-raid-manager/core/entities";
import { ContentType } from "@albion-raid-manager/core/types";

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

    if (/[🛡💚⚔🎯🐎❇💀🧊⚡🔴🟢🔵🟡🟣⚫🟤🌿🔥]/u.test(trimmedLine)) {
      roleCount++;
    }
  }

  return roleCount;
}

/**
 * Determines if a line is clearly NOT a role
 */
function isNonRoleLine(line: string): boolean {
  const nonRolePatterns = [
    /^roaming\s+as\s+\d{1,2}:\d{2}$/i,
    /^build\s+t\d+$/i,
    /^\d+\s+food\s+/i,
    /^montaria:\s+/i,
    /^@everyone$/i,
    /^@here$/i,
    /^https?:\/\//,
    /^\*\*.*\*\*$/,
  ];

  return nonRolePatterns.some((pattern) => pattern.test(line));
}

/**
 * Detects content type for fixed-size activities based on role count
 */
function detectFixedSizeContentType(
  roleCount: number,
  text?: string,
): { type: ContentType; confidence: number; info: ContentTypeInfo } | null {
  const fixedSizeMappings = [
    { count: 1, type: "SOLO_DUNGEON" as ContentType },
    { count: 2, type: "DEPTHS_DUO" as ContentType },
    { count: 3, type: "DEPTHS_TRIO" as ContentType },
    { count: 5, type: "HELLGATE_5V5" as ContentType },
    { count: 10, type: "HELLGATE_10V10" as ContentType },
  ];

  // Special handling for 7 players - could be either ROADS_OF_AVALON_PVE or ROADS_OF_AVALON_PVP
  if (roleCount === 7 && text) {
    const normalizedText = text.toLowerCase();
    const pvpKeywords = ["roaming", "ganking", "pvp", "gank", "roam"];
    const pveKeywords = ["chest", "baú", "bau", "pve", "golden", "avalon", "ava", "avalonian"];
    const hasPvpKeywords = pvpKeywords.some((keyword) => normalizedText.includes(keyword));
    const hasPveKeywords = pveKeywords.some((keyword) => normalizedText.includes(keyword));

    let contentType: ContentType;
    if (hasPvpKeywords) {
      contentType = "ROADS_OF_AVALON_PVP"; // If PvP keywords are present, it's PvP
    } else if (hasPveKeywords) {
      contentType = "ROADS_OF_AVALON_PVE"; // Otherwise check for PvE keywords
    } else {
      contentType = "ROADS_OF_AVALON_PVP"; // Default to PvP for Roads content with no keywords
    }

    const info = CONTENT_TYPE_MAPPING.find((ct) => ct.type === contentType);
    if (info) {
      return { type: contentType, confidence: 0.85, info };
    }
  }

  const mapping = fixedSizeMappings.find((m) => m.count === roleCount);
  if (mapping) {
    const info = CONTENT_TYPE_MAPPING.find((ct) => ct.type === mapping.type);
    if (info) {
      return { type: mapping.type, confidence: 0.85, info };
    }
  }

  return null;
}

/**
 * Detect content type from text using keyword matching
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

  for (const contentInfo of CONTENT_TYPE_MAPPING) {
    let matchCount = 0;
    const totalKeywords = contentInfo.keywords.length;

    for (const keyword of contentInfo.keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }

    let confidence = matchCount / totalKeywords;

    if (matchCount > 0) {
      confidence = Math.max(confidence, 0.3);
    }

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

  if (bestMatch && bestMatch.confidence >= 0.02) {
    const isFixedSize = bestMatch.info.partySize.min === bestMatch.info.partySize.max;
    if (isFixedSize && bestMatch.confidence < 0.15) {
      return {
        type: "OTHER",
        confidence: 0,
        info: {
          type: "OTHER",
          keywords: [],
          partySize: { min: 1, max: 20 },
          raidType: "FLEX",
          description: "Other content type",
        },
      };
    }
    return bestMatch;
  }

  return {
    type: "OTHER",
    confidence: 0,
    info: {
      type: "OTHER",
      keywords: [],
      partySize: { min: 1, max: 20 },
      raidType: "FLEX",
      description: "Other content type",
    },
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
