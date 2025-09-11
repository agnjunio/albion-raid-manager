import { vi } from "vitest";

// Mock environment variables
process.env.ALBION_SERVER = "AMERICAS";

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

// Mock the entire axios module
vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
    create: vi.fn().mockReturnThis(),
    interceptors: {
      request: {
        use: vi.fn(),
        eject: vi.fn(),
      },
      response: {
        use: vi.fn(),
        eject: vi.fn(),
      },
    },
  },
}));
