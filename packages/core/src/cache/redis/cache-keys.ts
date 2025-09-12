import crypto from "crypto";

export const CacheKeys = {
  hashObject: (obj: object) => {
    return crypto.createHash("sha256").update(JSON.stringify(obj)).digest("hex");
  },

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
  raid: (id: string, include?: string) => `raid:${id}${include ? `:${include}` : ""}`,
  raids: (filters: string, include: string) => `raids:${filters}:${include}`,
  raidsByServer: (serverId: string, filters?: string) => `raids:server:${serverId}${filters ? `:${filters}` : ""}`,

  // Build keys
  build: (id: string) => `build:${id}`,
  buildsByServer: (serverId: string, filters?: string) => `builds:server:${serverId}${filters ? `:${filters}` : ""}`,
} as const;
