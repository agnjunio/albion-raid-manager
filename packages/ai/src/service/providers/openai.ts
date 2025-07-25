import { logger } from "@albion-raid-manager/logger";
import OpenAI from "openai";

import { AIProvider, ParsedRaidData } from "../../types";
import { preprocessMessage } from "../../utils/message-preprocessor";
import { extractSlotLines } from "../../utils/slot-preprocessor";
import { BaseAIService } from "../base";

export class OpenAIService extends BaseAIService {
  private client: OpenAI;

  constructor(config: { apiKey: string; model?: string; baseUrl?: string }) {
    super({
      provider: AIProvider.OPENAI,
      apiKey: config.apiKey,
      model: config.model || "gpt-4",
      baseUrl: config.baseUrl || "https://api.openai.com/v1",
      maxTokens: 1000,
      temperature: 0.1,
    });

    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
  }

  async parseDiscordPing(message: string): Promise<ParsedRaidData> {
    // Extract slots using the preprocessor (guarantees 100% slot extraction)
    const extractedSlots = extractSlotLines(message);
    const slotStrings = extractedSlots.map(
      (slot) => `${slot.buildName}${slot.userMention ? ` <@${slot.userMention}>` : ""}`,
    );

    logger.info(`Extracted ${extractedSlots.length} slots for AI mapping`, {
      slots: slotStrings,
    });

    const prompt = this.createRaidParsingPrompt(message, slotStrings);

    try {
      logger.debug("Making OpenAI API request for Discord message parsing", {
        provider: this.provider,
        model: this.config.model,
        messageLength: message.length,
        extractedSlotsCount: extractedSlots.length,
      });

      const response = await this.client.chat.completions.create({
        model: this.config.model || "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that parses Discord messages to extract raid information. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response content from OpenAI");
      }

      logger.debug("Received OpenAI response", {
        provider: this.provider,
        model: this.config.model,
        usage: response.usage,
      });

      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }

      const parsedData = JSON.parse(jsonMatch[0]);
      return this.validateParsedData(parsedData, message);
    } catch (error) {
      logger.error("OpenAI API request failed", {
        provider: this.provider,
        model: this.config.model,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (error && typeof error === "object" && "status" in error) {
        const apiError = error as { status?: number };
        throw new Error(
          `OpenAI API Error: ${error instanceof Error ? error.message : "Unknown error"} (Status: ${apiError.status})`,
        );
      }

      throw new Error(`Failed to parse Discord ping: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async validateMessage(message: string): Promise<boolean> {
    // Pre-process message to reduce tokens
    const preprocessed = preprocessMessage(message);

    const validationPrompt = `Is this an Albion Online raid/group activity? Look for raid, dungeon, party, tank, healer, dps, pve, pvp, or similar concepts in any language. If possibly raid-related, respond 'true'.

Msg: "${preprocessed.content}"

Respond: true/false`;

    try {
      logger.debug("Making OpenAI API request for message validation", {
        provider: this.provider,
        model: this.config.model,
        messageLength: message.length,
      });

      const response = await this.client.chat.completions.create({
        model: this.config.model || "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that determines if messages are raid-related. Respond with only 'true' or 'false'.",
          },
          {
            role: "user",
            content: validationPrompt,
          },
        ],
        max_tokens: 10,
        temperature: 0,
      });

      const content = response.choices[0]?.message?.content?.toLowerCase().trim();

      logger.debug("Received OpenAI validation response", {
        provider: this.provider,
        model: this.config.model,
        response: content,
        usage: response.usage,
      });

      return content === "true";
    } catch (error) {
      logger.error(`OpenAI validation request failed: ${error instanceof Error ? error.message : "Unknown error"}`, {
        provider: this.provider,
        model: this.config.model,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // If validation fails, assume it's not a raid message
      return false;
    }
  }
}
