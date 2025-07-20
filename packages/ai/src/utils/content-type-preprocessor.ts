import { ContentType, RaidType } from "@albion-raid-manager/core/types";

// Content type mapping with keywords and metadata
export interface ContentTypeInfo {
  type: ContentType;
  keywords: string[];
  partySize: {
    min: number;
    max: number;
  };
  raidType: RaidType;
  description: string;
}

// Comprehensive mapping of Albion Online content types
export const CONTENT_TYPE_MAPPING: ContentTypeInfo[] = [
  {
    type: "SOLO_DUNGEON",
    keywords: [
      // English
      "solo dungeon",
      "solo dg",
      "solo dungeon farm",
      "solo dungeon clear",
      "solo dungeon run",
      "solo dg farm",
      "solo dg clear",
      "solo dg run",
      "solo t4",
      "solo t5",
      "solo t6",
      "solo t7",
      "solo t8",
      "solo blue",
      "solo green",
      "solo yellow",
      "solo red",
      "solo black",
      // Portuguese
      "dg solo",
      "masmorra solo",
      "masmorra individual",
      "dg solo farm",
      "dg solo clear",
      "masmorra solo farm",
      "masmorra solo clear",
      // Spanish
      "mazmorra solo",
      "mazmorra individual",
      "mazmorra solo farm",
      "mazmorra solo clear",
      // French
      "donjon solo",
      "donjon individuel",
      "donjon solo farm",
      "donjon solo clear",
      // German
      "solo dungeon",
      "einzeldungeon",
      "einzeldungeon farm",
      "einzeldungeon clear",
    ],
    partySize: { min: 1, max: 1 },
    raidType: "FIXED",
    description: "Solo dungeon clearing for farming and loot",
  },
  {
    type: "OPEN_WORLD_FARMING",
    keywords: [
      // English
      "open world",
      "ow farm",
      "ow farming",
      "open world farm",
      "open world farming",
      "resource gathering",
      "gathering",
      "farming",
      "ow",
      "open world pve",
      "t4",
      "t5",
      "t6",
      "t7",
      "t8",
      "blue",
      "green",
      "yellow",
      "red",
      "black",
      // Portuguese
      "mundo aberto",
      "ow farm",
      "ow farming",
      "farming",
      "coleta",
      "coleta de recursos",
      "fazenda",
      "fazendo",
      "ow",
      "mundo aberto pve",
      // Spanish
      "mundo abierto",
      "ow farm",
      "ow farming",
      "farming",
      "recolección",
      "recolección de recursos",
      "granja",
      "cultivo",
      "ow",
      "mundo abierto pve",
      // French
      "monde ouvert",
      "ow farm",
      "ow farming",
      "farming",
      "récolte",
      "récolte de ressources",
      "ferme",
      "agriculture",
      "ow",
      "monde ouvert pve",
      // German
      "offene welt",
      "ow farm",
      "ow farming",
      "farming",
      "sammeln",
      "ressourcen sammeln",
      "farm",
      "landwirtschaft",
      "ow",
      "offene welt pve",
    ],
    partySize: { min: 1, max: 20 },
    raidType: "FLEX",
    description: "Open world resource gathering and farming",
  },
  {
    type: "GROUP_DUNGEON",
    keywords: [
      // English
      "group dungeon",
      "group dg",
      "group",
      "group clear",
      "group farm",
      "group t4",
      "group t5",
      "group t6",
      "group t7",
      "group t8",
      "group blue",
      "group green",
      "group yellow",
      "group red",
      "group black",
      "dungeon",
      "dg",
      "clear",
      "farm",
      // Portuguese
      "dg grupo",
      "masmorra grupo",
      "masmorra em grupo",
      "grupo",
      "grupo clear",
      "grupo farm",
      "masmorra",
      "dg",
      "limpar",
      "fazenda",
      "group dungeon",
      "group dg",
      "group",
      "group clear",
      "group farm",
      "dungeon",
      "clear",
      "farm",
      // Spanish
      "dg grupo",
      "mazmorra grupo",
      "mazmorra en grupo",
      "grupo",
      "grupo clear",
      "grupo farm",
      "mazmorra",
      "dg",
      "limpiar",
      "granja",
      "group dungeon",
      "group dg",
      "group",
      "group clear",
      "group farm",
      "dungeon",
      "clear",
      "farm",
      // French
      "dg groupe",
      "donjon groupe",
      "donjon en groupe",
      "groupe",
      "groupe clear",
      "groupe farm",
      "donjon",
      "dg",
      "nettoyer",
      "ferme",
      "group dungeon",
      "group dg",
      "group",
      "group clear",
      "group farm",
      "dungeon",
      "clear",
      "farm",
      // German
      "dg gruppe",
      "dungeon gruppe",
      "dungeon in gruppe",
      "gruppe",
      "gruppe clear",
      "gruppe farm",
      "dungeon",
      "dg",
      "reinigen",
      "farm",
      "group dungeon",
      "group dg",
      "group",
      "group clear",
      "group farm",
      "clear",
    ],
    partySize: { min: 2, max: 5 },
    raidType: "FLEX",
    description: "Group dungeon clearing with 2-5 players",
  },
  {
    type: "AVALONIAN_DUNGEON_FULL_CLEAR",
    keywords: [
      // English
      "avalon",
      "avalon full",
      "avalon clear",
      "avalon full clear",
      "avalon dungeon",
      "avalon dg",
      "avalon full clear",
      "avalon complete",
      "avalon full run",
      "avalon t6",
      "avalon t7",
      "avalon t8",
      // Portuguese
      "avalon",
      "avalon completo",
      "avalon clear",
      "avalon full clear",
      "avalon masmorra",
      "avalon dg",
      "avalon completo",
      "avalon finalizado",
      "avalon full run",
      // Spanish
      "avalon",
      "avalon completo",
      "avalon clear",
      "avalon full clear",
      "avalon mazmorra",
      "avalon dg",
      "avalon completo",
      "avalon terminado",
      "avalon full run",
      // French
      "avalon",
      "avalon complet",
      "avalon clear",
      "avalon full clear",
      "avalon donjon",
      "avalon dg",
      "avalon complet",
      "avalon terminé",
      "avalon full run",
      // German
      "avalon",
      "avalon vollständig",
      "avalon clear",
      "avalon full clear",
      "avalon dungeon",
      "avalon dg",
      "avalon vollständig",
      "avalon abgeschlossen",
      "avalon full run",
    ],
    partySize: { min: 5, max: 20 },
    raidType: "FLEX",
    description: "Avalonian dungeon full clear with 5-20 players",
  },
  {
    type: "AVALONIAN_DUNGEON_BUFF_ONLY",
    keywords: [
      // English
      "avalon buff",
      "avalon buff only",
      "avalon buff run",
      "avalon buff clear",
      "avalon buff farm",
      "avalon buff only",
      "avalon buff run",
      // Portuguese
      "avalon buff",
      "avalon apenas buff",
      "avalon buff run",
      "avalon buff clear",
      "avalon buff farm",
      "avalon só buff",
      // Spanish
      "avalon buff",
      "avalon solo buff",
      "avalon buff run",
      "avalon buff clear",
      "avalon buff farm",
      "avalon solo buff",
      // French
      "avalon buff",
      "avalon buff seulement",
      "avalon buff run",
      "avalon buff clear",
      "avalon buff farm",
      "avalon buff uniquement",
      // German
      "avalon buff",
      "avalon nur buff",
      "avalon buff run",
      "avalon buff clear",
      "avalon buff farm",
      "avalon nur buff",
    ],
    partySize: { min: 5, max: 20 },
    raidType: "FLEX",
    description: "Avalonian dungeon buff-only run with 5-20 players",
  },
  {
    type: "ROADS_OF_AVALON_PVE",
    keywords: [
      // English
      "roads pve",
      "roads of avalon pve",
      "roads farming",
      "roads farm",
      "roads pve farm",
      "roads pve clear",
      "roads pve run",
      "roads avalon pve",
      "roads avalon pvp/pve",
      "roads avalon",
      // Portuguese
      "estradas pve",
      "estradas de avalon pve",
      "estradas farming",
      "estradas farm",
      "estradas pve farm",
      "estradas pve clear",
      "estradas pve run",
      "estradas avalon pve",
      "estradas avalon pvp/pve",
      "estradas avalon",
      "roads pve",
      "roads of avalon pve",
      "roads farming",
      "roads farm",
      "roads pve farm",
      "roads pve clear",
      "roads pve run",
      "roads avalon pve",
      "roads avalon pvp/pve",
      "roads avalon",
      "golden chest",
      // Spanish
      "caminos pve",
      "caminos de avalon pve",
      "caminos farming",
      "caminos farm",
      "caminos pve farm",
      "caminos pve clear",
      "caminos pve run",
      "caminos avalon pve",
      "caminos avalon pvp/pve",
      "caminos avalon",
      "cofre dorado",
      "cofre",
      // French
      "routes pve",
      "routes d'avalon pve",
      "routes farming",
      "routes farm",
      "routes pve farm",
      "routes pve clear",
      "routes pve run",
      "routes avalon pve",
      "routes avalon pvp/pve",
      "routes avalon",
      "coffre doré",
      "coffre",
      // German
      "straßen pve",
      "straßen von avalon pve",
      "straßen farming",
      "straßen farm",
      "straßen pve farm",
      "straßen pve clear",
      "straßen pve run",
      "straßen avalon pve",
      "straßen avalon pvp/pve",
      "straßen avalon",
      "goldene truhe",
      "truhe",
    ],
    partySize: { min: 7, max: 7 },
    raidType: "FIXED",
    description: "Roads of Avalon PvE only content",
  },
  {
    type: "ROADS_OF_AVALON_PVP",
    keywords: [
      // English
      "roads pvp",
      "roads of avalon pvp",
      "roads ganking",
      "roads pvp gank",
      "roads pvp roam",
      "roads pvp fight",
      "roads pvp content",
      "roads avalon pvp",
      "roads avalon pvp/pve",
      "golden chest pvp",
      // Portuguese
      "estradas pvp",
      "estradas de avalon pvp",
      "estradas ganking",
      "estradas pvp gank",
      "estradas pvp roam",
      "estradas pvp fight",
      "estradas pvp content",
      "estradas avalon pvp",
      "estradas avalon pvp/pve",
      "baú dourado pvp",
      "bau dourado pvp",
      "bau dourado",
      "baú dourado",
      "bau de ouro",
      "baú de ouro",
      "bau dourado pvp",
      "baú dourado pvp",
      "bau de ouro pvp",
      "baú de ouro pvp",
      // Spanish
      "caminos pvp",
      "caminos de avalon pvp",
      "caminos ganking",
      "caminos pvp gank",
      "caminos pvp roam",
      "caminos pvp fight",
      "caminos pvp content",
      "caminos avalon pvp",
      "caminos avalon pvp/pve",
      "cofre dorado pvp",
      // French
      "routes pvp",
      "routes d'avalon pvp",
      "routes ganking",
      "routes pvp gank",
      "routes pvp roam",
      "routes pvp fight",
      "routes pvp content",
      "routes avalon pvp",
      "routes avalon pvp/pve",
      "coffre doré pvp",
      // German
      "straßen pvp",
      "straßen von avalon pvp",
      "straßen ganking",
      "straßen pvp gank",
      "straßen pvp roam",
      "straßen pvp fight",
      "straßen pvp content",
      "straßen avalon pvp",
      "straßen avalon pvp/pve",
      "goldene truhe pvp",
    ],
    partySize: { min: 7, max: 7 },
    raidType: "FIXED",
    description: "Roads of Avalon PvP content",
  },
  {
    type: "DEPTHS_DUO",
    keywords: [
      // English
      "depths",
      "depths duo",
      "depths 2v2",
      "depths 2 man",
      "depths 2-man",
      "depths 2 player",
      "depths 2 players",
      "depths duo run",
      "depths duo clear",
      // Portuguese
      "profundezas",
      "profundezas duo",
      "profundezas 2v2",
      "profundezas 2 pessoas",
      "profundezas 2 jogadores",
      "profundezas duo run",
      "profundezas duo clear",
      "bora depths",
      "bora de depths",
      "vamos depths",
      "bora profundezas",
      "vamos profundezas",
      // Spanish
      "profundidades",
      "profundidades duo",
      "profundidades 2v2",
      "profundidades 2 personas",
      "profundidades 2 jugadores",
      "profundidades duo run",
      "profundidades duo clear",
      "vamos profundidades",
      // French
      "profondeurs",
      "profondeurs duo",
      "profondeurs 2v2",
      "profondeurs 2 personnes",
      "profondeurs 2 joueurs",
      "profondeurs duo run",
      "profondeurs duo clear",
      "allons profondeurs",
      // German
      "tiefen",
      "tiefen duo",
      "tiefen 2v2",
      "tiefen 2 spieler",
      "tiefen duo run",
      "tiefen duo clear",
      "lass uns tiefen",
    ],
    partySize: { min: 2, max: 2 },
    raidType: "FIXED",
    description: "Depths content for 2 players",
  },
  {
    type: "DEPTHS_TRIO",
    keywords: [
      // English
      "depths trio",
      "depths 3v3",
      "depths 3 man",
      "depths 3-man",
      "depths 3 player",
      "depths 3 players",
      "depths trio run",
      "depths trio clear",
      "depths 3",
      "depths 3v3",
      // Portuguese
      "profundezas trio",
      "profundezas 3v3",
      "profundezas 3 pessoas",
      "profundezas 3 jogadores",
      "profundezas trio run",
      "profundezas trio clear",
      "profundezas 3",
      // Spanish
      "profundidades trio",
      "profundidades 3v3",
      "profundidades 3 personas",
      "profundidades 3 jugadores",
      "profundidades trio run",
      "profundidades trio clear",
      "profundidades 3",
      // French
      "profondeurs trio",
      "profondeurs 3v3",
      "profondeurs 3 personnes",
      "profondeurs 3 joueurs",
      "profondeurs trio run",
      "profondeurs trio clear",
      "profondeurs 3",
      // German
      "tiefen trio",
      "tiefen 3v3",
      "tiefen 3 spieler",
      "tiefen trio run",
      "tiefen trio clear",
      "tiefen 3",
    ],
    partySize: { min: 3, max: 3 },
    raidType: "FIXED",
    description: "Depths content for 3 players",
  },
  {
    type: "GANKING_SQUAD",
    keywords: [
      // English
      "ganking",
      "gank",
      "gank squad",
      "ganking squad",
      "gank group",
      "ganking group",
      "gank roam",
      "ganking roam",
      "gank pvp",
      "ganking pvp",
      "gank content",
      // Portuguese
      "ganking",
      "gank",
      "gankas",
      "gank squad",
      "ganking squad",
      "gank group",
      "ganking group",
      "gank roam",
      "ganking roam",
      "gank pvp",
      "ganking pvp",
      "gank content",
      "emboscada",
      "emboscar",
      "ganking",
      "gank",
      "gank squad",
      "ganking squad",
      "gank group",
      "ganking group",
      "gank roam",
      "ganking roam",
      "gank pvp",
      "ganking pvp",
      "gank content",
      // Spanish
      "ganking",
      "gank",
      "gank squad",
      "ganking squad",
      "gank group",
      "ganking group",
      "gank roam",
      "ganking roam",
      "gank pvp",
      "ganking pvp",
      "gank content",
      "emboscada",
      "emboscar",
      // French
      "ganking",
      "gank",
      "gank squad",
      "ganking squad",
      "gank group",
      "ganking group",
      "gank roam",
      "ganking roam",
      "gank pvp",
      "ganking pvp",
      "gank content",
      "embuscade",
      "embusquer",
      // German
      "ganking",
      "gank",
      "gank squad",
      "ganking squad",
      "gank group",
      "ganking group",
      "gank roam",
      "ganking roam",
      "gank pvp",
      "ganking pvp",
      "gank content",
      "überfall",
      "überfallen",
    ],
    partySize: { min: 2, max: 10 },
    raidType: "FLEX",
    description: "Ganking squad for PvP content with 2-10 players",
  },
  {
    type: "FIGHTING_SQUAD",
    keywords: [
      "fighting",
      "fight",
      "fighting squad",
      "fight squad",
      "fighting group",
      "fight group",
      "fighting roam",
      "fight roam",
      "fighting pvp",
      "fight pvp",
      "fighting content",
      "zerg",
      "zerg fight",
      "zerg fighting",
      "zerg content",
    ],
    partySize: { min: 5, max: 20 },
    raidType: "FLEX",
    description: "Fighting squad for PvP content with 5-20 players",
  },
  {
    type: "ZVZ_CALL_TO_ARMS",
    keywords: [
      "zvz",
      "zerg vs zerg",
      "call to arms",
      "cta",
      "zvz cta",
      "zerg vs zerg cta",
      "territory war",
      "territory fight",
      "territory battle",
      "castle fight",
      "castle battle",
      "territory control",
      "territory defense",
      "territory attack",
    ],
    partySize: { min: 10, max: 50 },
    raidType: "FLEX",
    description: "ZvZ (Zerg vs Zerg) content with 10-50 players",
  },
  {
    type: "HELLGATE_2V2",
    keywords: [
      // English
      "hellgate 2v2",
      "hellgate 2vs2",
      "hellgate 2 man",
      "hellgate 2-man",
      "hellgate 2 player",
      "hellgate 2 players",
      "hg 2v2",
      "hg 2vs2",
      // Portuguese
      "hellgate 2v2",
      "hellgate 2vs2",
      "hellgate 2 pessoas",
      "hellgate 2 jogadores",
      "hg 2v2",
      "hg 2vs2",
      "portão do inferno 2v2",
      // Spanish
      "hellgate 2v2",
      "hellgate 2vs2",
      "hellgate 2 personas",
      "hellgate 2 jugadores",
      "hg 2v2",
      "hg 2vs2",
      "puerta del infierno 2v2",
      // French
      "hellgate 2v2",
      "hellgate 2vs2",
      "hellgate 2 personnes",
      "hellgate 2 joueurs",
      "hg 2v2",
      "hg 2vs2",
      "porte de l'enfer 2v2",
      // German
      "hellgate 2v2",
      "hellgate 2vs2",
      "hellgate 2 spieler",
      "hg 2v2",
      "hg 2vs2",
      "höllentor 2v2",
    ],
    partySize: { min: 2, max: 2 },
    raidType: "FIXED",
    description: "Hellgate 2v2 PvP content",
  },
  {
    type: "HELLGATE_5V5",
    keywords: [
      "hellgate 5v5",
      "hellgate 5vs5",
      "hellgate 5 man",
      "hellgate 5-man",
      "hellgate 5 player",
      "hellgate 5 players",
      "hg 5v5",
      "hg 5vs5",
    ],
    partySize: { min: 5, max: 5 },
    raidType: "FIXED",
    description: "Hellgate 5v5 PvP content",
  },
  {
    type: "HELLGATE_10V10",
    keywords: [
      "hellgate 10v10",
      "hellgate 10vs10",
      "hellgate 10 man",
      "hellgate 10-man",
      "hellgate 10 player",
      "hellgate 10 players",
      "hg 10v10",
      "hg 10vs10",
    ],
    partySize: { min: 10, max: 10 },
    raidType: "FIXED",
    description: "Hellgate 10v10 PvP content",
  },
  {
    type: "MISTS_SOLO",
    keywords: [
      // English
      "mists solo",
      "mists 1v1",
      "mists 1 man",
      "mists 1-man",
      "mists 1 player",
      "mists 1 players",
      "mists solo run",
      "mists solo content",
      "mists solo pvp",
      "mists solo arena",
      // Portuguese
      "névoas solo",
      "névoas 1v1",
      "névoas 1 pessoa",
      "névoas 1 jogador",
      "névoas solo run",
      "névoas solo content",
      "névoas solo pvp",
      "névoas solo arena",
      // Spanish
      "nieblas solo",
      "nieblas 1v1",
      "nieblas 1 persona",
      "nieblas 1 jugador",
      "nieblas solo run",
      "nieblas solo content",
      "nieblas solo pvp",
      "nieblas solo arena",
      // French
      "brumes solo",
      "brumes 1v1",
      "brumes 1 personne",
      "brumes 1 joueur",
      "brumes solo run",
      "brumes solo content",
      "brumes solo pvp",
      "brumes solo arena",
      // German
      "nebel solo",
      "nebel 1v1",
      "nebel 1 spieler",
      "nebel solo run",
      "nebel solo content",
      "nebel solo pvp",
      "nebel solo arena",
    ],
    partySize: { min: 1, max: 1 },
    raidType: "FIXED",
    description: "Mists solo content",
  },
  {
    type: "MISTS_DUO",
    keywords: [
      "mists duo",
      "mists 2v2",
      "mists 2 man",
      "mists 2-man",
      "mists 2 player",
      "mists 2 players",
      "mists duo run",
      "mists duo content",
    ],
    partySize: { min: 2, max: 2 },
    raidType: "FIXED",
    description: "Mists duo content",
  },
];

