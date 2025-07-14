import { vi } from "vitest";

// Mock environment variables
process.env.AI_PROVIDER = "openai";
process.env.AI_API_KEY = "test-api-key";
process.env.AI_MODEL = "gpt-4";

// Mock logger to avoid console output during tests
vi.mock("@albion-raid-manager/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    verbose: vi.fn(),
  },
}));

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
