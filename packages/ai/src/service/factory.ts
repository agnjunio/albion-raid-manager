import { AIProvider, AIService, AIServiceConfig } from "../types";

import { AnthropicService } from "./anthropic";
import { OpenAIService } from "./openai";

export function createAIService(config: AIServiceConfig): AIService {
  switch (config.provider) {
    case AIProvider.OPENAI:
      return new OpenAIService({
        apiKey: config.apiKey,
        model: config.model,
        baseUrl: config.baseUrl,
      });

    case AIProvider.ANTHROPIC:
      return new AnthropicService({
        apiKey: config.apiKey,
        model: config.model,
        baseUrl: config.baseUrl,
      });

    case AIProvider.GOOGLE:
      throw new Error("Google AI service not yet implemented");

    case AIProvider.AZURE:
      throw new Error("Azure AI service not yet implemented");

    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`);
  }
}

export function createAIServiceFromEnv(): AIService {
  const provider = process.env.AI_PROVIDER as AIProvider;
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;
  const baseUrl = process.env.AI_BASE_URL;

  if (!provider) {
    throw new Error("AI_PROVIDER environment variable is required");
  }

  if (!apiKey) {
    throw new Error("AI_API_KEY environment variable is required");
  }

  const config: AIServiceConfig = {
    provider,
    apiKey,
    model,
    baseUrl,
  };

  return createAIService(config);
}

// Legacy class for backward compatibility
export class AIServiceFactory {
  static create = createAIService;
  static createFromEnv = createAIServiceFromEnv;
}
