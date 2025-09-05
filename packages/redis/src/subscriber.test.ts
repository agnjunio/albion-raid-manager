import { describe, expect, it, vi, beforeEach } from "vitest";

import { RaidEventType } from "./events/raids";
import { RedisSubscriber, type GenericEventHandler } from "./subscriber";

describe("RedisSubscriber", () => {
  let mockClient: any;
  let subscriber: RedisSubscriber;
  let mockHandler: GenericEventHandler;

  beforeEach(() => {
    mockClient = {
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
      on: vi.fn(),
    };
    mockHandler = vi.fn();
    subscriber = new RedisSubscriber(mockClient);
  });

  describe("constructor", () => {
    it("should set up message handler on client", () => {
      // The constructor should have been called with the mock client
      expect(mockClient.on).toHaveBeenCalledWith("message", expect.any(Function));
    });
  });

  describe("subscribe", () => {
    it("should subscribe to a channel and add handler", async () => {
      const channel = "raid.events";

      await subscriber.subscribe(channel, mockHandler);

      expect(mockClient.subscribe).toHaveBeenCalledWith(channel, expect.any(Function));
    });

    it("should handle subscription errors", async () => {
      const channel = "raid.events";
      const error = new Error("Subscription failed");
      mockClient.subscribe.mockRejectedValue(error);

      await expect(subscriber.subscribe(channel, mockHandler)).rejects.toThrow("Subscription failed");
    });
  });

  describe("unsubscribe", () => {
    it("should unsubscribe from a channel and remove specific handler", async () => {
      const channel = "raid.events";

      // First subscribe
      await subscriber.subscribe(channel, mockHandler);

      // Then unsubscribe
      await subscriber.unsubscribe(channel, mockHandler);

      expect(mockClient.unsubscribe).toHaveBeenCalledWith(channel);
    });

    it("should unsubscribe from a channel and remove all handlers", async () => {
      const channel = "raid.events";

      // First subscribe
      await subscriber.subscribe(channel, mockHandler);

      // Then unsubscribe all
      await subscriber.unsubscribe(channel);

      expect(mockClient.unsubscribe).toHaveBeenCalledWith(channel);
    });

    it("should handle unsubscribe errors", async () => {
      const channel = "raid.events";
      const error = new Error("Unsubscribe failed");
      mockClient.unsubscribe.mockRejectedValue(error);

      await expect(subscriber.unsubscribe(channel)).rejects.toThrow("Unsubscribe failed");
    });
  });

  describe("subscribeToRaidEvents", () => {
    it("should subscribe to raid events channel", async () => {
      await subscriber.subscribeToRaidEvents(mockHandler);

      expect(mockClient.subscribe).toHaveBeenCalledWith("raid.events", expect.any(Function));
    });
  });

  describe("unsubscribeFromRaidEvents", () => {
    it("should unsubscribe from raid events channel when no handlers left", async () => {
      // First subscribe to add a handler
      await subscriber.subscribe("raid.events", mockHandler);

      // Then unsubscribe - this should remove the handler and call unsubscribe
      await subscriber.unsubscribeFromRaidEvents(mockHandler);

      expect(mockClient.unsubscribe).toHaveBeenCalledWith("raid.events");
    });
  });

  describe("message handling", () => {
    it("should handle valid JSON messages", async () => {
      const channel = "raid.events";
      const event = {
        event: {
          type: RaidEventType.CREATED,
          raidId: "raid123",
          serverId: "server123",
          timestamp: "2024-01-01T00:00:00Z",
          data: { raid: { id: "raid123" } },
        },
        metadata: {
          source: "api" as const,
          version: "1.0.0",
        },
      };

      // Get the message handler that was registered in constructor
      const messageHandler = mockClient.on.mock.calls.find((call: any[]) => call[0] === "message")?.[1];

      expect(messageHandler).toBeDefined();

      // Subscribe first
      await subscriber.subscribe(channel, mockHandler);

      // Simulate receiving a message
      if (messageHandler) {
        await messageHandler(channel, JSON.stringify(event));
        expect(mockHandler).toHaveBeenCalledWith(event);
      }
    });

    it("should handle invalid JSON messages gracefully", async () => {
      const channel = "raid.events";
      const invalidMessage = "invalid json";

      // Get the message handler that was registered in constructor
      const messageHandler = mockClient.on.mock.calls.find((call: any[]) => call[0] === "message")?.[1];

      expect(messageHandler).toBeDefined();

      // Subscribe first
      await subscriber.subscribe(channel, mockHandler);

      // Simulate receiving an invalid message
      if (messageHandler) {
        await messageHandler(channel, invalidMessage);
        expect(mockHandler).not.toHaveBeenCalled();
      }
    });

    it("should handle handler errors gracefully", async () => {
      const channel = "raid.events";
      const event = {
        event: {
          type: RaidEventType.CREATED,
          raidId: "raid123",
          serverId: "server123",
          timestamp: "2024-01-01T00:00:00Z",
          data: { raid: { id: "raid123" } },
        },
        metadata: {
          source: "api" as const,
          version: "1.0.0",
        },
      };

      const errorHandler = vi.fn().mockRejectedValue(new Error("Handler error"));

      // Get the message handler that was registered in constructor
      const messageHandler = mockClient.on.mock.calls.find((call: any[]) => call[0] === "message")?.[1];

      expect(messageHandler).toBeDefined();

      // Subscribe first
      await subscriber.subscribe(channel, errorHandler);

      // Simulate receiving a message
      if (messageHandler) {
        await messageHandler(channel, JSON.stringify(event));
        expect(errorHandler).toHaveBeenCalledWith(event);
      }
    });
  });
});
