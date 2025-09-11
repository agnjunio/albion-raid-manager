import { logger } from "@albion-raid-manager/core/logger";
import Anthropic from "@anthropic-ai/sdk";

import { AIProvider } from "../../types";
import { BaseAIService } from "../base";

import { type PreprocessorContext } from "../../pipeline";

export class AnthropicService extends BaseAIService {
  private client: Anthropic;

  constructor(config: { apiKey: string; model?: string; baseUrl?: string }) {
    super({
      provider: AIProvider.ANTHROPIC,
      apiKey: config.apiKey,
      model: config.model || "claude-3-sonnet-20240229",
      baseUrl: config.baseUrl || "https://api.anthropic.com",
      maxTokens: 1000,
      temperature: 0.1,
    });

    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
  }

  async generateResponse(context: PreprocessorContext): Promise<unknown> {
    logger.info(`Generating Anthropic response for ${context.extractedSlots.length} slots`, {
      slots: context.extractedSlots,
    });

    const prompt = this.createRaidParsingPrompt(context);

    try {
      logger.debug("Making Anthropic API request for Discord message parsing", {
        provider: this.provider,
        model: this.config.model,
        messageLength: context.originalMessage.length,
        extractedSlotsCount: context.extractedSlots.length,
      });

      const response = await this.client.messages.create({
        model: this.config.model || "claude-3-sonnet-20240229",
        max_tokens: this.config.maxTokens || 1000,
        temperature: this.config.temperature,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const contentBlock = response.content[0];
      if (!contentBlock || contentBlock.type !== "text") {
        throw new Error("No valid text content from Anthropic");
      }
      const content = contentBlock.text;

      logger.debug("Received Anthropic response", {
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
      logger.error("Anthropic API request failed", {
        provider: this.provider,
        model: this.config.model,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (error && typeof error === "object" && "status" in error) {
        const apiError = error as { status?: number };
        throw new Error(
          `Anthropic API Error: ${error instanceof Error ? error.message : "Unknown error"} (Status: ${apiError.status})`,
        );
      }

      throw new Error(`Failed to parse Discord ping: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async generateValidationResponse(context: PreprocessorContext): Promise<unknown> {
    const validationPrompt = `Is this an Albion Online raid/group activity? Look for: raid,dungeon,party,tank,healer,dps,pve,pvp,gear,weapon,time,requirements in any language. If possibly raid-related, respond 'true'.

Msg: "${context.processedMessage}"

Respond: true/false`;

    try {
      logger.debug("Making Anthropic API request for message validation", {
        provider: this.provider,
        model: this.config.model,
        messageLength: context.originalMessage.length,
      });

      const response = await this.client.messages.create({
        model: this.config.model || "claude-3-sonnet-20240229",
        max_tokens: 10,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: validationPrompt,
          },
        ],
      });

      const contentBlock = response.content[0];
      if (!contentBlock || contentBlock.type !== "text") {
        return "false";
      }
      const content = contentBlock.text;

      logger.debug("Received Anthropic validation response", {
        provider: this.provider,
        model: this.config.model,
        response: content,
        usage: response.usage,
      });

      return content;
    } catch (error) {
      logger.error("Anthropic validation request failed", {
        provider: this.provider,
        model: this.config.model,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // If validation fails, assume it's not a raid message
      return "false";
    }
  }
}
