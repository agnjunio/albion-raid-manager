import { vi } from "vitest";

// Mock environment variables
process.env.TZ = "UTC";
process.env.AI_ENABLED = "true";
process.env.AI_PROVIDER = "openai";
process.env.AI_API_KEY = "test-api-key";
process.env.AI_MODEL = "gpt-4";
process.env.DISCORD_TOKEN = "test-discord-token";
process.env.DISCORD_CLIENT_ID = "test-discord-client-id";

// Mock logger to avoid console output during tests
vi.mock("@albion-raid-manager/core/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    verbose: vi.fn(),
  },
}));

// Mock OpenAI SDK
vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}));

// Mock Anthropic SDK
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn(),
    },
  })),
}));
