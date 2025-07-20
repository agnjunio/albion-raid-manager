import { ContentType } from "@albion-raid-manager/core/types";

import { AIProvider, AIService, AIServiceConfig, ParsedRaidData, RaidRole } from "../types";
import { detectContentType, normalizeContentType, preAssignContentType } from "../utils/content-type-preprocessor";
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

    // Pre-assign content type based on keyword matching
    const suggestedContentType = preAssignContentType(message);
    const contentTypeSection = suggestedContentType
      ? `\nSUGGESTED_CONTENT_TYPE: ${suggestedContentType.type} (confidence: ${(suggestedContentType.confidence * 100).toFixed(0)}%, party size: ${suggestedContentType.info.partySize.min}-${suggestedContentType.info.partySize.max})\n`
      : "";

    return `Parse Albion Online raid → JSON: {title, contentType, contentTypeConfidence, date(ISO), location, requirements[], roles[{name, role, preAssignedUser}], confidence(0-1)}

Msg: "${preprocessed.content}"${slotSection}${preAssignedSection}${contentTypeSection}

Roles: TANK, HEALER, SUPPORT, RANGED_DPS, MELEE_DPS, CALLER, BATTLEMOUNT
- Use pre-assigned roles when available
- FB=Fura-Bruma (bow), Tank builds→TANK, Healer→HEALER, Staff weapons→RANGED_DPS, Cursed→SUPPORT
- Content Type: Use the suggested content type if it makes sense, or override with a more appropriate one based on all Albion Online available content types (e.g. SOLO_DUNGEON, OPEN_WORLD_FARMING, etc.)
- Date: Combine date and time into a full ISO datetime (e.g., 2025077400 no time specified, use todays date at 0cation: prioritize departure/destination info, normalize city names
- Requirements: extract gear/food/requirements
- Party Size: For fixed-size content types, ensure the number of roles matches the expected party size
- Confidence: Set high confidence (0.8-1.0) for clear raid messages with roles, medium (0.6-0.8) for basic raid messages, low (0.3-0.6) for unclear messages

Return JSON only.`;
  }

  protected validateParsedData(data: unknown, originalMessage: string): ParsedRaidData {
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
      } catch {
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
      } catch {
        console.warn("Failed to parse AI time:", aiTime);
      }
    }

    // Normalize roles to ensure consistent user mention format
    const normalizedRoles = (parsedData.roles as RaidRole[] | undefined) || [];
    const processedRoles = normalizedRoles.map((role) => ({
      ...role,
      preAssignedUser: typeof role.preAssignedUser === "string" ? role.preAssignedUser : undefined,
    }));

    // Use AI's content type decision if provided, otherwise fall back to keyword detection
    const aiContentType = parsedData.contentType as string | undefined;
    const aiContentTypeConfidence = parsedData.contentTypeConfidence as number | undefined;

    let finalContentType: ContentType;
    let finalContentTypeConfidence: number;

    if (aiContentType && aiContentTypeConfidence !== undefined) {
      // Use AI's decision, but normalize it to ensure it matches our enum
      const normalizedContentType = normalizeContentType(aiContentType);
      finalContentType = normalizedContentType || "OTHER";
      finalContentTypeConfidence = aiContentTypeConfidence;
    } else {
      // Fall back to keyword detection
      const contentDetection = detectContentType(originalMessage);
      finalContentType = contentDetection.type;
      finalContentTypeConfidence = contentDetection.confidence;
    }

    // If keyword detection has high confidence, trust it over AI
    if (finalContentTypeConfidence > 0.5) {
      // Use keyword detection result
    } else {
      // Trust AI's decision when our confidence is low
    }

    // Use AI confidence without boosting/penalties
    const finalConfidence = Math.max(0, Math.min(1, (parsedData.confidence as number) || 0.5));

    const parsed: ParsedRaidData = {
      title: (parsedData.title as string) || "Raid",
      description: parsedData.description as string | undefined,
      date: raidDateTime,
      location: parsedData.location as string | undefined,
      requirements: (parsedData.requirements as string[] | undefined) || [],
      roles: processedRoles,
      maxParticipants: parsedData.maxParticipants as number | undefined,
      notes: parsedData.notes as string | undefined,
      confidence: finalConfidence,
      contentType: finalContentType,
      contentTypeConfidence: finalContentTypeConfidence,
    };

    return parsed;
  }
}
