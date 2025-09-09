import type { Cache } from "@albion-raid-manager/redis";

import { CacheKeys } from "./cache-keys";

/**
 * Cache invalidation utilities for different entities
 */
export class CacheInvalidation {
  /**
   * Invalidate all caches related to a specific user
   */
  static async invalidateUser(cache: Cache, userId: string): Promise<void> {
    await Promise.all([
      cache.delete(CacheKeys.user(userId)),
      cache.delete(CacheKeys.userByDiscord(userId)),
      cache.delete(CacheKeys.serversByUser(userId)),
      cache.deletePattern(`raids:user:${userId}*`),
      cache.deletePattern(`member:*:${userId}`),
    ]);
  }

  /**
   * Invalidate all caches related to a specific server
   */
  static async invalidateServer(cache: Cache, serverId: string): Promise<void> {
    await Promise.all([
      cache.delete(CacheKeys.server(serverId)),
      cache.deletePattern(`server:${serverId}:*`),
      cache.deletePattern(`raids:server:${serverId}*`),
      cache.deletePattern(`raids:upcoming:${serverId}*`),
      cache.deletePattern(`raids:active:${serverId}`),
      cache.deletePattern(`member:${serverId}:*`),
      cache.deletePattern(`users:server:${serverId}`),
    ]);
  }

  /**
   * Invalidate all caches related to a specific raid
   */
  static async invalidateRaid(cache: Cache, raidId: string, serverId?: string): Promise<void> {
    await Promise.all([cache.delete(CacheKeys.raid(raidId)), cache.deletePattern(`raid:${raidId}:*`)]);

    // If serverId is provided, also invalidate server-specific raid caches
    if (serverId) {
      await Promise.all([
        cache.deletePattern(`raids:server:${serverId}*`),
        cache.deletePattern(`raids:upcoming:${serverId}*`),
        cache.deletePattern(`raids:active:${serverId}`),
      ]);
    }
  }

  /**
   * Invalidate all raid caches for a server (useful after creating/updating raids)
   */
  static async invalidateServerRaids(cache: Cache, serverId: string): Promise<void> {
    await Promise.all([
      cache.deletePattern(`raids:server:${serverId}*`),
      cache.deletePattern(`raids:upcoming:${serverId}*`),
      cache.deletePattern(`raids:active:${serverId}`),
    ]);
  }

  /**
   * Invalidate server member caches
   */
  static async invalidateServerMember(cache: Cache, serverId: string, userId: string): Promise<void> {
    await Promise.all([
      cache.delete(CacheKeys.serverMember(serverId, userId)),
      cache.delete(CacheKeys.serverMembers(serverId)),
      cache.delete(CacheKeys.server(serverId)),
      cache.delete(CacheKeys.serversByUser(userId)),
    ]);
  }
}
