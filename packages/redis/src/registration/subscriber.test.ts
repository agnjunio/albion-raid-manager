import { describe, expect, it, vi, beforeEach } from "vitest";

import { RegistrationEventSubscriber, RegistrationEventHandler } from "./subscriber";
import { RegistrationEventType } from "./types";

describe("RegistrationEventSubscriber", () => {
  let mockClient: any;
  let subscriber: RegistrationEventSubscriber;

  beforeEach(() => {
    mockClient = {
      on: vi.fn(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    };
    subscriber = new RegistrationEventSubscriber(mockClient);
  });

  describe("constructor", () => {
    it("should set up message handler", () => {
      expect(mockClient.on).toHaveBeenCalledWith("message", expect.any(Function));
    });
  });

  describe("subscribe", () => {
    it("should add handler and subscribe to channel", async () => {
      const handler: RegistrationEventHandler = vi.fn();

      await subscriber.subscribe(handler);

      expect(subscriber.getHandlerCount()).toBe(1);
      expect(mockClient.subscribe).toHaveBeenCalledWith("registration.events", expect.any(Function));
    });

    it("should not subscribe twice to the same channel", async () => {
      const handler1: RegistrationEventHandler = vi.fn();
      const handler2: RegistrationEventHandler = vi.fn();

      await subscriber.subscribe(handler1);
      await subscriber.subscribe(handler2);

      expect(subscriber.getHandlerCount()).toBe(2);
      expect(mockClient.subscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe("unsubscribe", () => {
    it("should remove specific handler", async () => {
      const handler1: RegistrationEventHandler = vi.fn();
      const handler2: RegistrationEventHandler = vi.fn();

      await subscriber.subscribe(handler1);
      await subscriber.subscribe(handler2);
      expect(subscriber.getHandlerCount()).toBe(2);

      await subscriber.unsubscribe(handler1);
      expect(subscriber.getHandlerCount()).toBe(1);
    });

    it("should unsubscribe from channel when no handlers left", async () => {
      const handler: RegistrationEventHandler = vi.fn();

      await subscriber.subscribe(handler);
      await subscriber.unsubscribe(handler);

      expect(subscriber.getHandlerCount()).toBe(0);
      expect(mockClient.unsubscribe).toHaveBeenCalledWith("registration.events");
    });

    it("should remove all handlers when no specific handler provided", async () => {
      const handler1: RegistrationEventHandler = vi.fn();
      const handler2: RegistrationEventHandler = vi.fn();

      await subscriber.subscribe(handler1);
      await subscriber.subscribe(handler2);
      await subscriber.unsubscribe();

      expect(subscriber.getHandlerCount()).toBe(0);
      expect(mockClient.unsubscribe).toHaveBeenCalledWith("registration.events");
    });
  });

  describe("message handling", () => {
    it("should handle registration events", async () => {
      const handler: RegistrationEventHandler = vi.fn();
      await subscriber.subscribe(handler);

      const messageHandler = mockClient.on.mock.calls[0][1];
      const event = {
        event: {
          type: RegistrationEventType.CREATED,
          entityId: "reg123",
          serverId: "server123",
          timestamp: "2024-01-01T00:00:00Z",
          data: {
            registration: {
              id: "reg123",
              userId: "user123",
              username: "testuser",
              characterName: "TestChar",
              status: "pending" as const,
            },
          },
        },
        metadata: { source: "api" as const, version: "1.0.0" },
      };

      await messageHandler("registration.events", JSON.stringify(event));

      expect(handler).toHaveBeenCalledWith(event);
    });

    it("should ignore non-registration events", async () => {
      const handler: RegistrationEventHandler = vi.fn();
      await subscriber.subscribe(handler);

      const messageHandler = mockClient.on.mock.calls[0][1];
      const event = {
        event: {
          type: "other.event",
          entityId: "other123",
          serverId: "server123",
          timestamp: "2024-01-01T00:00:00Z",
          data: {},
        },
        metadata: { source: "api" as const, version: "1.0.0" },
      };

      await messageHandler("other.events", JSON.stringify(event));

      expect(handler).not.toHaveBeenCalled();
    });

    it("should handle multiple handlers", async () => {
      const handler1: RegistrationEventHandler = vi.fn();
      const handler2: RegistrationEventHandler = vi.fn();
      await subscriber.subscribe(handler1);
      await subscriber.subscribe(handler2);

      const messageHandler = mockClient.on.mock.calls[0][1];
      const event = {
        event: {
          type: RegistrationEventType.CREATED,
          entityId: "reg123",
          serverId: "server123",
          timestamp: "2024-01-01T00:00:00Z",
          data: {
            registration: {
              id: "reg123",
              userId: "user123",
              username: "testuser",
              characterName: "TestChar",
              status: "pending" as const,
            },
          },
        },
        metadata: { source: "api" as const, version: "1.0.0" },
      };

      await messageHandler("registration.events", JSON.stringify(event));

      expect(handler1).toHaveBeenCalledWith(event);
      expect(handler2).toHaveBeenCalledWith(event);
    });
  });

  describe("utility methods", () => {
    it("should return correct handler count", async () => {
      const handler: RegistrationEventHandler = vi.fn();
      expect(subscriber.getHandlerCount()).toBe(0);

      await subscriber.subscribe(handler);
      expect(subscriber.getHandlerCount()).toBe(1);
    });

    it("should return subscription status", async () => {
      expect(subscriber.isSubscribedToChannel()).toBe(false);

      const handler: RegistrationEventHandler = vi.fn();
      await subscriber.subscribe(handler);
      expect(subscriber.isSubscribedToChannel()).toBe(true);
    });
  });
});
