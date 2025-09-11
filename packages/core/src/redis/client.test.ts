import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock redis module before importing RedisClient
const mockRedisClient = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  ping: vi.fn().mockResolvedValue("PONG"),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  isOpen: true,
  isReady: true,
};

vi.mock("redis", () => ({
  createClient: vi.fn(() => mockRedisClient),
}));

import { RedisClient } from "./client";

describe("RedisClient", () => {
  let redisClient: RedisClient;
  let mockClient: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Use the global mock
    mockClient = mockRedisClient;

    // Ensure the mock methods are properly set up
    mockClient.connect.mockResolvedValue(undefined);
    mockClient.disconnect.mockResolvedValue(undefined);
    mockClient.ping.mockResolvedValue("PONG");
    mockClient.on.mockImplementation(() => {});
    mockClient.off.mockImplementation(() => {});

    redisClient = new RedisClient();
  });

  afterEach(async () => {
    if (redisClient.isHealthy()) {
      await redisClient.disconnect();
    }
  });

  describe("constructor", () => {
    it("should create a Redis client instance", () => {
      expect(redisClient).toBeInstanceOf(RedisClient);
      expect(redisClient.isHealthy()).toBe(false);
    });

    it("should set up event handlers", () => {
      expect(mockClient.on).toHaveBeenCalledWith("error", expect.any(Function));
      expect(mockClient.on).toHaveBeenCalledWith("connect", expect.any(Function));
      expect(mockClient.on).toHaveBeenCalledWith("disconnect", expect.any(Function));
    });
  });

  describe("connect", () => {
    it("should call connect on the underlying client", async () => {
      // Ensure isConnected is false initially
      expect(redisClient.isHealthy()).toBe(false);

      await redisClient.connect();
      expect(mockClient.connect).toHaveBeenCalled();
    });

    it("should handle connection errors", async () => {
      const error = new Error("Connection failed");
      mockClient.connect.mockRejectedValueOnce(error);

      await expect(redisClient.connect()).rejects.toThrow("Connection failed");
    });
  });

  describe("disconnect", () => {
    it("should not call disconnect when not connected", async () => {
      await redisClient.disconnect();
      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });

    it("should call disconnect when connected", async () => {
      // Simulate being connected by manually setting the internal state
      (redisClient as any).isConnected = true;

      await redisClient.disconnect();
      expect(mockClient.disconnect).toHaveBeenCalled();
    });

    it("should handle disconnect errors", async () => {
      // Simulate being connected by manually setting the internal state
      (redisClient as any).isConnected = true;

      const error = new Error("Disconnect failed");
      mockClient.disconnect.mockRejectedValueOnce(error);

      await expect(redisClient.disconnect()).rejects.toThrow("Disconnect failed");
    });
  });

  describe("ping", () => {
    it("should call ping on the underlying client", async () => {
      // Simulate being connected by manually setting the internal state
      (redisClient as any).isConnected = true;

      const result = await redisClient.ping();
      expect(mockClient.ping).toHaveBeenCalled();
      expect(result).toBe("PONG");
    });
  });

  describe("getClient", () => {
    it("should return the underlying Redis client", () => {
      const client = redisClient.getClient();
      expect(client).toEqual(mockClient);
    });
  });

  describe("isHealthy", () => {
    it("should return false initially", () => {
      expect(redisClient.isHealthy()).toBe(false);
    });
  });
});
