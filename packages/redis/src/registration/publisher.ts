import { logger } from "@albion-raid-manager/logger";
import { RedisClientType } from "redis";

import { RedisEventMessageBuilder } from "../builder";
import { RedisEventMessage } from "../events";

import { RegistrationEventType, RegistrationEventData } from "./types";

export class RegistrationEventPublisher {
  private client: RedisClientType;

  constructor(client: RedisClientType) {
    this.client = client;
  }

  // Generic event publishing method
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

  // Registration event methods
  async publishRegistrationCreated(
    registration: RegistrationEventData["registration"],
    serverId: string,
  ): Promise<void> {
    const event = RedisEventMessageBuilder.create<RegistrationEventData>()
      .withEventType(RegistrationEventType.CREATED)
      .withEntityId(registration.id)
      .withServerId(serverId)
      .withData({ registration })
      .build();

    await this.publishEvent("registration.events", event);
  }

  async publishRegistrationUpdated(
    registration: RegistrationEventData["registration"],
    serverId: string,
    changes?: Record<string, unknown>,
  ): Promise<void> {
    const event = RedisEventMessageBuilder.create<RegistrationEventData>()
      .withEventType(RegistrationEventType.UPDATED)
      .withEntityId(registration.id)
      .withServerId(serverId)
      .withData({ registration, changes })
      .build();

    await this.publishEvent("registration.events", event);
  }

  async publishRegistrationVerified(
    registration: RegistrationEventData["registration"],
    serverId: string,
    previousStatus: string,
  ): Promise<void> {
    const event = RedisEventMessageBuilder.create<RegistrationEventData>()
      .withEventType(RegistrationEventType.VERIFIED)
      .withEntityId(registration.id)
      .withServerId(serverId)
      .withData({ registration, previousStatus })
      .build();

    await this.publishEvent("registration.events", event);
  }

  async publishRegistrationDeleted(registrationId: string, serverId: string): Promise<void> {
    const event = RedisEventMessageBuilder.create<RegistrationEventData>()
      .withEventType(RegistrationEventType.DELETED)
      .withEntityId(registrationId)
      .withServerId(serverId)
      .withData({
        registration: {
          id: registrationId,
          userId: "",
          username: "",
          characterName: "",
          status: "pending",
        },
      })
      .build();

    await this.publishEvent("registration.events", event);
  }
}
