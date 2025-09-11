import { RedisClientType } from "redis";

import { logger } from "@albion-raid-manager/core/logger";

import { RedisEventMessage } from "../events";

import { RegistrationEventData } from "./types";

export type RegistrationEventHandler = (event: RedisEventMessage<RegistrationEventData>) => Promise<void> | void;

export class RegistrationEventSubscriber {
  private client: RedisClientType;
  private handlers: RegistrationEventHandler[] = [];
  private isSubscribed = false;

  constructor(client: RedisClientType) {
    this.client = client;
    this.setupMessageHandler();
  }

  private setupMessageHandler() {
    this.client.on("message", async (channel, message) => {
      if (channel !== "registration.events") return;

      try {
        const event: RedisEventMessage<RegistrationEventData> = JSON.parse(message);
        await this.handleEvent(event);
      } catch (error) {
        logger.error("Failed to parse registration event message", {
          channel,
          message,
          error,
        });
      }
    });
  }

  private async handleEvent(event: RedisEventMessage<RegistrationEventData>) {
    logger.debug("Received registration event", {
      eventType: event.event.type,
      registrationId: event.event.entityId,
      serverId: event.event.serverId,
    });

    for (const handler of this.handlers) {
      try {
        await handler(event);
      } catch (error) {
        logger.error("Error in registration event handler", {
          eventType: event.event.type,
          registrationId: event.event.entityId,
          error,
        });
      }
    }
  }

  async subscribe(handler: RegistrationEventHandler): Promise<void> {
    try {
      // Add handler to the list
      this.handlers.push(handler);

      // Subscribe to the channel if not already subscribed
      if (!this.isSubscribed) {
        await this.client.subscribe("registration.events", (_message) => {
          // This will be handled by the message event handler
        });
        this.isSubscribed = true;
      }

      logger.info("Subscribed to registration events");
    } catch (error) {
      logger.error("Failed to subscribe to registration events", { error });
      throw error;
    }
  }

  async unsubscribe(handler?: RegistrationEventHandler): Promise<void> {
    try {
      if (handler) {
        // Remove specific handler
        const index = this.handlers.indexOf(handler);
        if (index > -1) {
          this.handlers.splice(index, 1);
        }

        // If no handlers left, unsubscribe from channel
        if (this.handlers.length === 0 && this.isSubscribed) {
          await this.client.unsubscribe("registration.events");
          this.isSubscribed = false;
        }
      } else {
        // Remove all handlers and unsubscribe
        this.handlers = [];
        if (this.isSubscribed) {
          await this.client.unsubscribe("registration.events");
          this.isSubscribed = false;
        }
      }

      logger.info("Unsubscribed from registration events");
    } catch (error) {
      logger.error("Failed to unsubscribe from registration events", { error });
      throw error;
    }
  }

  getHandlerCount(): number {
    return this.handlers.length;
  }

  isSubscribedToChannel(): boolean {
    return this.isSubscribed;
  }
}
