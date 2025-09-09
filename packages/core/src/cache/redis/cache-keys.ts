/**
 * Simple cache key generators for different entities
 */

import crypto from "crypto";

import { Prisma } from "@albion-raid-manager/database";

function hashObject(obj: object) {
  return crypto.createHash("sha256").update(JSON.stringify(obj)).digest("hex");
}

export const CacheKeys = {
  // User keys
  user: (id: string) => `user:${id}`,
  userByDiscord: (discordId: string) => `user:discord:${discordId}`,
  usersByServer: (serverId: string) => `users:server:${serverId}`,

  // Server keys
  server: (id: string) => `server:${id}`,
  serverMembers: (serverId: string) => `server:${serverId}:members`,
  serverMember: (serverId: string, userId: string) => `member:${serverId}:${userId}`,
  serversByUser: (userId: string) => `servers:user:${userId}`,
  serverConfig: (serverId: string) => `config:server:${serverId}`,

  // Raid keys
  raid: (id: string, include?: Prisma.RaidInclude) => {
    if (include) {
      return `raid:${id}:${hashObject(include)}`;
    }
    return `raid:${id}`;
  },
  raids: (filters: string, include: string) => `raids:${filters}:${include}`,
  raidsByServer: (serverId: string, status?: string) => `raids:server:${serverId}${status ? `:${status}` : ""}`,
  raidsByUser: (userId: string) => `raids:user:${userId}`,
  upcomingRaids: (serverId: string) => `raids:${serverId}:upcoming`,
  activeRaids: (serverId: string) => `raids:${serverId}:active`,
  raidStats: (serverId: string) => `raid:${serverId}:stats`,
} as const;
