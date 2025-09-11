import { logger } from "@albion-raid-manager/core/logger";
import { RaidEventPublisher, Redis } from "@albion-raid-manager/core/redis";

let raidEventPublisher: RaidEventPublisher | null = null;

export async function getRaidEventPublisher(): Promise<RaidEventPublisher | null> {
  if (raidEventPublisher) {
    return raidEventPublisher;
  }

  try {
    const redisClient = Redis.getClient();
    if (!redisClient) {
      logger.warn("Redis client not available for raid event publisher");
      return null;
    }

    raidEventPublisher = new RaidEventPublisher(redisClient, "api");
    return raidEventPublisher;
  } catch (error) {
    logger.error(`Failed to initialize raid event publisher: ${error}`, { error });
    return null;
  }
}
