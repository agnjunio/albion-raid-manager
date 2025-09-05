import { logger } from "@albion-raid-manager/logger";
import { isRaidEvent, RaidEventSubscriber } from "@albion-raid-manager/redis";
import { Client } from "discord.js";

import { Redis } from "@/redis";

import { handleRaidCreated, handleRaidDeleted, handleRaidStatusChanged, handleRaidUpdated } from "./handlers";

interface HandleRaidEventsProps {
  discord: Client;
}

export async function initRaidEvents({ discord }: HandleRaidEventsProps) {
  try {
    const subscriber = new RaidEventSubscriber(Redis.getClient());
    await subscriber.subscribe(async ({ event, metadata }) => {
      if (!isRaidEvent(event)) return;
      // Do not process events from the bot itself
      if (metadata.source === "bot") return;

      const { type, entityId, serverId } = event;
      logger.debug(`Processing raid event: ${type}`, {
        entityId,
        serverId,
        eventType: type,
      });

      try {
        switch (type) {
          case "raid.created":
            await handleRaidCreated({ discord, event });
            break;
          case "raid.updated":
            await handleRaidUpdated({ discord, event });
            break;
          case "raid.status_changed":
            await handleRaidStatusChanged({ discord, event });
            break;
          case "raid.deleted":
            await handleRaidDeleted({ discord, event });
            break;
          default:
            logger.warn(`Unknown raid event type: ${type}`, { entityId, serverId });
        }
      } catch (error) {
        logger.error(`Error handling raid event: ${type}`, {
          entityId,
          serverId,
          error,
        });
      }
    });
  } catch (error) {
    logger.error("Failed to subscribe to raid events via Redis", { error });
  }
}
