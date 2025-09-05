import { RedisClient, RedisClientType } from "@albion-raid-manager/redis";

export namespace Redis {
  let redisClient: RedisClient | null = null;

  export async function initClient(): Promise<void> {
    redisClient = new RedisClient();
    await redisClient.connect();
  }

  export function getClient(): RedisClientType {
    if (!redisClient) {
      throw new Error("Redis client not initialized");
    }

    return redisClient.getClient();
  }
}
