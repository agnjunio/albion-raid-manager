import type { RedisClientType } from "redis";

import { logger } from "@albion-raid-manager/logger";

import { RedisCache } from "./cache";
import { RedisClient } from "./client";

export namespace Redis {
  let redisClient: RedisClient | null = null;
  let redisCache: RedisCache | null = null;

  export async function initClient(): Promise<void> {
    redisClient = new RedisClient();
    await redisClient.connect();
    redisCache = new RedisCache(redisClient.getClient());

    logger.info("Redis client and cache initialized");
  }

  export function getClient(): RedisClientType {
    if (!redisClient) {
      throw new Error("Redis client not initialized. Call Redis.initClient() first.");
    }
    return redisClient.getClient();
  }

  export function getCache(): RedisCache {
    if (!redisClient || !redisCache) {
      throw new Error("Redis client not initialized. Call Redis.initClient() first.");
    }
    return redisCache;
  }

  export function isHealthy(): boolean {
    return redisClient?.isHealthy() ?? false;
  }

  export async function ping(): Promise<string> {
    const client = getClient();
    return await client.ping();
  }

  export async function disconnect(): Promise<void> {
    if (!redisClient) return;

    try {
      await redisClient.disconnect();
      redisClient = null;
      redisCache = null;
      logger.info("Redis client disconnected");
    } catch (error) {
      logger.error("Error during Redis client shutdown", { error });
    }
  }
}
