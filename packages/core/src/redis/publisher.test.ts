import { beforeEach, describe, expect, it, vi } from "vitest";

import { RedisPublisher } from "./publisher";
import { RaidEventPublisher } from "./raids";

describe("RedisPublisher", () => {
  let mockClient: any;
  let publisher: RedisPublisher;
  let raidPublisher: RaidEventPublisher;

  beforeEach(() => {
    mockClient = {
      publish: vi.fn(),
    };
    publisher = new RedisPublisher(mockClient);
    raidPublisher = new RaidEventPublisher(mockClient, "api");
    vi.clearAllMocks();
  });

  describe("publishEvent", () => {
    it("should publish a generic event successfully", async () => {
      const channel = "test.events";
      const event = {
        event: {
          type: "test.created",
          entityId: "test123",
          serverId: "server123",
          timestamp: "2024-01-01T00:00:00Z",
          data: { test: { id: "test123" } },
        },
        metadata: {
          source: "api" as const,
          version: "1.0.0",
        },
      };

      await publisher.publishEvent(channel, event);

      expect(mockClient.publish).toHaveBeenCalledWith(channel, JSON.stringify(event));
    });

    it("should handle publish errors", async () => {
      const channel = "test.events";
      const event = {
        event: {
          type: "test.created",
          entityId: "test123",
          serverId: "server123",
          timestamp: "2024-01-01T00:00:00Z",
          data: { test: { id: "test123" } },
        },
        metadata: {
          source: "api" as const,
          version: "1.0.0",
        },
      };

      const error = new Error("Publish failed");
      mockClient.publish.mockRejectedValue(error);

      await expect(publisher.publishEvent(channel, event)).rejects.toThrow("Publish failed");
    });
  });

  describe("RaidEventPublisher", () => {
    describe("publishRaidCreated", () => {
      it("should publish a raid created event", async () => {
        const raid = { id: "raid123", title: "Test Raid", serverId: "server123" } as any;

        await raidPublisher.publishRaidCreated(raid);

        expect(mockClient.publish).toHaveBeenCalledWith(
          "raid.events",
          expect.stringMatching(/.*"type":"raid\.created".*"entityId":"raid123".*"serverId":"server123".*/),
        );
      });
    });

    describe("publishRaidUpdated", () => {
      it("should publish a raid updated event", async () => {
        const raid = { id: "raid123", title: "Updated Raid", serverId: "server123" } as any;
        const previousRaid = { title: "Old Raid" };

        await raidPublisher.publishRaidUpdated(raid, previousRaid);

        expect(mockClient.publish).toHaveBeenCalledWith(
          "raid.events",
          expect.stringMatching(/.*"type":"raid\.updated".*"entityId":"raid123".*"serverId":"server123".*/),
        );
      });
    });

    describe("publishRaidDeleted", () => {
      it("should publish a raid deleted event", async () => {
        const raid = { id: "raid123", serverId: "server123" } as any;

        await raidPublisher.publishRaidDeleted(raid);

        expect(mockClient.publish).toHaveBeenCalledWith(
          "raid.events",
          expect.stringMatching(/.*"type":"raid\.deleted".*"entityId":"raid123".*"serverId":"server123".*/),
        );
      });
    });
  });
});
