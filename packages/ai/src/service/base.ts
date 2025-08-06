import { preprocessMessage, processAIResponse, processValidationResponse, type PreprocessorContext } from "../pipeline";
import { AIProvider, AiRaid, AIService, AIServiceConfig, ParsedRaidData } from "../types";

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
  abstract generateResponse(context: PreprocessorContext): Promise<AiRaid>;

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

    return `Parse Albion Online raid → JSON: {title, contentType, timestamp, location, requirements[], roles[{name, role, preAssignedUser}], confidence(0-1)}

Msg: "${context.processedMessage}"${slotSection}${preAssignedSection}${contentTypeSection}${requirementsSection}${timeSection}

IMPORTANT:
- The message can be in any language, including a mix of languages.
- Today is ${new Date().toISOString()}.
- If the message is not clear, return a confidence of 0.
- Assume today's date if no date is provided in the message.
- Dates can't be in the past, but can be in the present or future, and in the relative format (e.g. "tomorrow", "next week", "next month", "next year") in any language.
- Assume 30 minutes ahead if no time is provided in the message.

Return JSON only.`;
  }
}
