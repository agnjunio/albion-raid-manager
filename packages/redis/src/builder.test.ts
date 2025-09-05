import { describe, expect, it } from "vitest";

import { RedisEventMessageBuilder } from "./builder";
import { RaidEventType, RaidEventData } from "./events/raids";

describe("RedisEventMessageBuilder", () => {
  describe("create", () => {
    it("should create a new builder instance", () => {
      const builder = RedisEventMessageBuilder.create();
      expect(builder).toBeInstanceOf(RedisEventMessageBuilder);
    });
  });

  describe("withEventType", () => {
    it("should set the event type", () => {
      const builder = RedisEventMessageBuilder.create().withEventType(RaidEventType.CREATED);
      const event = builder
        .withEntityId("raid123")
        .withServerId("server123")
        .withData({ raid: { id: "raid123" } })
        .build();

      expect(event.event.type).toBe(RaidEventType.CREATED);
    });
  });

  describe("withEntityId", () => {
    it("should set the entity ID", () => {
      const builder = RedisEventMessageBuilder.create().withEntityId("raid123");
      const event = builder
        .withEventType(RaidEventType.CREATED)
        .withServerId("server123")
        .withData({ raid: { id: "raid123" } })
        .build();

      expect(event.event.entityId).toBe("raid123");
    });
  });

  describe("withServerId", () => {
    it("should set the server ID", () => {
      const builder = RedisEventMessageBuilder.create().withServerId("server123");
      const event = builder
        .withEventType(RaidEventType.CREATED)
        .withEntityId("raid123")
        .withData({ raid: { id: "raid123" } })
        .build();

      expect(event.event.serverId).toBe("server123");
    });
  });

  describe("withTimestamp", () => {
    it("should set a custom timestamp", () => {
      const customTimestamp = "2024-01-01T00:00:00Z";
      const builder = RedisEventMessageBuilder.create().withTimestamp(customTimestamp);
      const event = builder
        .withEventType(RaidEventType.CREATED)
        .withEntityId("raid123")
        .withServerId("server123")
        .withData({ raid: { id: "raid123" } })
        .build();

      expect(event.event.timestamp).toBe(customTimestamp);
    });

    it("should use current timestamp when no timestamp provided", () => {
      const before = new Date();
      const builder = RedisEventMessageBuilder.create().withTimestamp();
      const event = builder
        .withEventType(RaidEventType.CREATED)
        .withEntityId("raid123")
        .withServerId("server123")
        .withData({ raid: { id: "raid123" } })
        .build();
      const after = new Date();

      const eventTimestamp = new Date(event.event.timestamp);
      expect(eventTimestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(eventTimestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("withData", () => {
    it("should set the event data", () => {
      const data: RaidEventData = { raid: { id: "raid123" }, changes: { title: "Updated" } };
      const builder = RedisEventMessageBuilder.create<RaidEventData>().withData(data);
      const event = builder
        .withEventType(RaidEventType.CREATED)
        .withEntityId("raid123")
        .withServerId("server123")
        .build();

      expect(event.event.data).toEqual(data);
    });
  });

  describe("withSource", () => {
    it("should set the metadata source", () => {
      const builder = RedisEventMessageBuilder.create().withSource("bot");
      const event = builder
        .withEventType(RaidEventType.CREATED)
        .withEntityId("raid123")
        .withServerId("server123")
        .withData({ raid: { id: "raid123" } })
        .build();

      expect(event.metadata.source).toBe("bot");
    });
  });

  describe("withVersion", () => {
    it("should set the metadata version", () => {
      const builder = RedisEventMessageBuilder.create().withVersion("2.0.0");
      const event = builder
        .withEventType(RaidEventType.CREATED)
        .withEntityId("raid123")
        .withServerId("server123")
        .withData({ raid: { id: "raid123" } })
        .build();

      expect(event.metadata.version).toBe("2.0.0");
    });
  });

  describe("build", () => {
    it("should build a complete RedisEventMessage", () => {
      const event = RedisEventMessageBuilder.create<RaidEventData>()
        .withEventType(RaidEventType.CREATED)
        .withEntityId("raid123")
        .withServerId("server123")
        .withData({ raid: { id: "raid123" } })
        .build();

      expect(event).toEqual({
        event: {
          type: RaidEventType.CREATED,
          entityId: "raid123",
          serverId: "server123",
          timestamp: expect.any(String),
          data: { raid: { id: "raid123" } },
        },
        metadata: {
          source: "api",
          version: "1.0.0",
        },
      });
    });

    it("should throw error when required fields are missing", () => {
      expect(() => {
        RedisEventMessageBuilder.create().build();
      }).toThrow("Missing required fields: type, entityId, serverId, timestamp, and data must be set");
    });

    it("should throw error when event type is missing", () => {
      expect(() => {
        RedisEventMessageBuilder.create()
          .withEntityId("raid123")
          .withServerId("server123")
          .withData({ raid: { id: "raid123" } })
          .build();
      }).toThrow("Missing required fields: type, entityId, serverId, timestamp, and data must be set");
    });

    it("should throw error when entity ID is missing", () => {
      expect(() => {
        RedisEventMessageBuilder.create()
          .withEventType(RaidEventType.CREATED)
          .withServerId("server123")
          .withData({ raid: { id: "raid123" } })
          .build();
      }).toThrow("Missing required fields: type, entityId, serverId, timestamp, and data must be set");
    });

    it("should throw error when server ID is missing", () => {
      expect(() => {
        RedisEventMessageBuilder.create()
          .withEventType(RaidEventType.CREATED)
          .withEntityId("raid123")
          .withData({ raid: { id: "raid123" } })
          .build();
      }).toThrow("Missing required fields: type, entityId, serverId, timestamp, and data must be set");
    });

    it("should throw error when data is missing", () => {
      expect(() => {
        RedisEventMessageBuilder.create()
          .withEventType(RaidEventType.CREATED)
          .withEntityId("raid123")
          .withServerId("server123")
          .build();
      }).toThrow("Missing required fields: type, entityId, serverId, timestamp, and data must be set");
    });
  });

  describe("method chaining", () => {
    it("should support method chaining", () => {
      const builder = RedisEventMessageBuilder.create<RaidEventData>()
        .withEventType(RaidEventType.UPDATED)
        .withEntityId("raid123")
        .withServerId("server123")
        .withData({ raid: { id: "raid123" }, changes: { title: "Updated" } })
        .withSource("bot")
        .withVersion("2.0.0");

      expect(builder).toBeInstanceOf(RedisEventMessageBuilder);

      const event = builder.build();
      expect(event.event.type).toBe(RaidEventType.UPDATED);
      expect(event.event.entityId).toBe("raid123");
      expect(event.event.serverId).toBe("server123");
      expect(event.metadata.source).toBe("bot");
      expect(event.metadata.version).toBe("2.0.0");
    });
  });
});
