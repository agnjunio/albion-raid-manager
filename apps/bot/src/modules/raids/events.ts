import { logger } from "@albion-raid-manager/core/logger";
import { isRaidEvent, RaidEventSubscriber, Redis } from "@albion-raid-manager/core/redis";
import { Client } from "discord.js";

import { createGuildContext } from "../guild-context";

import { handleRaidCreated, handleRaidDeleted, handleRaidUpdated } from "./handlers";

interface HandleRaidEventsProps {
  discord: Client;
}

export async function initRaidEvents({ discord }: HandleRaidEventsProps) {
  try {
    const subscriber = new RaidEventSubscriber(Redis.getClient());
    await subscriber.subscribe(async ({ event, metadata }) => {
      if (!isRaidEvent(event)) return;
      if (!event.serverId) return;
      if (metadata.source === "bot") return;

      const { type, entityId, serverId } = event;
      const guild = await discord.guilds.fetch(serverId);
      const context = await createGuildContext(guild);

      logger.debug(`Processing raid event: ${type}`, {
        entityId,
        serverId,
        eventType: type,
        context,
      });

      try {
        switch (type) {
          case "raid.created":
            await handleRaidCreated({ discord, event, context });
            break;
          case "raid.updated":
            await handleRaidUpdated({ discord, event, context });
            break;
          case "raid.deleted":
            await handleRaidDeleted({ discord, event, context });
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
