import { logger } from "@albion-raid-manager/logger";
import Anthropic from "@anthropic-ai/sdk";

import { AIProvider, ParsedRaidData } from "../../types";
import { BaseAIService } from "../base";

export class AnthropicService extends BaseAIService {
  private client: Anthropic;

  constructor(config: { apiKey: string; model?: string; baseUrl?: string }) {
    super({
      provider: AIProvider.ANTHROPIC,
      apiKey: config.apiKey,
      model: config.model || "claude-3-sonnet-20240229",
      baseUrl: config.baseUrl || "https://api.anthropic.com/v1",
      maxTokens: 1000,
      temperature: 0.1,
    });

    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
  }

  async parseDiscordPing(message: string): Promise<ParsedRaidData> {
    const prompt = this.createRaidParsingPrompt(message);

    try {
      logger.debug("Making Anthropic API request for Discord message parsing", {
        provider: this.provider,
        model: this.config.model,
        messageLength: message.length,
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

      const parsedData = JSON.parse(jsonMatch[0]);
      return this.validateParsedData(parsedData);
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

  async validateMessage(message: string): Promise<boolean> {
    const validationPrompt = `Analyze the following Discord message and determine if it contains raid-related information for Albion Online. Look for keywords like "raid", "dungeon", "group", "party", "guild", "boss", "chest", "dungeon", "corrupted", "roads", "outlands", etc.

Message: "${message}"

Respond with only "true" if it's raid-related, or "false" if it's not.`;

    try {
      logger.debug("Making Anthropic API request for message validation", {
        provider: this.provider,
        model: this.config.model,
        messageLength: message.length,
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
        return false;
      }
      const content = contentBlock.text.toLowerCase().trim();

      logger.debug("Received Anthropic validation response", {
        provider: this.provider,
        model: this.config.model,
        response: content,
        usage: response.usage,
      });

      return content === "true";
    } catch (error) {
      logger.error("Anthropic validation request failed", {
        provider: this.provider,
        model: this.config.model,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // If validation fails, assume it's not a raid message
      return false;
    }
  }
}
