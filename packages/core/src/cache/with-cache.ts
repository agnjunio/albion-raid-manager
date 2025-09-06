import type { Cache } from "@albion-raid-manager/redis";

/**
 * Simple utility to execute a query with optional caching
 * Eliminates duplication between cached and non-cached code paths
 */
export async function withCache<T>(
  queryFn: () => Promise<T>,
  options: {
    cache?: Cache;
    key: string;
    ttl: number;
  },
): Promise<T> {
  const { cache, key, ttl } = options;

  // If no cache provided, just execute the query
  if (!cache) {
    return queryFn();
  }

  // Try to get from cache first
  const cached = await cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Cache miss - execute query
  const result = await queryFn();

  // Cache the result
  await cache.set(key, result, ttl);

  return result;
}
