import { preprocessMessage, processAIResponse, processValidationResponse, type PreprocessorContext } from "../pipeline";
import { AIProvider, AIService, AIServiceConfig, ParsedRaidData } from "../types";

export abstract class BaseAIService implements AIService {
  protected config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  get provider(): AIProvider {
    return this.config.provider;
  }

  async parseDiscordPing(message: string): Promise<ParsedRaidData> {
    const context = preprocessMessage(message);
    const aiResponse = await this.generateResponse(context);
    return processAIResponse(aiResponse, message, context);
  }

  async validateMessage(message: string): Promise<boolean> {
    const context = preprocessMessage(message);
    const validationResponse = await this.generateValidationResponse(context);
    return processValidationResponse(validationResponse);
  }

  abstract generateValidationResponse(context: PreprocessorContext): Promise<unknown>;
  abstract generateResponse(context: PreprocessorContext): Promise<unknown>;

  protected createRaidParsingPrompt(context: PreprocessorContext): string {
    const slotSection = context.extractedSlots.length > 0 ? `\nSLOTS: ${context.extractedSlots.join(", ")}\n` : "";

    const preAssignedSection =
      context.preAssignedRoles.length > 0
        ? `\nPRE-ASSIGNED: ${context.preAssignedRoles.map((role) => `${role.name}→${role.role}`).join(", ")}\n`
        : "";

    const contentTypeSection = context.preAssignedContentType
      ? `\nSUGGESTED_CONTENT_TYPE: ${context.preAssignedContentType.type} (confidence: ${(context.preAssignedContentType.confidence * 100).toFixed(0)}%, party size: ${context.preAssignedContentType.partySize.min}-${context.preAssignedContentType.partySize.max})\n`
      : "";

    const requirementsSection =
      context.extractedRequirements.length > 0
        ? `\nEXTRACTED_REQUIREMENTS: ${context.extractedRequirements.join(", ")}\n`
        : "";

    const timeSection = context.extractedTime ? `\nEXTRACTED_TIME: ${context.extractedTime}\n` : "";

    return `Parse Albion Online raid → JSON: {title, contentType, contentTypeConfidence, date(ISO), location, requirements[], roles[{name, role, preAssignedUser}], confidence(0-1)}

Msg: "${context.processedMessage}"${slotSection}${preAssignedSection}${contentTypeSection}${requirementsSection}${timeSection}

CRITICAL RULES:
1. Content Type Detection: Use party size to determine content type:
   - 7 players = ROADS_OF_AVALON_PVE (Avalon Roads)
   - 2 players = DEPTHS_DUO
   - 3 players = DEPTHS_TRIO
   - 5 players = HELLGATE_5V5
   - 10 players = HELLGATE_10V10
   - 1 player = SOLO_DUNGEON or MISTS_SOLO
   - Variable size = OPEN_WORLD_FARMING, GROUP_DUNGEON, etc.

2. Location Handling:
   - For ROADS_OF_AVALON_PVE, default location is "Brecilien"
   - For other Avalon content, default location is "Brecilien"
   - "Montaria: Lobo +" is a REQUIREMENT, not a location
   - Only use actual city/location names as location

3. Requirements Extraction:
   - Extract all gear/food/mount requirements
   - "Montaria: Lobo +" goes in requirements array
   - "T8", "1 food boa", "2 ruins" are requirements
   - Gear tiers (T8, T7, etc.) are requirements
   - Food and consumables are requirements

4. Preassigned Users:
   - Include Discord user IDs in preAssignedUser field for each role
   - Format: "<@userId>" or just "userId"
   - Extract from the original message

5. Date Format:
   - Use Discord timestamp format for relative time display
   - Combine date and time into full ISO datetime

Roles: TANK, HEALER, SUPPORT, RANGED_DPS, MELEE_DPS, CALLER, BATTLEMOUNT
- Use pre-assigned roles when available
- FB=Fura-Bruma (bow), Tank builds→TANK, Healer→HEALER, Staff weapons→RANGED_DPS, Cursed→SUPPORT
- Confidence: Set high confidence (0.8-1.0) for clear raid messages with roles, medium (0.6-0.8) for basic raid messages, low (0.3-0.6) for unclear messages

Return JSON only.`;
  }
}
