import { AIProvider, ParsedRaidData } from "../types";

import { BaseAIService } from "./base";

interface AnthropicRequest {
  model: string;
  max_tokens: number;
  temperature?: number;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

interface AnthropicResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  model: string;
}

export class AnthropicService extends BaseAIService {
  constructor(config: { apiKey: string; model?: string; baseUrl?: string }) {
    super({
      provider: AIProvider.ANTHROPIC,
      apiKey: config.apiKey,
      model: config.model || "claude-3-sonnet-20240229",
      baseUrl: config.baseUrl || "https://api.anthropic.com/v1",
      maxTokens: 1000,
      temperature: 0.1,
    });
  }

  async parseDiscordPing(message: string): Promise<ParsedRaidData> {
    const prompt = this.createRaidParsingPrompt(message);

    const request: AnthropicRequest = {
      model: this.config.model!,
      max_tokens: this.config.maxTokens!,
      temperature: this.config.temperature,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    };

    try {
      const response = await this.makeRequest<AnthropicResponse>("/messages", request);

      const content = response.content[0]?.text;
      if (!content) {
        throw new Error("No response content from Anthropic");
      }

      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }

      const parsedData = JSON.parse(jsonMatch[0]);
      return this.validateParsedData(parsedData);
    } catch (error) {
      throw new Error(`Failed to parse Discord ping: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async validateMessage(message: string): Promise<boolean> {
    const validationPrompt = `Analyze the following Discord message and determine if it contains raid-related information for Albion Online. Look for keywords like "raid", "dungeon", "group", "party", "guild", "boss", "chest", "dungeon", "corrupted", "roads", "outlands", etc.

Message: "${message}"

Respond with only "true" if it's raid-related, or "false" if it's not.`;

    const request: AnthropicRequest = {
      model: this.config.model!,
      max_tokens: 10,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: validationPrompt,
        },
      ],
    };

    try {
      const response = await this.makeRequest<AnthropicResponse>("/messages", request);
      const content = response.content[0]?.text?.toLowerCase().trim();
      return content === "true";
    } catch (error) {
      // If validation fails, assume it's not a raid message
      return false;
    }
  }
}
