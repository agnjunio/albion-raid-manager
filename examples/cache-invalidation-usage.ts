/**
 * Example showing how to handle cache invalidation after write operations
 */

import { Redis } from "@albion-raid-manager/redis";
import { CacheKeys, withCache, writeWithInvalidation, WriteInvalidation } from "@albion-raid-manager/core";
import { prisma } from "@albion-raid-manager/database";

async function example() {
  // Initialize Redis
  await Redis.initClient();
  const cache = Redis.getCache();

  const serverId = "server123";
  const userId = "user456";

  // Example 1: Read operation with caching
  console.log("=== Reading with cache ===");
  const servers = await withCache(() => prisma.server.findMany({ where: { id: serverId } }), {
    cache,
    key: CacheKeys.server(serverId),
    ttl: 600,
  });
  console.log("Cached servers:", servers);

  // Example 2: Write operation with automatic cache invalidation
  console.log("=== Writing with cache invalidation ===");
  const newServer = await writeWithInvalidation(
    () =>
      prisma.server.create({
        data: {
          id: "new-server-789",
          name: "New Test Server",
          discordId: "discord-server-789",
        },
      }),
    {
      cache,
      invalidationFn: WriteInvalidation.afterCreateServer,
    },
  );
  console.log("Created server:", newServer);

  // Example 3: Update operation with cache invalidation
  console.log("=== Updating with cache invalidation ===");
  const updatedServer = await writeWithInvalidation(
    () =>
      prisma.server.update({
        where: { id: "new-server-789" },
        data: { name: "Updated Server Name" },
      }),
    {
      cache,
      invalidationFn: WriteInvalidation.afterUpdateServer,
    },
  );
  console.log("Updated server:", updatedServer);

  // Example 4: Manual cache invalidation
  console.log("=== Manual cache invalidation ===");
  await cache.set(CacheKeys.server("manual-server"), { id: "manual-server", name: "Manual" }, 600);

  // Read from cache
  const cachedServer = await cache.get(CacheKeys.server("manual-server"));
  console.log("Before invalidation:", cachedServer);

  // Manually invalidate
  await cache.delete(CacheKeys.server("manual-server"));

  // Try to read again (should be null)
  const afterInvalidation = await cache.get(CacheKeys.server("manual-server"));
  console.log("After invalidation:", afterInvalidation);

  // Example 5: Pattern-based invalidation
  console.log("=== Pattern-based invalidation ===");

  // Set multiple related cache entries
  await cache.set("raids:server:123:OPEN", [], 60);
  await cache.set("raids:server:123:CLOSED", [], 60);
  await cache.set("raids:upcoming:123", [], 60);

  // Invalidate all raid caches for server 123
  await cache.deletePattern("raids:server:123*");
  await cache.deletePattern("raids:upcoming:123*");

  console.log("Invalidated all raid caches for server 123");

  // Cleanup
  await Redis.disconnect();
}

// Run example
example().catch(console.error);
