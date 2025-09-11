import { logger } from "@albion-raid-manager/core/logger";
import { RedisClientType } from "redis";

import { RedisEventMessage } from "./events";

export type GenericEventHandler = (event: RedisEventMessage) => Promise<void> | void;

export class RedisSubscriber {
  private client: RedisClientType;
  private handlers: Map<string, GenericEventHandler[]> = new Map();

  constructor(client: RedisClientType) {
    this.client = client;
  }

  private async handleEvent(channel: string, event: RedisEventMessage) {
    const handlers = this.handlers.get(channel) || [];

    logger.debug("Received redis event", {
      channel,
      eventType: event.event.type,
      entityId: event.event.entityId,
    });

    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        logger.error("Error in event handler", {
          channel,
          eventType: event.event.type,
          entityId: event.event.entityId,
          error,
        });
      }
    }
  }

  async subscribe(channel: string, handler: GenericEventHandler): Promise<void> {
    try {
      // Add handler to the list
      if (!this.handlers.has(channel)) {
        this.handlers.set(channel, []);
      }

      const handlers = this.handlers.get(channel);
      if (handlers) {
        handlers.push(handler);
      }

      logger.info(`Subscribed to Redis channel: ${channel}`);
    } catch (error) {
      logger.error("Failed to subscribe to Redis channel", { channel, error });
      throw error;
    }
  }

  async unsubscribe(channel: string, handler?: GenericEventHandler): Promise<void> {
    try {
      if (handler) {
        // Remove specific handler
        const handlers = this.handlers.get(channel) || [];
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }

        // If no handlers left, unsubscribe from channel
        if (handlers.length === 0) {
          await this.client.unsubscribe(channel);
          this.handlers.delete(channel);
        }
      } else {
        // Remove all handlers and unsubscribe
        await this.client.unsubscribe(channel);
        this.handlers.delete(channel);
      }

      logger.info(`Unsubscribed from Redis channel: ${channel}`);
    } catch (error) {
      logger.error("Failed to unsubscribe from Redis channel", { channel, error });
      throw error;
    }
  }
}
