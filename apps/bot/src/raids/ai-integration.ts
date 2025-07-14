import { logger } from "@albion-raid-manager/logger";
import { Events } from "discord.js";

import { AIRaidHandler } from "./ai-handler";

export class AIRaidIntegration {
  private handler: AIRaidHandler;

  constructor() {
    this.handler = new AIRaidHandler();
  }

  /**
   * Initialize AI raid parsing for a Discord client
   * This should be called after the bot is ready
   */
  initialize(client: any): void {
    logger.info("Initializing AI raid parsing integration");

    // Listen for new messages
    client.on(Events.MessageCreate, async (message: any) => {
      try {
        await this.handler.handleMessage(message);
      } catch (error) {
        logger.error("Error in AI raid message handler", {
          error: error instanceof Error ? error.message : "Unknown error",
          messageId: message.id,
          channelId: message.channel.id,
        });
      }
    });

    logger.info("AI raid parsing integration initialized successfully");
  }

  /**
   * Manually parse a message (useful for testing or command-based parsing)
   */
  async parseMessage(message: string): Promise<any> {
    try {
      return await this.handler.validateMessage(message);
    } catch (error) {
      logger.error("Failed to manually parse message", {
        message: message.substring(0, 100) + "...",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }
}

// Example usage in the main bot file:
/*
import { AIRaidIntegration } from "./raids/ai-integration";

// In your bot initialization:
const aiIntegration = new AIRaidIntegration();
aiIntegration.initialize(discord);
*/
