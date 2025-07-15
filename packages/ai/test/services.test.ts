import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AnthropicService, OpenAIService } from "../src/service";
import { getAIService } from "../src/service/factory";
import { AIProvider } from "../src/types";

// Mock axios
vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      post: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
    isAxiosError: vi.fn(() => false),
  },
}));

describe("AI Service Factory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createAIService", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it("should create service from environment variables", () => {
      process.env.AI_PROVIDER = "openai";
      process.env.AI_API_KEY = "test-key";
      process.env.AI_MODEL = "gpt-4";

      const service = getAIService();

      expect(service).toBeInstanceOf(OpenAIService);
      expect(service.provider).toBe(AIProvider.OPENAI);
    });

    it("should throw error when AI_PROVIDER is missing", () => {
      delete process.env.AI_PROVIDER;
      process.env.AI_API_KEY = "test-key";

      expect(() => {
        getAIService();
      }).toThrow("AI_PROVIDER environment variable is required");
    });

    it("should throw error when AI_API_KEY is missing", () => {
      process.env.AI_PROVIDER = "openai";
      delete process.env.AI_API_KEY;

      expect(() => {
        getAIService();
      }).toThrow("AI_API_KEY environment variable is required");
    });
  });
});

describe("OpenAI Service", () => {
  let service: OpenAIService;
  let mockPost: any;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new OpenAIService({
      apiKey: "test-key",
      model: "gpt-4",
    });

    mockPost = vi.mocked(service["client"].post);
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
    mockPost.mockResolvedValueOnce({
      data: {
        choices: [{ message: { content: "true" } }],
      },
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
    };

    mockPost.mockResolvedValueOnce({ data: mockResponse });

    const result = await service.parseDiscordPing("test message");

    expect(result.title).toBe("Test Raid");
    expect(result.confidence).toBe(0.9);
  });

  it("should handle malformed JSON response", async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        choices: [{ message: { content: "invalid json" } }],
      },
    });

    await expect(service.parseDiscordPing("test message")).rejects.toThrow("No valid JSON found in response");
  });

  it("should handle empty response content", async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        choices: [{ message: {} }],
      },
    });

    await expect(service.parseDiscordPing("test message")).rejects.toThrow("No response content from OpenAI");
  });

  it("should handle API errors", async () => {
    const error = new Error("API Error");
    mockPost.mockRejectedValueOnce(error);

    await expect(service.parseDiscordPing("test message")).rejects.toThrow("Failed to parse Discord ping: API Error");
  });
});

describe("Anthropic Service", () => {
  let service: AnthropicService;
  let mockPost: any;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new AnthropicService({
      apiKey: "test-key",
      model: "claude-3-sonnet-20240229",
    });

    mockPost = vi.mocked(service["client"].post);
  });

  it("should have correct default configuration", () => {
    expect(service.provider).toBe(AIProvider.ANTHROPIC);
    expect(service["config"].model).toBe("claude-3-sonnet-20240229");
    expect(service["config"].baseUrl).toBe("https://api.anthropic.com/v1");
  });

  it("should validate message correctly", async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        content: [{ text: "true" }],
      },
    });

    const result = await service.validateMessage("test raid message");
    expect(result).toBe(true);
  });

  it("should parse Discord ping correctly", async () => {
    const mockResponse = {
      content: [
        {
          text: JSON.stringify({
            title: "Test Raid",
            date: new Date().toISOString(),
            confidence: 0.9,
          }),
        },
      ],
    };

    mockPost.mockResolvedValueOnce({ data: mockResponse });

    const result = await service.parseDiscordPing("test message");

    expect(result.title).toBe("Test Raid");
    expect(result.confidence).toBe(0.9);
  });
});

describe("Base AI Service", () => {
  it("should handle axios errors correctly", async () => {
    const { default: axios } = await import("axios");
    vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

    const service = new OpenAIService({
      apiKey: "test-key",
    });

    const mockPost = vi.mocked(service["client"].post);
    mockPost.mockRejectedValueOnce({
      response: {
        status: 429,
        data: { error: { message: "Rate limit exceeded", code: "rate_limit_exceeded" } },
      },
    });

    await expect(service["makeRequest"]("/test", {})).rejects.toThrow("Rate limit exceeded");
  });

  it("should handle non-axios errors correctly", async () => {
    const service = new OpenAIService({
      apiKey: "test-key",
    });

    const mockPost = vi.mocked(service["client"].post);
    mockPost.mockRejectedValueOnce(new Error("Network error"));

    await expect(service["makeRequest"]("/test", {})).rejects.toThrow("Network error");
  });
});
