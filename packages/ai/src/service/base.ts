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

    return `Parse Albion raid → JSON: {title, date(ISO), location, requirements[], roles[{name, role, preAssignedUser}], confidence(0-1)}

Title: Use the actual raid/dungeon name (e.g., "BAÚ DOURADO", ESTRADAS AVALON, CAVERNAS"). Do NOT use meeting points, departure locations, or "SAIDA DE" lines as the title. The title should be the destination/dungeon name, not where you're leaving from.

Msg: "${preprocessed.content}"${slotSection}${preAssignedSection}

Roles: TANK, HEALER, SUPPORT, RANGED_DPS, MELEE_DPS, CALLER, BATTLEMOUNT
- Use pre-assigned roles when available
- FB=Fura-Bruma (bow), Tank builds→TANK, Healer→HEALER, Staff weapons→RANGED_DPS, Cursed→SUPPORT
- Date: Combine date and time into a full ISO datetime (e.g., 2025077400 no time specified, use todays date at 0cation: prioritize departure/destination info, normalize city names
- Requirements: extract gear/food/requirements

Return JSON only.`;
  }

  protected validateParsedData(data: unknown): ParsedRaidData {
    // Basic validation and transformation
    const parsedData = data as Record<string, unknown>;

    // Parse and combine date and time into full datetime
    let raidDateTime = new Date();
    raidDateTime.setHours(0, 0, 0, 0); // Default to start of today

    const aiDate = parsedData.date as string | undefined;
    const aiTime = parsedData.time as string | undefined;

    if (aiDate) {
      try {
        // Try to parse the AI's date response as a full datetime
        const parsedDate = new Date(aiDate);
        if (!isNaN(parsedDate.getTime())) {
          raidDateTime = parsedDate;
        }
      } catch (error) {
        // If parsing fails, keep today's date
        console.warn("Failed to parse AI date:", aiDate);
      }
    }

    // If AI provided separate time, combine it with the date
    if (aiTime && aiTime !== "Not specified") {
      try {
        // Parse time in various formats
        let hours = 0;
        let minutes = 0;
        // Try HH:MM format
        const timeMatch = aiTime.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          hours = parseInt(timeMatch[1], 10);
          minutes = parseInt(timeMatch[2], 10);
        } else {
          // Try HHh format
          const hourMatch = aiTime.match(/(\d{1,2})h/);
          if (hourMatch) {
            hours = parseInt(hourMatch[1], 10);
          } else {
            // Try just HH format
            const justHourMatch = aiTime.match(/^(\d{1,2})$/);
            if (justHourMatch) {
              hours = parseInt(justHourMatch[1], 10);
            }
          }
        }

        // Set the time on the raid date
        raidDateTime.setHours(hours, minutes, 0, 0);
      } catch (error) {
        console.warn("Failed to parse AI time:", aiTime);
      }
    }

    // Normalize roles to ensure consistent user mention format
    const normalizedRoles = (parsedData.roles as RaidRole[] | undefined) || [];
    const processedRoles = normalizedRoles.map((role) => ({
      ...role,
      preAssignedUser: typeof role.preAssignedUser === "string" ? role.preAssignedUser : undefined,
    }));

    const parsed: ParsedRaidData = {
      title: (parsedData.title as string) || "Raid",
      description: parsedData.description as string | undefined,
      date: raidDateTime,
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
