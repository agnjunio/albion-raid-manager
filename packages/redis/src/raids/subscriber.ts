import { logger } from "@albion-raid-manager/core/logger";
import { RedisClientType } from "redis";

import { RedisEventMessage } from "../events";

import { RaidEventData } from "./types";

export type RaidEventHandler = (event: RedisEventMessage<RaidEventData>) => Promise<void> | void;

export class RaidEventSubscriber {
  private client: RedisClientType;

  constructor(client: RedisClientType) {
    this.client = client;
  }

  async subscribe(handler: RaidEventHandler): Promise<void> {
    try {
      await this.client.subscribe("raid.events", (message: string) => {
        const event: RedisEventMessage<RaidEventData> = JSON.parse(message);
        handler(event);
      });

      logger.debug("Subscribed to raid events.");
    } catch (error) {
      logger.error("Failed to subscribe to raid events", { error });
      throw error;
    }
  }

  async unsubscribe(): Promise<void> {
    try {
      await this.client.unsubscribe("raid.events");
      logger.debug("Unsubscribed from raid events.");
    } catch (error) {
      logger.error("Failed to unsubscribe from raid events", { error });
      throw error;
    }
  }
}
