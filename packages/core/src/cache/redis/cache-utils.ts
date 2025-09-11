import type { Cache } from "@albion-raid-manager/core/redis";

export async function cacheQuery<T>(cache: Cache, key: string, queryFn: () => Promise<T>, ttl: number): Promise<T> {
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

export async function invalidatePatterns(cache: Cache, patterns: string[]): Promise<void> {
  await Promise.all(patterns.map((pattern) => cache.deletePattern(pattern)));
}
