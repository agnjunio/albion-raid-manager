/**
 * Example showing the simplified cache approach with withCache utility
 */

import { Redis } from "@albion-raid-manager/redis";
import { CacheKeys, withCache } from "@albion-raid-manager/core";
import { prisma } from "@albion-raid-manager/database";

async function example() {
  // Initialize Redis
  await Redis.initClient();
  const cache = Redis.getCache();

  // Example 1: Simple query with caching
  const userId = "user123";
  const user = await withCache(() => prisma.user.findUnique({ where: { id: userId } }), {
    cache,
    key: CacheKeys.user(userId),
    ttl: 300, // 5 minutes
  });

  console.log("User:", user);

  // Example 2: Complex query with includes
  const serverId = "server456";
  const server = await withCache(
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
      cache,
      key: CacheKeys.server(serverId),
      ttl: 600, // 10 minutes
    },
  );

  console.log("Server with members:", server);

  // Example 3: Query with filters
  const raids = await withCache(
    () =>
      prisma.raid.findMany({
        where: {
          serverId,
          status: "OPEN",
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
      cache,
      key: CacheKeys.raidsByServer(serverId, "OPEN"),
      ttl: 60, // 1 minute
    },
  );

  console.log("Open raids:", raids);

  // Example 4: No cache (just pass undefined)
  const allUsers = await withCache(() => prisma.user.findMany(), {
    cache: undefined, // No caching
    key: "all-users",
    ttl: 0,
  });

  console.log("All users (no cache):", allUsers);

  // Cleanup
  await Redis.disconnect();
}

// Run example
example().catch(console.error);
