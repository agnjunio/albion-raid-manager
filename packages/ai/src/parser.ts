import { logger } from "@albion-raid-manager/logger";

import { AIParsingError, DiscordMessageContext, ParsedRaidData } from "./types";

import { getAIService } from "./service/factory";

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

export async function parseDiscordMessage(message: string, context?: DiscordMessageContext): Promise<ParsedRaidData> {
  try {
    const service = getAIServiceInstance();
    logger.debug("Parsing Discord message with AI.", {
      content: message.substring(0, 100) + "...",
      provider: service.provider,
      context: context
        ? {
            guildId: context.guildId,
            channelId: context.channelId,
            authorId: context.authorId,
          }
        : undefined,
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

export async function parseMultipleDiscordMessages(
  messages: Array<{ content: string; context?: DiscordMessageContext }>,
): Promise<Array<{ data: ParsedRaidData; originalMessage: string }>> {
  const results = [];

  for (const { content, context } of messages) {
    try {
      const data = await parseDiscordMessage(content, context);
      results.push({ data, originalMessage: content });
    } catch (error) {
      logger.warn("Failed to parse message in batch", {
        message: content.substring(0, 100) + "...",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      // Continue with other messages
    }
  }

  return results;
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
