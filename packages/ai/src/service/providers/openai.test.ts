import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { AIProvider } from "../../types";

import { OpenAIService } from "./openai";

describe("OpenAI Service", () => {
  let service: OpenAIService;
  let mockCreate: Mock;
  let mockGenerateResponse: Mock;
  let mockGenerateValidationResponse: Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new OpenAIService({
      apiKey: "test-key",
      model: "gpt-4",
    });

    mockCreate = vi.mocked(service["client"].chat.completions.create);
    mockGenerateResponse = vi.spyOn(service, "generateResponse") as Mock;
    mockGenerateValidationResponse = vi.spyOn(service, "generateValidationResponse") as Mock;
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
    mockGenerateValidationResponse.mockResolvedValueOnce("true");

    const result = await service.validateMessage("test raid message");
    expect(result).toBe(true);
  });

  it("should parse Discord ping correctly", async () => {
    const mockAiRaid = {
      title: "Test Raid",
      contentType: "GROUP_DUNGEON",
      timestamp: new Date().toISOString(),
      location: "Fort Sterling",
      requirements: ["t8 set"],
      roles: [{ name: "Tank 1", role: "TANK", preAssignedUser: "" }],
      confidence: 0.9,
    };

    mockGenerateResponse.mockResolvedValueOnce(mockAiRaid);

    const result = await service.parseDiscordPing("test message");

    expect(result.title).toBe("Test Raid");
    expect(result.location).toBe("Fort Sterling");
    expect(result.requirements).toEqual(["t8 set"]);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it("should handle malformed JSON response", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "invalid json" } }],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    });

    await expect(
      service.generateResponse({
        originalMessage: "test",
        processedMessage: "test",
        extractedSlots: [],
        preAssignedRoles: [],
        extractedRequirements: [],
        extractedTime: null,
        preAssignedContentType: null,
        metadata: { originalLength: 4, processedLength: 4, tokenReduction: 0, slotCount: 0, requirementCount: 0 },
      }),
    ).rejects.toThrow("No valid JSON found in response");
  });

  it("should handle empty response content", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: {} }],
      usage: { prompt_tokens: 10, completion_tokens: 0, total_tokens: 10 },
    });

    await expect(
      service.generateResponse({
        originalMessage: "test",
        processedMessage: "test",
        extractedSlots: [],
        preAssignedRoles: [],
        extractedRequirements: [],
        extractedTime: null,
        preAssignedContentType: null,
        metadata: { originalLength: 4, processedLength: 4, tokenReduction: 0, slotCount: 0, requirementCount: 0 },
      }),
    ).rejects.toThrow("No response content from OpenAI");
  });

  it("should handle API errors", async () => {
    const error = new Error("API Error");
    mockGenerateResponse.mockRejectedValueOnce(error);

    await expect(service.parseDiscordPing("test message")).rejects.toThrow("API Error");
  });
});
