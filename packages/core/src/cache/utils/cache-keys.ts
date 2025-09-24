import crypto from "crypto";

/**
 * Cache key utilities for consistent cache key generation
 *
 * Key naming convention:
 * - Use colons (:) as separators
 * - Use singular form for individual entities (user, server, raid, build)
 * - Use plural form for collections (users, servers, raids, builds)
 * - Include entity type as prefix (user:, server:, raid:, build:)
 * - Use descriptive suffixes for relationships (:members, :config, :discord)
 */
export const CacheKeys = {
  hashObject: (obj: object) => {
    return crypto.createHash("sha256").update(JSON.stringify(obj)).digest("hex");
  },

  // User cache keys
  user: (id: string): string => `user:${id}`,
  userByDiscord: (discordId: string): string => `user:discord:${discordId}`,
  usersByServer: (serverId: string): string => `users:server:${serverId}`,

  // Server cache keys
  serversByUser: (userId: string, include?: string): string => `servers:user:${userId}${include ? `:${include}` : ""}`,
  server: (id: string, include?: string): string => `server:${id}${include ? `:${include}` : ""}`,
  serverMembers: (serverId: string): string => `server:${serverId}:members`,
  serverMember: (serverId: string, userId: string): string => `server:${serverId}:member:${userId}`,
  serverConfig: (serverId: string): string => `server:${serverId}:config`,

  // Raid cache keys
  raid: (id: string, include?: string): string => `raid:${id}${include ? `:${include}` : ""}`,
  raidsByServer: (serverId: string, filters?: string): string =>
    `raids:server:${serverId}${filters ? `:${filters}` : ""}`,

  // Build cache keys
  build: (id: string): string => `build:${id}`,
  buildsByServer: (serverId: string, filters?: string): string =>
    `builds:server:${serverId}${filters ? `:${filters}` : ""}`,

  // Item cache keys
  itemDatabase: (): string => `items:database`,
  item: (id: string): string => `item:${id}`,
  itemsBySlot: (slotType: string): string => `items:slot:${slotType}`,
  itemSearch: (searchTerm: string, filters?: string): string =>
    `items:search:${searchTerm}${filters ? `:${filters}` : ""}`,

  // Permission cache keys
  permissions: (serverId: string, userId: string, type: "admin" | "caller"): string =>
    `permissions:${serverId}:${userId}:${type}`,
} as const;
