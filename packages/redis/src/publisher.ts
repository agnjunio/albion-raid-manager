import { logger } from "@albion-raid-manager/core/logger";
import { RedisClientType } from "redis";

import { RedisEventMessageBuilder } from "./builder";
import { RedisEventMessage } from "./events";

export class RedisPublisher {
  private client: RedisClientType;

  constructor(client: RedisClientType) {
    this.client = client;
  }

  async publishEvent<T = Record<string, unknown>>(channel: string, event: RedisEventMessage<T>): Promise<void> {
    try {
      const message = JSON.stringify(event);
      await this.client.publish(channel, message);

      logger.debug("Published event", {
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

  createEvent<T = Record<string, unknown>>(): RedisEventMessageBuilder<T> {
    return RedisEventMessageBuilder.create<T>();
  }
}
