import { logger } from "@albion-raid-manager/logger";

import { getAIService } from "./service/factory";
import { AIParsingError, DiscordMessageContext, ParsedRaidData } from "./types";

// Lazy initialization to allow test mocks to work properly
let aiService: ReturnType<typeof getAIService> | null = null;

function getAIServiceInstance() {
  if (!aiService) {
    aiService = getAIService();
  }
  return aiService;
}

// Export for testing purposes
export function resetAIService() {
  aiService = null;
}

export async function parseDiscordMessage(message: string, context: DiscordMessageContext): Promise<ParsedRaidData> {
  try {
    const service = getAIServiceInstance();
    logger.debug("Parsing Discord message with AI.", {
      content: message.substring(0, 100) + "...",
      provider: service.provider,
      context,
    });

    // First validate if the message is raid-related
    const isValid = await service.validateMessage(message);
    if (!isValid) {
      throw new AIParsingError("Message does not appear to be raid-related", message, 0.0);
    }

    // Parse the message to extract raid information
    const parsedData = await service.parseDiscordPing(message);

    logger.info("Successfully parsed Discord message", {
      title: parsedData.title,
      date: parsedData.date,
      confidence: parsedData.confidence,
      provider: service.provider,
    });

    return parsedData;
  } catch (error) {
    if (error instanceof AIParsingError) {
      throw error;
    }

    throw new AIParsingError(
      `Failed to parse message: ${error instanceof Error ? error.message : "Unknown error"}`,
      message,
      0.0,
    );
  }
}

export async function validateDiscordMessage(message: string): Promise<boolean> {
  try {
    const service = getAIServiceInstance();
    return await service.validateMessage(message);
  } catch (error) {
    logger.error("Failed to validate message", {
      message: message.substring(0, 100) + "...",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return false;
  }
}
