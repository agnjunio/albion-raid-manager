import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { AIProvider } from "../../types";

import { AnthropicService } from "./anthropic";

describe("Anthropic Service", () => {
  let service: AnthropicService;
  let mockCreate: Mock;
  let mockGenerateResponse: Mock;
  let mockGenerateValidationResponse: Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new AnthropicService({
      apiKey: "test-key",
      model: "claude-3-sonnet-20240229",
    });

    mockCreate = vi.mocked(service["client"].messages.create);
    mockGenerateResponse = vi.spyOn(service, "generateResponse") as Mock;
    mockGenerateValidationResponse = vi.spyOn(service, "generateValidationResponse") as Mock;
  });

  it("should have correct default configuration", () => {
    expect(service.provider).toBe(AIProvider.ANTHROPIC);
    expect(service["config"].model).toBe("claude-3-sonnet-20240229");
    expect(service["config"].baseUrl).toBe("https://api.anthropic.com");
  });

  it("should validate message correctly", async () => {
    mockGenerateValidationResponse.mockResolvedValueOnce("true");

    const result = await service.validateMessage("test raid message");
    expect(result).toBe(true);
  });

  it("should parse Discord ping correctly", async () => {
    const mockAiRaid = {
      title: "Test Message",
      contentType: "GROUP_DUNGEON",
      timestamp: new Date().toISOString(),
      location: "Fort Sterling",
      requirements: ["t8 set"],
      roles: [{ name: "Tank 1", role: "TANK", preAssignedUser: "" }],
      confidence: 0.9,
    };

    mockGenerateResponse.mockResolvedValueOnce(mockAiRaid);

    const result = await service.parseDiscordPing("test message");

    expect(result.title).toBe("Test Message");
    expect(result.requirements).toEqual(["t8 set"]);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it("should handle non-text content", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "thinking" }],
      usage: { input_tokens: 10, output_tokens: 0 },
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
    ).rejects.toThrow("No valid text content from Anthropic");
  });

  it("should handle validation with non-text content", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "thinking" }],
      usage: { input_tokens: 10, output_tokens: 0 },
    });

    const result = await service.generateValidationResponse({
      originalMessage: "test",
      processedMessage: "test",
      extractedSlots: [],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: { originalLength: 4, processedLength: 4, tokenReduction: 0, slotCount: 0, requirementCount: 0 },
    });
    expect(result).toBe("false");
  });

  it("should handle API errors", async () => {
    const error = new Error("API Error");
    mockGenerateResponse.mockRejectedValueOnce(error);

    await expect(service.parseDiscordPing("test message")).rejects.toThrow("API Error");
  });
});
