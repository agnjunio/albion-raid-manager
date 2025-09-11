import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { RedisClient } from "./client";

describe("RedisClient", () => {
  let redisClient: RedisClient;
  let mockClient: any;
  let mockCreateClient: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get the mocked functions from the global setup
    const redisModule = await import("redis");
    mockCreateClient = redisModule.createClient;
    mockClient = mockCreateClient();

    mockClient.connect.mockResolvedValue(undefined);
    mockClient.disconnect.mockResolvedValue(undefined);

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
      expect(mockClient.on).toHaveBeenCalledWith("reconnecting", expect.any(Function));
    });
  });

  describe("connect", () => {
    it("should call connect on the underlying client", async () => {
      await redisClient.connect();
      expect(mockClient.connect).toHaveBeenCalled();
    });

    it("should handle connection errors", async () => {
      const error = new Error("Connection failed");
      mockClient.connect.mockRejectedValue(error);

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
      const result = await redisClient.ping();
      expect(mockClient.ping).toHaveBeenCalled();
      expect(result).toBe("PONG");
    });
  });

  describe("getClient", () => {
    it("should return the underlying Redis client", () => {
      const client = redisClient.getClient();
      expect(client).toBe(mockClient);
    });
  });

  describe("isHealthy", () => {
    it("should return false initially", () => {
      expect(redisClient.isHealthy()).toBe(false);
    });
  });
});
