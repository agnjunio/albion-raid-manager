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
): { type: ContentType; confidence: number; info: ContentTypeInfo } | null {
  const fixedSizeMappings = [
    { count: 1, type: "SOLO_DUNGEON" as ContentType },
    { count: 2, type: "DEPTHS_DUO" as ContentType },
    { count: 3, type: "DEPTHS_TRIO" as ContentType },
    { count: 5, type: "HELLGATE_5V5" as ContentType },
    { count: 7, type: "ROADS_OF_AVALON_PVE" as ContentType },
    { count: 10, type: "HELLGATE_10V10" as ContentType },
  ];

  const mapping = fixedSizeMappings.find((m) => m.count === roleCount);
  if (mapping) {
    const info = CONTENT_TYPE_MAPPING.find((ct) => ct.type === mapping.type);
    if (info) {
      return { type: mapping.type, confidence: 0.8, info };
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
    const fixedSizeMatch = detectFixedSizeContentType(roleCount);
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

function preAssignContentType(text: string): { type: ContentType; confidence: number; info: ContentTypeInfo } | null {
  const detection = detectContentType(text);
  return detection.confidence >= 0.1 ? detection : null;
}

export const contentTypePreprocessor: Preprocessor = createPreprocessor((context) => {
  const contentType = preAssignContentType(context.originalMessage);

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
