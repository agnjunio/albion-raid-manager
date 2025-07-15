import { AIProvider, AIService, AIServiceConfig, ParsedRaidData, RaidRole } from "../types";

export abstract class BaseAIService implements AIService {
  protected config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  get provider(): AIProvider {
    return this.config.provider;
  }

  abstract parseDiscordPing(message: string): Promise<ParsedRaidData>;
  abstract validateMessage(message: string): Promise<boolean>;

  protected createRaidParsingPrompt(message: string): string {
    return `You are an AI assistant that parses Discord messages to extract raid information for Albion Online.

Please analyze the following Discord message and extract raid details in JSON format:

Message: "${message}"

Extract the following information:
- title: A concise title for the raid (e.g., "BAU PVE/PVP", "ROADS AVALON PVP/PVE", "Corrupted Dungeon")
- description: Any additional description or context
- date: The date of the raid (in ISO format, use today's date if only time is specified)
- time: The time of the raid (if mentioned, e.g., "16:20", "8 PM", "SAIDÁ ASSIM QUE FECHAR A PT")
- location: The location or zone for the raid (e.g., "BAU", "ROADS AVALON", "Corrupted Dungeon", "Roads", "Outlands")
- requirements: Array of general requirements for participants (e.g., gear level, food, energy, specs, mount requirements)
- roles: Array of roles needed with count, pre-assigned users, and role-specific requirements. For Albion Online, common roles include:
  * Standard roles: TANK, HEALER, DPS, SUPPORT
  * Specific builds: PUTRIDO (Corrupted), ARTICO (Arctic), CANÇÃO (Song), FURA BRUMA (Mistpiercer), STOPPER
  * Custom builds: MARTELO, MONARCA, REDENÇÃO/QUEDA, PATAS DE URSO, ASTRAL, AGUIA
  * Include Discord mentions (@username) as preAssignedUsers for each role
  * Include role-specific gear requirements in the requirements field for each role
- maxParticipants: Maximum number of participants (sum of all roles)
- notes: Any additional notes or special instructions
- confidence: Your confidence level (0-1) in the parsing

Important Albion Online context:
- Gear levels are often specified (e.g., "8.1", "7.3", "t8", "T8.1")
- Food and energy requirements are common
- Mount requirements are often specified
- Communication requirements (Discord call, voice chat)
- PVP vs PVE distinction is important
- Roles can be specified with emojis and parentheses (e.g., "👑(MARTELO)", "😎(MONARCA)")
- Custom server emojis are often used (e.g., ":g_bonk:", ":acs:", ":skll1:")
- Each role may have specific gear requirements listed after the user assignment
- Departure times can be conditional (e.g., "when party is full", "quando fechar")
- Users may be mentioned with or without @ symbol
- Messages may include structured sections with headers and bullet points
- Additional context like guild join commands may be included

Return only valid JSON without any additional text or formatting.`;
  }

  protected validateParsedData(data: unknown): ParsedRaidData {
    // Basic validation and transformation
    const parsedData = data as Record<string, unknown>;
    const parsed: ParsedRaidData = {
      title: (parsedData.title as string) || "Raid",
      description: parsedData.description as string | undefined,
      date: new Date((parsedData.date as string | number) || Date.now()),
      time: parsedData.time as string | undefined,
      location: parsedData.location as string | undefined,
      requirements: (parsedData.requirements as string[] | undefined) || [],
      roles: (parsedData.roles as RaidRole[] | undefined) || [],
      maxParticipants: parsedData.maxParticipants as number | undefined,
      notes: parsedData.notes as string | undefined,
      confidence: Math.max(0, Math.min(1, (parsedData.confidence as number) || 0.5)),
    };

    return parsed;
  }
}