/**
 * Detect content type from text using keyword matching
 * @param text - The text to analyze
 * @returns The detected content type and confidence score
 */
export function detectContentType(text: string): { type: ContentType; confidence: number; info: ContentTypeInfo } {
  const normalizedText = text.toLowerCase().trim();
  let bestMatch: { type: ContentType; confidence: number; info: ContentTypeInfo } | null = null;

  // Extract role count from the message
  const roleCount = extractRoleCount(text);

  for (const contentInfo of CONTENT_TYPE_MAPPING) {
    let matchCount = 0;
    const totalKeywords = contentInfo.keywords.length;

    for (const keyword of contentInfo.keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }

    let confidence = matchCount / totalKeywords;

    // Boost confidence for exact or very specific keyword matches
    if (matchCount > 0) {
      // If we have any matches, boost the confidence significantly
      confidence = Math.max(confidence, 0.3);
    }

    // Apply role count bonus/penalty for all fixed-size content types
    const isFixedSize = contentInfo.partySize.min === contentInfo.partySize.max;
    if (isFixedSize) {
      const expectedRoleCount = contentInfo.partySize.min;

      if (roleCount === expectedRoleCount) {
        confidence += 0.3; // Bonus for matching expected role count
      } else if (roleCount > 0) {
        confidence -= 0.8; // Very strong penalty for mismatched role count
      }
    }

    if (confidence > 0) {
      if (!bestMatch || confidence > bestMatch.confidence) {
        bestMatch = {
          type: contentInfo.type,
          confidence,
          info: contentInfo,
        };
      }
    }
  }

  // Return best match or OTHER if no match found
  if (bestMatch && bestMatch.confidence >= 0.02) {
    // For fixed-size content types, require higher confidence to avoid false positives
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

/**
 * Extract the number of roles from a message
 * @param text - The message text
 * @returns The number of roles found
 */
function extractRoleCount(text: string): number {
  // Count lines that look like role assignments
  const lines = text.split("\n");
  let roleCount = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();
    // Look for patterns like "Role -", "Role:", "Role =", etc.
    // Simple pattern: any text followed by - or : (with optional spaces)
    if (trimmedLine.match(/^.+[-:=]\s*$/)) {
      roleCount++;
    } else if (trimmedLine.match(/^.+[-:=]\s*[^-\s]+$/)) {
      roleCount++;
    }
  }

  return roleCount;
}

/**
 * Pre-assigns content type based on keyword matching
 * This provides a suggestion to the AI that can be confirmed or overridden
 * Similar to preAssignRoles pattern
 */
export function preAssignContentType(
  text: string,
): { type: ContentType; confidence: number; info: ContentTypeInfo } | null {
  const detection = detectContentType(text);

  // Boost confidence for clear keyword matches to help AI make better decisions
  let adjustedConfidence = detection.confidence;

  // If we have a clear keyword match, boost the confidence
  if (detection.confidence > 0.1) {
    adjustedConfidence = Math.min(0.8, detection.confidence + 0.2);
  }

  // Only return a suggestion if we have reasonable confidence
  if (adjustedConfidence >= 0.02) {
    return {
      ...detection,
      confidence: adjustedConfidence,
    };
  }

  return null;
}

/**
 * Get content type information by type
 * @param type - The content type
 * @returns Content type information or null if not found
 */
export function getContentTypeInfo(type: ContentType): ContentTypeInfo | null {
  return CONTENT_TYPE_MAPPING.find((info) => info.type === type) || null;
}

/**
 * Get all content types
 * @returns Array of all content types
 */
export function getAllContentTypes(): ContentType[] {
  return CONTENT_TYPE_MAPPING.map((info) => info.type);
}

/**
 * Get content types by raid type (FIXED or FLEX)
 * @param raidType - The raid type to filter by
 * @returns Array of content types for the specified raid type
 */
export function getContentTypesByRaidType(raidType: RaidType): ContentType[] {
  return CONTENT_TYPE_MAPPING.filter((info) => info.raidType === raidType).map((info) => info.type);
}

/**
 * Normalize and map AI content type response to our defined ContentType enum
 * Handles variations, typos, and similar content type names
 * @param aiContentType - The content type returned by AI
 * @returns The normalized ContentType or null if no match found
 */
export function normalizeContentType(aiContentType: string): ContentType | null {
  if (!aiContentType) return null;

  const normalized = aiContentType.trim().toUpperCase();

  // Direct matches first
  const directMatch = CONTENT_TYPE_MAPPING.find((info) => info.type === normalized);
  if (directMatch) return directMatch.type;

  // Common variations and mappings
  const variations: Record<string, ContentType> = {
    // Solo variations
    SOLO: "SOLO_DUNGEON",
    SOLO_DG: "SOLO_DUNGEON",
    SOLO_DUNGEONS: "SOLO_DUNGEON",
    SOLOING: "SOLO_DUNGEON",
    SOLO_FARM: "SOLO_DUNGEON",
    SOLO_CLEAR: "SOLO_DUNGEON",
    SOZINHO: "SOLO_DUNGEON",
    INDIVIDUAL: "SOLO_DUNGEON",
    INDIVIDUEL: "SOLO_DUNGEON",
    EINZELN: "SOLO_DUNGEON",

    // Open world variations
    OPEN_WORLD: "OPEN_WORLD_FARMING",
    OW_FARM: "OPEN_WORLD_FARMING",
    OW_FARMING: "OPEN_WORLD_FARMING",
    RESOURCE_GATHERING: "OPEN_WORLD_FARMING",
    GATHERING: "OPEN_WORLD_FARMING",
    FARMING: "OPEN_WORLD_FARMING",
    MUNDO_ABERTO: "OPEN_WORLD_FARMING",
    COLETA: "OPEN_WORLD_FARMING",
    MUNDO_ABIERTO: "OPEN_WORLD_FARMING",
    RECOLECCIÓN: "OPEN_WORLD_FARMING",
    MONDE_OUVERT: "OPEN_WORLD_FARMING",
    RÉCOLTE: "OPEN_WORLD_FARMING",
    OFFENE_WELT: "OPEN_WORLD_FARMING",
    SAMMELN: "OPEN_WORLD_FARMING",

    // Group variations
    GROUP: "GROUP_DUNGEON",
    GROUP_DG: "GROUP_DUNGEON",
    GROUP_DUNGEONS: "GROUP_DUNGEON",
    DUNGEON: "GROUP_DUNGEON",
    DG: "GROUP_DUNGEON",
    GRUPO: "GROUP_DUNGEON",
    MASMORRA: "GROUP_DUNGEON",
    MAZMORRA: "GROUP_DUNGEON",
    DONJON: "GROUP_DUNGEON",
    EINZELDUNGEON: "GROUP_DUNGEON",

    // Avalonian variations
    AVALON: "AVALONIAN_DUNGEON_FULL_CLEAR",
    AVALON_DUNGEON: "AVALONIAN_DUNGEON_FULL_CLEAR",
    AVALON_FULL: "AVALONIAN_DUNGEON_FULL_CLEAR",
    AVALON_CLEAR: "AVALONIAN_DUNGEON_FULL_CLEAR",
    AVALON_FULL_CLEAR: "AVALONIAN_DUNGEON_FULL_CLEAR",
    AVALONIAN: "AVALONIAN_DUNGEON_FULL_CLEAR",
    AVALONIAN_DUNGEON: "AVALONIAN_DUNGEON_FULL_CLEAR",
    AVALON_BUFF: "AVALONIAN_DUNGEON_BUFF_ONLY",
    AVALON_BUFF_ONLY: "AVALONIAN_DUNGEON_BUFF_ONLY",
    AVALONIAN_BUFF: "AVALONIAN_DUNGEON_BUFF_ONLY",
    AVALONIAN_BUFF_ONLY: "AVALONIAN_DUNGEON_BUFF_ONLY",

    // Roads variations
    ROADS: "ROADS_OF_AVALON_PVE",
    ROADS_PVE: "ROADS_OF_AVALON_PVE",
    ROADS_OF_AVALON: "ROADS_OF_AVALON_PVE",
    ROADS_PVP: "ROADS_OF_AVALON_PVP",
    ROADS_GANKING: "ROADS_OF_AVALON_PVP",
    BAU_DOURADO: "ROADS_OF_AVALON_PVE",
    BAÚ_DOURADO: "ROADS_OF_AVALON_PVE",
    GOLDEN_CHEST: "ROADS_OF_AVALON_PVE",
    BAU: "ROADS_OF_AVALON_PVE",
    BAÚ: "ROADS_OF_AVALON_PVE",

    // Depths variations
    DEPTHS: "DEPTHS_DUO",
    DEPTHS_2V2: "DEPTHS_DUO",
    DEPTHS_2VS2: "DEPTHS_DUO",
    DEPTHS_2_MAN: "DEPTHS_DUO",
    DEPTHS_2_PLAYER: "DEPTHS_DUO",
    DEPTHS_3V3: "DEPTHS_TRIO",
    DEPTHS_3VS3: "DEPTHS_TRIO",
    DEPTHS_3_MAN: "DEPTHS_TRIO",
    DEPTHS_3_PLAYER: "DEPTHS_TRIO",
    PROFUNDEZAS: "DEPTHS_DUO",
    PROFUNDIDADES: "DEPTHS_DUO",
    PROFONDEURS: "DEPTHS_DUO",
    TIEFEN: "DEPTHS_DUO",

    // Ganking variations
    GANK: "GANKING_SQUAD",
    GANKING: "GANKING_SQUAD",
    GANK_SQUAD: "GANKING_SQUAD",
    GANK_GROUP: "GANKING_SQUAD",
    GANK_ROAM: "GANKING_SQUAD",
    EMBOSCADA: "GANKING_SQUAD",
    EMBOSCAR: "GANKING_SQUAD",
    EMBUSCADE: "GANKING_SQUAD",
    EMBUSQUER: "GANKING_SQUAD",
    ÜBERFALL: "GANKING_SQUAD",
    ÜBERFALLEN: "GANKING_SQUAD",

    // Fighting variations
    FIGHT: "FIGHTING_SQUAD",
    FIGHTING: "FIGHTING_SQUAD",
    FIGHT_SQUAD: "FIGHTING_SQUAD",
    FIGHT_GROUP: "FIGHTING_SQUAD",
    FIGHT_ROAM: "FIGHTING_SQUAD",
    ZERG: "FIGHTING_SQUAD",
    ZERG_FIGHT: "FIGHTING_SQUAD",
    ZERG_FIGHTING: "FIGHTING_SQUAD",

    // ZvZ variations
    ZVZ: "ZVZ_CALL_TO_ARMS",
    ZERG_VS_ZERG: "ZVZ_CALL_TO_ARMS",
    CALL_TO_ARMS: "ZVZ_CALL_TO_ARMS",
    CTA: "ZVZ_CALL_TO_ARMS",
    TERRITORY_WAR: "ZVZ_CALL_TO_ARMS",
    TERRITORY_FIGHT: "ZVZ_CALL_TO_ARMS",
    TERRITORY_BATTLE: "ZVZ_CALL_TO_ARMS",
    CASTLE_FIGHT: "ZVZ_CALL_TO_ARMS",
    CASTLE_BATTLE: "ZVZ_CALL_TO_ARMS",

    // Hellgate variations
    HELLGATE: "HELLGATE_5V5",
    HG: "HELLGATE_5V5",
    HG_2V2: "HELLGATE_2V2",
    HG_2VS2: "HELLGATE_2V2",
    HELLGATE_2VS2: "HELLGATE_2V2",
    HG_5V5: "HELLGATE_5V5",
    HG_5VS5: "HELLGATE_5V5",
    HELLGATE_5VS5: "HELLGATE_5V5",
    HG_10V10: "HELLGATE_10V10",
    HG_10VS10: "HELLGATE_10V10",
    HELLGATE_10VS10: "HELLGATE_10V10",

    // Mists variations
    MISTS: "MISTS_SOLO",
    MISTS_1V1: "MISTS_SOLO",
    MISTS_1VS1: "MISTS_SOLO",
    MISTS_1_MAN: "MISTS_SOLO",
    MISTS_1_PLAYER: "MISTS_SOLO",
    MISTS_2V2: "MISTS_DUO",
    MISTS_2VS2: "MISTS_DUO",
    MISTS_2_MAN: "MISTS_DUO",
    MISTS_2_PLAYER: "MISTS_DUO",
  };

  // Check for exact variation match
  if (variations[normalized]) {
    return variations[normalized];
  }

  // Check for partial matches (e.g., "SOLO_DUNGEON_T8" should match "SOLO_DUNGEON")
  for (const [variation, contentType] of Object.entries(variations)) {
    if (normalized.includes(variation) || variation.includes(normalized)) {
      return contentType;
    }
  }

  // Check for partial matches with our defined content types
  for (const contentInfo of CONTENT_TYPE_MAPPING) {
    if (normalized.includes(contentInfo.type) || contentInfo.type.includes(normalized)) {
      return contentInfo.type;
    }
  }

  // If no match found, return OTHER
  return "OTHER";
}
