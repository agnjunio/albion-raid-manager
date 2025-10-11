import type { RedisClientType } from "redis";

import { logger } from "@albion-raid-manager/core/logger";

import { RedisCache } from "./cache";
import { RedisClient } from "./client";

export namespace Redis {
  let redisClient: RedisClient | null = null;
  let redisCache: RedisCache | null = null;

  export async function initClient(): Promise<void> {
    redisClient = new RedisClient();
    await redisClient.connect();

    logger.info("Redis client and cache initialized");
  }

  export function getClient(): RedisClientType {
    if (!redisClient) {
      throw new Error("Redis client not initialized. Call Redis.initClient() first.");
    }
    return redisClient.getClient();
  }

  export function getCache(): RedisCache {
    if (!redisClient) {
      throw new Error("Redis client not initialized. Call Redis.initClient() first.");
    }
    if (!redisCache) {
      redisCache = new RedisCache(redisClient.getClient());
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
      logger.info("Redis client disconnected");
    } catch (error) {
      logger.error("Error during Redis client shutdown", { error });
    }
  }
}

export namespace RedisSubscriber {
  let redisSubscriber: RedisClient | null = null;

  export async function initClient(): Promise<void> {
    redisSubscriber = new RedisClient();
    await redisSubscriber.connect();

    logger.info("Redis subscriber client initialized");
  }

  export function getClient(): RedisClientType {
    if (!redisSubscriber) {
      throw new Error("Redis subscriber client not initialized. Call Redis.initSubscriber() first.");
    }
    return redisSubscriber.getClient();
  }

  export async function disconnect(): Promise<void> {
    if (!redisSubscriber) return;

    try {
      await redisSubscriber.disconnect();
      redisSubscriber = null;
      logger.info("Redis subscriber client disconnected");
    } catch (error) {
      logger.error("Error during Redis subscriber client shutdown", { error });
    }
  }
}
