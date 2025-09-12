import type { Cache } from "@albion-raid-manager/core/redis";

import { memoize } from "../memory";

export interface CacheOptions {
  cache?: Cache | "memory";
  key: string;
  ttl?: number;
}

/**
 * Execute a query function with optional caching
 *
 * This function provides a clean way to cache expensive operations.
 * If cache is not provided, the query will execute without caching.
 * If cache is provided, it will check cache first, execute query on miss, and cache the result.
 *
 * @param queryFn - Function that returns the data to cache
 * @param options - Cache configuration options
 * @returns Promise resolving to the query result (from cache or fresh execution)
 *
 * @example
 * ```typescript
 * const result = await withCache(
 *   () => expensiveDatabaseQuery(),
 *   { cache: redisCache, key: 'user:123', ttl: 300 }
 * );
 * ```
 */
export async function withCache<T>(queryFn: () => Promise<T>, options: CacheOptions): Promise<T> {
  const { cache, key, ttl } = options;

  // If no cache provided, just execute the query
  if (!cache) {
    return queryFn();
  }

  if (cache === "memory") {
    return memoize(key, queryFn, { timeout: ttl });
  }

  // Try to get from cache first
  const cached = await cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Cache miss - execute query
  const result = await queryFn();

  // Cache the result (don't await to avoid blocking)
  cache.set(key, result, ttl).catch((error) => {
    // Log cache set errors but don't throw - the query succeeded
    console.warn(`Failed to cache result for key ${key}:`, error);
  });

  return result;
}
