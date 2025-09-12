import type { Cache } from "@albion-raid-manager/core/redis";

import { CacheKeys } from "@albion-raid-manager/core/cache/utils";

/**
 * Cache invalidation utilities for different entities
 *
 * This class provides methods to invalidate related cache entries when data changes.
 * It uses both specific key deletion and pattern-based deletion for comprehensive cache clearing.
 */
export class CacheInvalidation {
  /**
   * Invalidate all caches related to a specific user
   * @param cache - Redis cache instance
   * @param userId - User ID to invalidate
   */
  static async invalidateUser(cache: Cache, userId: string): Promise<void> {
    const keys = [CacheKeys.user(userId), CacheKeys.userByDiscord(userId), CacheKeys.serversByUser(userId)];

    await Promise.all(keys.map((key) => cache.delete(key)));
  }

  /**
   * Invalidate all caches related to a specific server
   * @param cache - Redis cache instance
   * @param serverId - Server ID to invalidate
   */
  static async invalidateServer(cache: Cache, serverId: string): Promise<void> {
    const specificKeys = [
      CacheKeys.server(serverId),
      CacheKeys.serverMembers(serverId),
      CacheKeys.serverConfig(serverId),
      CacheKeys.usersByServer(serverId),
    ];

    const patterns = [`server:${serverId}:*`, `raids:server:${serverId}*`, `builds:server:${serverId}*`];

    await Promise.all([
      ...specificKeys.map((key) => cache.delete(key)),
      ...patterns.map((pattern) => cache.deletePattern(pattern)),
    ]);
  }

  /**
   * Invalidate all caches related to a specific raid
   * @param cache - Redis cache instance
   * @param raidId - Raid ID to invalidate
   * @param serverId - Optional server ID for additional invalidation
   */
  static async invalidateRaid(cache: Cache, raidId: string, serverId?: string): Promise<void> {
    const operations = [cache.delete(CacheKeys.raid(raidId)), cache.deletePattern(`raid:${raidId}:*`)];

    // If serverId is provided, also invalidate server-specific raid caches
    if (serverId) {
      operations.push(cache.deletePattern(CacheKeys.raidsByServer(serverId, "*")));
    }

    await Promise.all(operations);
  }

  /**
   * Invalidate all raid caches for a server (useful after creating/updating raids)
   * @param cache - Redis cache instance
   * @param serverId - Server ID to invalidate raids for
   */
  static async invalidateServerRaids(cache: Cache, serverId: string): Promise<void> {
    await cache.deletePattern(CacheKeys.raidsByServer(serverId, "*"));
  }

  /**
   * Invalidate server member caches
   * @param cache - Redis cache instance
   * @param serverId - Server ID
   * @param userId - User ID
   */
  static async invalidateServerMember(cache: Cache, serverId: string, userId: string): Promise<void> {
    const keys = [
      CacheKeys.serverMember(serverId, userId),
      CacheKeys.serverMembers(serverId),
      CacheKeys.server(serverId),
      CacheKeys.serversByUser(userId),
    ];

    await Promise.all(keys.map((key) => cache.delete(key)));
  }

  /**
   * Invalidate all caches related to a specific build
   * @param cache - Redis cache instance
   * @param buildId - Build ID to invalidate
   */
  static async invalidateBuild(cache: Cache, buildId: string): Promise<void> {
    await Promise.all([cache.delete(CacheKeys.build(buildId)), cache.deletePattern(`build:${buildId}:*`)]);
  }

  /**
   * Invalidate all build caches for a server (useful after creating/updating builds)
   * @param cache - Redis cache instance
   * @param serverId - Server ID to invalidate builds for
   */
  static async invalidateServerBuilds(cache: Cache, serverId: string): Promise<void> {
    await cache.deletePattern(CacheKeys.buildsByServer(serverId, "*"));
  }
}
