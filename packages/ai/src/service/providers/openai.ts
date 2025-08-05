import { logger } from "@albion-raid-manager/logger";
import OpenAI from "openai";

import { AIProvider } from "../../types";
import { BaseAIService } from "../base";

import { type PreprocessorContext } from "../../pipeline";

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

  async generateResponse(context: PreprocessorContext): Promise<unknown> {
    logger.info(`Generating OpenAI response for ${context.extractedSlots.length} slots`, {
      slots: context.extractedSlots,
    });

    const prompt = this.createRaidParsingPrompt(context);

    try {
      logger.debug("Making OpenAI API request for Discord message parsing", {
        provider: this.provider,
        model: this.config.model,
        messageLength: context.originalMessage.length,
        extractedSlotsCount: context.extractedSlots.length,
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

      return JSON.parse(jsonMatch[0]);
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

  async generateValidationResponse(context: PreprocessorContext): Promise<unknown> {
    const validationPrompt = `Is this an Albion Online raid/group activity? Look for raid, dungeon, party, tank, healer, dps, pve, pvp, or similar concepts in any language. If possibly raid-related, respond 'true'.

Msg: "${context.processedMessage}"

Respond: true/false`;

    try {
      logger.debug("Making OpenAI API request for message validation", {
        provider: this.provider,
        model: this.config.model,
        messageLength: context.originalMessage.length,
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

      const content = response.choices[0]?.message?.content;

      logger.debug("Received OpenAI validation response", {
        provider: this.provider,
        model: this.config.model,
        response: content,
        usage: response.usage,
      });

      return content;
    } catch (error) {
      logger.error(`OpenAI validation request failed: ${error instanceof Error ? error.message : "Unknown error"}`, {
        provider: this.provider,
        model: this.config.model,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // If validation fails, assume it's not a raid message
      return "false";
    }
  }
}
