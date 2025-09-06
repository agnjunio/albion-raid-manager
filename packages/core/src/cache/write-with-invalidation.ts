import type { Cache } from "@albion-raid-manager/redis";
import { CacheInvalidation } from "./invalidation";

/**
 * Helper function to execute write operations with automatic cache invalidation
 */
export async function writeWithInvalidation<T>(
  writeFn: () => Promise<T>,
  options: {
    cache?: Cache;
    invalidationFn?: (cache: Cache, result: T) => Promise<void>;
  },
): Promise<T> {
  const { cache, invalidationFn } = options;

  // Execute the write operation
  const result = await writeFn();

  // Invalidate cache if provided
  if (cache && invalidationFn) {
    await invalidationFn(cache, result);
  }

  return result;
}

/**
 * Common invalidation patterns for write operations
 */
export const WriteInvalidation = {
  /**
   * Invalidate after creating a raid
   */
  afterCreateRaid: async (cache: Cache, raid: { serverId: string }) => {
    await CacheInvalidation.invalidateServerRaids(cache, raid.serverId);
  },

  /**
   * Invalidate after updating a raid
   */
  afterUpdateRaid: async (cache: Cache, raid: { id: string; serverId: string }) => {
    await CacheInvalidation.invalidateRaid(cache, raid.id, raid.serverId);
  },

  /**
   * Invalidate after deleting a raid
   */
  afterDeleteRaid: async (cache: Cache, raid: { id: string; serverId: string }) => {
    await CacheInvalidation.invalidateRaid(cache, raid.id, raid.serverId);
  },

  /**
   * Invalidate after creating a server
   */
  afterCreateServer: async (cache: Cache, server: { id: string }) => {
    await CacheInvalidation.invalidateServer(cache, server.id);
  },

  /**
   * Invalidate after updating a server
   */
  afterUpdateServer: async (cache: Cache, server: { id: string }) => {
    await CacheInvalidation.invalidateServer(cache, server.id);
  },

  /**
   * Invalidate after creating a server member
   */
  afterCreateServerMember: async (cache: Cache, member: { serverId: string; userId: string }) => {
    await CacheInvalidation.invalidateServerMember(cache, member.serverId, member.userId);
  },

  /**
   * Invalidate after updating a server member
   */
  afterUpdateServerMember: async (cache: Cache, member: { serverId: string; userId: string }) => {
    await CacheInvalidation.invalidateServerMember(cache, member.serverId, member.userId);
  },
};
