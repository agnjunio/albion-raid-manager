import { vi } from "vitest";

// Mock the logger package globally
vi.mock("@albion-raid-manager/core/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock the redis package globally
vi.mock("redis", () => {
  const mockClient = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    ping: vi.fn(() => Promise.resolve("PONG")),
    publish: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    on: vi.fn(),
  };

  return {
    createClient: vi.fn(() => mockClient),
  };
});

// Mock the database package globally
vi.mock("@albion-raid-manager/database", () => ({
  // Mock database types
}));
