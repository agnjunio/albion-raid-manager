import config from "@albion-raid-manager/config";

import { AIProvider, AIService } from "../types";

import { AnthropicService } from "./providers/anthropic";
import { OpenAIService } from "./providers/openai";

let aiService: AIService | null = null;

export function getAIService(): AIService {
  if (aiService) {
    return aiService;
  }

  switch (config.ai.provider) {
    case AIProvider.OPENAI:
      aiService = new OpenAIService({
        apiKey: config.ai.apiKey || "",
        model: config.ai.model,
        baseUrl: config.ai.baseUrl,
      });
      break;

    case AIProvider.ANTHROPIC:
      aiService = new AnthropicService({
        apiKey: config.ai.apiKey || "",
        model: config.ai.model,
        baseUrl: config.ai.baseUrl,
      });
      break;

    case AIProvider.GOOGLE:
      throw new Error("Google AI service not yet implemented");

    case AIProvider.AZURE:
      throw new Error("Azure AI service not yet implemented");

    default:
      throw new Error(`Unsupported AI provider: ${config.ai.provider}`);
  }

  return aiService;
}
