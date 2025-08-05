import { ContentType } from "@albion-raid-manager/core/types";

import { CONTENT_TYPE_MAPPING, type ContentTypeInfo } from "./preprocessors/content-type-preprocessor";

/**
 * Content type detection utilities
 */
export function detectContentType(
  message: string,
): { type: ContentType; confidence: number; partySize: { min: number; max: number } } | null {
  const lowerMessage = message.toLowerCase();

  // Avalon Roads (7 players)
  if (lowerMessage.includes("roads") || lowerMessage.includes("avalon")) {
    return { type: "ROADS_OF_AVALON_PVE", confidence: 0.9, partySize: { min: 7, max: 7 } };
  }

  // Hellgates
  if (lowerMessage.includes("hellgate") || lowerMessage.includes("hg")) {
    if (lowerMessage.includes("10v10") || lowerMessage.includes("10vs10")) {
      return { type: "HELLGATE_10V10", confidence: 0.9, partySize: { min: 10, max: 10 } };
    }
    if (lowerMessage.includes("5v5") || lowerMessage.includes("5vs5")) {
      return { type: "HELLGATE_5V5", confidence: 0.9, partySize: { min: 5, max: 5 } };
    }
    return { type: "HELLGATE_5V5", confidence: 0.7, partySize: { min: 5, max: 5 } };
  }

  // Depths
  if (lowerMessage.includes("depths")) {
    if (lowerMessage.includes("duo") || lowerMessage.includes("2v2")) {
      return { type: "DEPTHS_DUO", confidence: 0.9, partySize: { min: 2, max: 2 } };
    }
    if (lowerMessage.includes("trio") || lowerMessage.includes("3v3")) {
      return { type: "DEPTHS_TRIO", confidence: 0.9, partySize: { min: 3, max: 3 } };
    }
    return { type: "DEPTHS_DUO", confidence: 0.7, partySize: { min: 2, max: 2 } };
  }

  // Solo content
  if (lowerMessage.includes("solo") || lowerMessage.includes("1v1")) {
    if (lowerMessage.includes("mists")) {
      return { type: "MISTS_SOLO", confidence: 0.9, partySize: { min: 1, max: 1 } };
    }
    return { type: "SOLO_DUNGEON", confidence: 0.8, partySize: { min: 1, max: 1 } };
  }

  // Group dungeons
  if (lowerMessage.includes("dungeon") || lowerMessage.includes("dungeons")) {
    return { type: "GROUP_DUNGEON", confidence: 0.7, partySize: { min: 2, max: 5 } };
  }

  // Open world
  if (lowerMessage.includes("open world") || lowerMessage.includes("farming") || lowerMessage.includes("gathering")) {
    return { type: "OPEN_WORLD_FARMING", confidence: 0.6, partySize: { min: 1, max: 10 } };
  }

  return null;
}

/**
 * Get default location for content type
 */
export function getDefaultLocation(contentType: ContentType): string {
  switch (contentType) {
    case "ROADS_OF_AVALON_PVE":
    case "HELLGATE_5V5":
    case "HELLGATE_10V10":
      return "Brecilien";
    case "DEPTHS_DUO":
    case "DEPTHS_TRIO":
      return "Brecilien";
    case "SOLO_DUNGEON":
    case "MISTS_SOLO":
      return "Bridgewatch";
    case "GROUP_DUNGEON":
      return "Bridgewatch";
    case "OPEN_WORLD_FARMING":
      return "Bridgewatch";
    default:
      return "Bridgewatch";
  }
}

/**
 * Normalize content type from string
 */
export function normalizeContentType(contentType: string): ContentType {
  const normalized = contentType.toUpperCase().replace(/[^A-Z_]/g, "");

  switch (normalized) {
    case "ROADS_OF_AVALON_PVE":
    case "AVALON_ROADS":
    case "ROADS":
      return "ROADS_OF_AVALON_PVE";
    case "HELLGATE_2V2":
    case "HG_2V2":
    case "HG_2X2":
    case "HELLGATE":
      return "HELLGATE_2V2";
    case "HELLGATE_5V5":
    case "HG_5V5":
    case "HG_5X5":
      return "HELLGATE_5V5";
    case "HELLGATE_10V10":
    case "HG_10V10":
    case "HG_10X10":
      return "HELLGATE_10V10";
    case "DEPTHS_DUO":
    case "DUO":
      return "DEPTHS_DUO";
    case "DEPTHS_TRIO":
    case "TRIO":
      return "DEPTHS_TRIO";
    case "SOLO_DUNGEON":
    case "SOLO":
      return "SOLO_DUNGEON";
    case "MISTS_SOLO":
    case "MISTS":
      return "MISTS_SOLO";
    case "GROUP_DUNGEON":
    case "DUNGEON":
      return "GROUP_DUNGEON";
    case "OPEN_WORLD_FARMING":
    case "OPEN_WORLD":
    case "FARMING":
      return "OPEN_WORLD_FARMING";
    default:
      return "GROUP_DUNGEON";
  }
}

/**
 * Get content type information for a given content type
 */
export function getContentTypeInfo(contentType: ContentType): ContentTypeInfo | null {
  return CONTENT_TYPE_MAPPING.find((info) => info.type === contentType) || null;
}
