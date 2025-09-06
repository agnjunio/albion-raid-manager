import type { Cache } from "@albion-raid-manager/redis";

import { prisma } from "@albion-raid-manager/database";

import { Server } from "@albion-raid-manager/core/types";

import { CacheKeys, withCache } from "../cache";

export interface ServersServiceOptions {
  cache?: Cache;
  cacheTtl?: number;
}

export namespace ServersService {
  const DEFAULT_CACHE_TTL = 600;

  export async function ensureServerExists(serverId: string): Promise<Server> {
    const server = await getServerById(serverId);

    if (!server) {
      throw new Error(`Server ${serverId} not found. Please ensure the server is registered.`);
    }

    return server;
  }

  export async function getServerById(serverId: string, options: ServersServiceOptions = {}): Promise<Server | null> {
    const { cache, cacheTtl = DEFAULT_CACHE_TTL } = options;
    const cacheKey = CacheKeys.server(serverId);

    return withCache(
      () =>
        prisma.server.findUnique({
          where: {
            id: serverId,
          },
        }),
      {
        cache,
        key: cacheKey,
        ttl: cacheTtl,
      },
    );
  }

  export async function getServersForUser(userId: string, options: ServersServiceOptions = {}) {
    const { cache, cacheTtl = DEFAULT_CACHE_TTL } = options;
    const cacheKey = CacheKeys.serversByUser(userId);

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
        cache,
        key: cacheKey,
        ttl: cacheTtl,
      },
    );
  }

  export async function getServerWithMember(serverId: string, userId: string, options: ServersServiceOptions = {}) {
    const { cache, cacheTtl = DEFAULT_CACHE_TTL } = options;
    const cacheKey = `server:${serverId}:member:${userId}`;

    return withCache(
      () =>
        prisma.server.findUnique({
          where: { id: serverId },
          include: {
            members: {
              where: { userId },
            },
          },
        }),
      {
        cache,
        key: cacheKey,
        ttl: cacheTtl,
      },
    );
  }
}
