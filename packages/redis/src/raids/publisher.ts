import { logger } from "@albion-raid-manager/core/logger";
import { Raid } from "@albion-raid-manager/types";
import { RedisClientType } from "redis";

import { RedisEventMessageBuilder } from "../builder";
import { RedisEventMessage } from "../events";

import { RaidEventData, RaidEventType } from "./types";

export class RaidEventPublisher {
  private client: RedisClientType;
  private source: RedisEventMessage["metadata"]["source"];

  constructor(client: RedisClientType, source: RedisEventMessage["metadata"]["source"]) {
    this.client = client;
    this.source = source;
  }

  // Generic event publishing method
  async publishEvent<T = Record<string, unknown>>(channel: string, event: RedisEventMessage<T>): Promise<void> {
    try {
      event.metadata.source = this.source;

      const message = JSON.stringify(event);
      await this.client.publish(channel, message);

      logger.debug(`Published event to channel: ${channel}`, {
        channel,
        eventType: event.event.type,
        entityId: event.event.entityId,
      });
    } catch (error) {
      logger.error("Failed to publish event", {
        channel,
        eventType: event.event.type,
        entityId: event.event.entityId,
        error,
      });
      throw error;
    }
  }

  // Raid event methods
  async publishRaidCreated(raid: Raid): Promise<void> {
    const event = RedisEventMessageBuilder.create<RaidEventData>()
      .withEventType(RaidEventType.CREATED)
      .withEntityId(raid.id)
      .withServerId(raid.serverId)
      .withData({ raid })
      .build();

    await this.publishEvent("raid.events", event);
  }

  async publishRaidUpdated(raid: Raid, previousRaid?: Partial<Raid>): Promise<void> {
    const event = RedisEventMessageBuilder.create<RaidEventData>()
      .withEventType(RaidEventType.UPDATED)
      .withEntityId(raid.id)
      .withServerId(raid.serverId)
      .withData({ raid, previousRaid })
      .withSource(this.source)
      .build();

    await this.publishEvent("raid.events", event);
  }

  async publishRaidDeleted(raid: Raid): Promise<void> {
    const event = RedisEventMessageBuilder.create<RaidEventData>()
      .withEventType(RaidEventType.DELETED)
      .withEntityId(raid.id)
      .withServerId(raid.serverId)
      .withData({ raid })
      .build();

    await this.publishEvent("raid.events", event);
  }
}
