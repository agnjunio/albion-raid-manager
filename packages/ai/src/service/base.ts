import { AIProvider, AIService, AIServiceConfig, ParsedRaidData, RaidRole } from "../types";
import { preprocessMessage } from "../utils/message-preprocessor";
import { PreAssignedRole, preAssignRoles } from "../utils/role-preassigner";

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

  protected createRaidParsingPrompt(message: string, extractedSlots?: string[]): string {
    // Pre-process message to reduce tokens
    const preprocessed = preprocessMessage(message);

    const slotSection = extractedSlots && extractedSlots.length > 0 ? `\nSLOTS: ${extractedSlots.join(", ")}\n` : "";

    // Pre-assign roles based on weapon/build knowledge
    const preAssignedRoles = extractedSlots ? preAssignRoles(extractedSlots) : [];
    const preAssignedSection =
      preAssignedRoles.length > 0
        ? `\nPRE-ASSIGNED: ${preAssignedRoles.map((role: PreAssignedRole) => `${role.name}→${role.role}`).join(", ")}\n`
        : "";

    return `Parse Albion raid → JSON: {title, date(ISO), time, location, requirements[], roles[{name, role, preAssignedUser}], confidence(0-1)}

Title: Use the main event/raid name or announcement (usually the first prominent line, including emojis). Do NOT use gear, requirements, or composition lines as the title. Preserve emojis in the title.

Msg: "${preprocessed.content}"${slotSection}${preAssignedSection}

Roles: TANK, HEALER, SUPPORT, RANGED_DPS, MELEE_DPS, CALLER, BATTLEMOUNT
- Use pre-assigned roles when available
- FB=Fura-Bruma (bow), Tank builds→TANK, Healer→HEALER, Staff weapons→RANGED_DPS, Cursed→SUPPORT
- Date: ${new Date().toISOString().split("T")[0]} (today)
- Time: extract or "Not specified"
- Location: prioritize departure/destination info, normalize city names
- Requirements: extract gear/food/requirements

Return JSON only.`;
  }

  protected validateParsedData(data: unknown): ParsedRaidData {
    // Basic validation and transformation
    const parsedData = data as Record<string, unknown>;

    // Always use today's date regardless of what the AI returns
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day

    // Normalize roles to ensure consistent user mention format
    const normalizedRoles = (parsedData.roles as RaidRole[] | undefined) || [];
    const processedRoles = normalizedRoles.map((role) => ({
      ...role,
      preAssignedUser: typeof role.preAssignedUser === "string" ? role.preAssignedUser : undefined,
    }));

    const parsed: ParsedRaidData = {
      title: (parsedData.title as string) || "Raid",
      description: parsedData.description as string | undefined,
      date: today, // Always use today's date
      time: parsedData.time as string | undefined,
      location: parsedData.location as string | undefined,
      requirements: (parsedData.requirements as string[] | undefined) || [],
      roles: processedRoles,
      maxParticipants: parsedData.maxParticipants as number | undefined,
      notes: parsedData.notes as string | undefined,
      confidence: Math.max(0, Math.min(1, (parsedData.confidence as number) || 0.5)),
    };

    return parsed;
  }
}
