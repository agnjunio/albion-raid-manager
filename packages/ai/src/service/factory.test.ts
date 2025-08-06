import { beforeEach, describe, expect, it, vi } from "vitest";

import { AIProvider } from "../types";

import { getAIService } from "./factory";
import { OpenAIService } from "./providers";

describe("AI Service Factory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createAIService", () => {
    it("should create service from environment variables", () => {
      process.env.AI_PROVIDER = AIProvider.OPENAI;

      const service = getAIService();
      expect(service).toBeInstanceOf(OpenAIService);
      expect(service.provider).toBe(AIProvider.OPENAI);
    });
  });
});
