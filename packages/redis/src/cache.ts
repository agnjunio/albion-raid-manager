import { logger } from "@albion-raid-manager/core/logger";
import { RedisClientType } from "redis";

export interface Cache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  deletePattern(pattern: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

export class RedisCache implements Cache {
  private client: RedisClientType;
  private defaultTtl: number;
  private defaultPrefix: string;

  constructor(client: RedisClientType, defaultTtl = 300, defaultPrefix = "albion") {
    this.client = client;
    this.defaultTtl = defaultTtl;
    this.defaultPrefix = defaultPrefix;
  }

  private getKey(key: string): string {
    return `${this.defaultPrefix}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getKey(key);
      const value = await this.client.get(fullKey);

      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      logger.error("Failed to get value from cache:", { key, error });
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const fullKey = this.getKey(key);
      const cacheTtl = ttl || this.defaultTtl;

      await this.client.setEx(fullKey, cacheTtl, JSON.stringify(value));
    } catch (error) {
      logger.error("Failed to set value in cache:", { key, error });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const fullKey = this.getKey(key);
      await this.client.del(fullKey);
    } catch (error) {
      logger.error("Failed to delete value from cache:", { key, error });
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      const fullPattern = this.getKey(pattern);
      const keys = await this.client.keys(fullPattern);

      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      logger.error("Failed to delete pattern from cache:", { pattern, error });
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const fullKey = this.getKey(key);
      const result = await this.client.exists(fullKey);
      return result === 1;
    } catch (error) {
      logger.error("Failed to check if key exists in cache:", { key, error });
      return false;
    }
  }
}
