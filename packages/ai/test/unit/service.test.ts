import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { AnthropicService, OpenAIService } from "../../src/service";
import { getAIService } from "../../src/service/factory";
import { AIProvider } from "../../src/types";

describe("AI Service Factory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createAIService", () => {
    it("should create service from environment variables", () => {
      const service = getAIService();
      expect(service).toBeInstanceOf(OpenAIService);
      expect(service.provider).toBe(AIProvider.OPENAI);
    });
  });
});

describe("OpenAI Service", () => {
  let service: OpenAIService;
  let mockCreate: Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new OpenAIService({
      apiKey: "test-key",
      model: "gpt-4",
    });

    mockCreate = vi.mocked(service["client"].chat.completions.create);
  });

  it("should have correct default configuration", () => {
    expect(service.provider).toBe(AIProvider.OPENAI);
    expect(service["config"].model).toBe("gpt-4");
    expect(service["config"].baseUrl).toBe("https://api.openai.com/v1");
    expect(service["config"].maxTokens).toBe(1000);
    expect(service["config"].temperature).toBe(0.1);
  });

  it("should use custom configuration", () => {
    const customService = new OpenAIService({
      apiKey: "custom-key",
      model: "gpt-4-turbo",
      baseUrl: "https://custom.openai.com/v1",
    });

    expect(customService["config"].model).toBe("gpt-4-turbo");
    expect(customService["config"].baseUrl).toBe("https://custom.openai.com/v1");
  });

  it("should validate message correctly", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "true" } }],
      usage: { prompt_tokens: 10, completion_tokens: 2, total_tokens: 12 },
    });

    const result = await service.validateMessage("test raid message");
    expect(result).toBe(true);
  });

  it("should parse Discord ping correctly", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: "Test Raid",
              date: new Date().toISOString(),
              confidence: 0.9,
            }),
          },
        },
      ],
      usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const result = await service.parseDiscordPing("test message");

    expect(result.title).toBe("Test Raid");
    expect(result.confidence).toBe(0.9);
  });

  it("should handle malformed JSON response", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "invalid json" } }],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    });

    await expect(service.parseDiscordPing("test message")).rejects.toThrow("No valid JSON found in response");
  });

  it("should handle empty response content", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: {} }],
      usage: { prompt_tokens: 10, completion_tokens: 0, total_tokens: 10 },
    });

    await expect(service.parseDiscordPing("test message")).rejects.toThrow("No response content from OpenAI");
  });

  it("should handle API errors", async () => {
    const error = new Error("API Error");
    mockCreate.mockRejectedValueOnce(error);

    await expect(service.parseDiscordPing("test message")).rejects.toThrow("Failed to parse Discord ping: API Error");
  });
});

describe("Anthropic Service", () => {
  let service: AnthropicService;
  let mockCreate: Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new AnthropicService({
      apiKey: "test-key",
      model: "claude-3-sonnet-20240229",
    });

    mockCreate = vi.mocked(service["client"].messages.create);
  });

  it("should have correct default configuration", () => {
    expect(service.provider).toBe(AIProvider.ANTHROPIC);
    expect(service["config"].model).toBe("claude-3-sonnet-20240229");
    expect(service["config"].baseUrl).toBe("https://api.anthropic.com/v1");
  });

  it("should validate message correctly", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "true" }],
      usage: { input_tokens: 10, output_tokens: 2 },
    });

    const result = await service.validateMessage("test raid message");
    expect(result).toBe(true);
  });

  it("should parse Discord ping correctly", async () => {
    const mockResponse = {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            title: "Test Raid",
            date: new Date().toISOString(),
            confidence: 0.9,
          }),
        },
      ],
      usage: { input_tokens: 50, output_tokens: 100 },
    };

    mockCreate.mockResolvedValueOnce(mockResponse);

    const result = await service.parseDiscordPing("test message");

    expect(result.title).toBe("Test Raid");
    expect(result.confidence).toBe(0.9);
  });

  it("should handle non-text content", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "thinking" }],
      usage: { input_tokens: 10, output_tokens: 0 },
    });

    await expect(service.parseDiscordPing("test message")).rejects.toThrow("No valid text content from Anthropic");
  });

  it("should handle validation with non-text content", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "thinking" }],
      usage: { input_tokens: 10, output_tokens: 0 },
    });

    const result = await service.validateMessage("test message");
    expect(result).toBe(false);
  });

  it("should handle API errors", async () => {
    const error = new Error("API Error");
    mockCreate.mockRejectedValueOnce(error);

    await expect(service.parseDiscordPing("test message")).rejects.toThrow("Failed to parse Discord ping: API Error");
  });
});
