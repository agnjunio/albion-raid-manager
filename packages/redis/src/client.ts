import config from "@albion-raid-manager/core/config";
import { logger } from "@albion-raid-manager/core/logger";
import { createClient, RedisClientType } from "redis";

export class RedisClient {
  private client: RedisClientType;
  private isConnected = false;

  constructor() {
    this.client = createClient({
      url: config.redis.url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error("Redis reconnection failed after 10 attempts. Giving up.");
            return new Error("Redis reconnection failed");
          }

          const delay = Math.min(retries * 1000, 30000); // Exponential backoff, max 30s
          logger.warn(`Redis connection lost. Retrying in ${delay}ms (attempt ${retries})`);
          return delay;
        },
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on("error", (error) => {
      logger.error(`Redis client error: ${error}`, { error });
      this.isConnected = false;
    });

    this.client.on("connect", () => {
      logger.info("Redis client connected.");
      this.isConnected = true;
    });

    this.client.on("disconnect", () => {
      logger.warn("Redis client disconnected.");
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      await this.client.connect();
    } catch (error) {
      logger.error(`Failed to connect to Redis: ${error}`, { error });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.client.disconnect();
      this.isConnected = false;
    } catch (error) {
      logger.error("Failed to disconnect from Redis:", { error });
      throw error;
    }
  }

  getClient(): RedisClientType {
    return this.client;
  }

  isHealthy(): boolean {
    return this.isConnected;
  }

  async ping(): Promise<string> {
    if (!this.isConnected) {
      throw new Error("Redis client is not connected");
    }
    return await this.client.ping();
  }
}
