/**
 * Complete example showing how to use the cache system in a real application
 */

import { Redis } from "@albion-raid-manager/redis";
import { CacheKeys, withCache, writeWithInvalidation, WriteInvalidation } from "@albion-raid-manager/core";
import { prisma } from "@albion-raid-manager/database";

class RaidManager {
  private cache = Redis.getCache();

  /**
   * Get raids for a server (with caching)
   */
  async getRaidsForServer(serverId: string, status?: string) {
    return withCache(
      () =>
        prisma.raid.findMany({
          where: {
            serverId,
            ...(status && { status }),
          },
          include: {
            slots: {
              include: {
                user: true,
              },
            },
          },
        }),
      {
        cache: this.cache,
        key: CacheKeys.raidsByServer(serverId, status),
        ttl: 60, // 1 minute
      },
    );
  }

  /**
   * Create a new raid (with cache invalidation)
   */
  async createRaid(raidData: { title: string; description: string; date: Date; serverId: string; type: string }) {
    return writeWithInvalidation(
      () =>
        prisma.raid.create({
          data: {
            title: raidData.title,
            description: raidData.description,
            date: raidData.date,
            serverId: raidData.serverId,
            type: raidData.type,
            status: "SCHEDULED",
          },
          include: {
            slots: true,
          },
        }),
      {
        cache: this.cache,
        invalidationFn: WriteInvalidation.afterCreateRaid,
      },
    );
  }

  /**
   * Update a raid (with cache invalidation)
   */
  async updateRaid(raidId: string, updates: { title?: string; description?: string }) {
    // First get the raid to know the serverId for invalidation
    const existingRaid = await prisma.raid.findUnique({
      where: { id: raidId },
      select: { serverId: true },
    });

    if (!existingRaid) {
      throw new Error("Raid not found");
    }

    return writeWithInvalidation(
      () =>
        prisma.raid.update({
          where: { id: raidId },
          data: updates,
          include: {
            slots: true,
          },
        }),
      {
        cache: this.cache,
        invalidationFn: WriteInvalidation.afterUpdateRaid,
      },
    );
  }

  /**
   * Get server information (with caching)
   */
  async getServer(serverId: string) {
    return withCache(
      () =>
        prisma.server.findUnique({
          where: { id: serverId },
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        }),
      {
        cache: this.cache,
        key: CacheKeys.server(serverId),
        ttl: 600, // 10 minutes
      },
    );
  }

  /**
   * Add user to server (with cache invalidation)
   */
  async addUserToServer(serverId: string, userId: string, role: string) {
    return writeWithInvalidation(
      () =>
        prisma.serverMember.create({
          data: {
            serverId,
            userId,
            role,
          },
        }),
      {
        cache: this.cache,
        invalidationFn: WriteInvalidation.afterCreateServerMember,
      },
    );
  }

  /**
   * Get user's servers (with caching)
   */
  async getUserServers(userId: string) {
    return withCache(
      () =>
        prisma.server.findMany({
          where: {
            members: {
              some: { userId },
            },
          },
        }),
      {
        cache: this.cache,
        key: CacheKeys.serversByUser(userId),
        ttl: 600, // 10 minutes
      },
    );
  }

  /**
   * Manual cache invalidation for specific scenarios
   */
  async invalidateUserCache(userId: string) {
    await this.cache.deletePattern(`user:${userId}*`);
    await this.cache.deletePattern(`servers:user:${userId}*`);
    await this.cache.deletePattern(`raids:user:${userId}*`);
  }

  async invalidateServerCache(serverId: string) {
    await this.cache.deletePattern(`server:${serverId}*`);
    await this.cache.deletePattern(`raids:server:${serverId}*`);
    await this.cache.deletePattern(`member:${serverId}:*`);
  }
}

async function example() {
  // Initialize Redis
  await Redis.initClient();

  const raidManager = new RaidManager();

  try {
    // Example workflow
    console.log("=== Creating a raid ===");
    const raid = await raidManager.createRaid({
      title: "Test Raid",
      description: "A test raid for demonstration",
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      serverId: "server123",
      type: "FIXED",
    });
    console.log("Created raid:", raid.id);

    // This will be served from cache on subsequent calls
    console.log("=== Getting raids (cached) ===");
    const raids = await raidManager.getRaidsForServer("server123");
    console.log("Raids for server:", raids.length);

    // Update the raid (invalidates cache)
    console.log("=== Updating raid ===");
    const updatedRaid = await raidManager.updateRaid(raid.id, {
      title: "Updated Test Raid",
    });
    console.log("Updated raid:", updatedRaid.title);

    // Get server info (cached)
    console.log("=== Getting server info (cached) ===");
    const server = await raidManager.getServer("server123");
    console.log("Server:", server?.name);

    // Manual cache invalidation
    console.log("=== Manual cache invalidation ===");
    await raidManager.invalidateServerCache("server123");
    console.log("Invalidated server cache");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Cleanup
    await Redis.disconnect();
  }
}

// Run example
example().catch(console.error);
