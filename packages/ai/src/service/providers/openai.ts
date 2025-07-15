import { AIProvider, ParsedRaidData } from "../../types";
import { BaseAIService } from "../base";

interface OpenAIRequest {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export class OpenAIService extends BaseAIService {
  constructor(config: { apiKey: string; model?: string; baseUrl?: string }) {
    super({
      provider: AIProvider.OPENAI,
      apiKey: config.apiKey,
      model: config.model || "gpt-4",
      baseUrl: config.baseUrl || "https://api.openai.com/v1",
      maxTokens: 1000,
      temperature: 0.1,
    });
  }

  async parseDiscordPing(message: string): Promise<ParsedRaidData> {
    const prompt = this.createRaidParsingPrompt(message);

    const request: OpenAIRequest = {
      model: this.config.model!,
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
    };

    try {
      const response = await this.makeRequest<OpenAIResponse>("/chat/completions", request);

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response content from OpenAI");
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

    const request: OpenAIRequest = {
      model: this.config.model!,
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
    };

    try {
      const response = await this.makeRequest<OpenAIResponse>("/chat/completions", request);
      const content = response.choices[0]?.message?.content?.toLowerCase().trim();
      return content === "true";
    } catch (error) {
      // If validation fails, assume it's not a raid message
      return false;
    }
  }
}
