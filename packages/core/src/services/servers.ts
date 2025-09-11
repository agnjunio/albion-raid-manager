import type { Cache } from "@albion-raid-manager/core/redis";

import { Server } from "@albion-raid-manager/types";

import { CacheInvalidation, CacheKeys, withCache } from "@albion-raid-manager/core/cache/redis";
import { prisma } from "@albion-raid-manager/core/database";
import { logger } from "@albion-raid-manager/core/logger";

import { UsersService } from "./users";

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

  export async function createServerForUser(
    userId: string,
    server: Pick<Server, "id" | "name" | "icon">,
    options: ServersServiceOptions = {},
  ): Promise<Server> {
    const { cache } = options;

    const newServer = await prisma.server.create({
      data: {
        ...server,
        members: {
          create: {
            userId,
            adminPermission: true,
          },
        },
      },
    });

    if (cache) {
      CacheInvalidation.invalidateUser(cache, userId).catch((error) => {
        logger.warn("Cache invalidation failed", { error, userId });
      });
    }

    return newServer;
  }

  export async function getServerMembers(serverId: string, options: ServersServiceOptions = {}) {
    const { cache, cacheTtl = DEFAULT_CACHE_TTL } = options;
    const cacheKey = CacheKeys.serverMembers(serverId);

    return withCache(
      () =>
        prisma.serverMember.findMany({
          where: { serverId },
          include: { user: true },
        }),
      {
        cache,
        key: cacheKey,
        ttl: cacheTtl,
      },
    );
  }

  export async function getServerMember(serverId: string, userId: string, options: ServersServiceOptions = {}) {
    const { cache, cacheTtl = DEFAULT_CACHE_TTL } = options;
    const cacheKey = CacheKeys.serverMember(serverId, userId);

    return withCache(
      async () => {
        let serverMember = await prisma.serverMember.findUnique({
          where: { serverId_userId: { serverId, userId } },
        });

        if (!serverMember) {
          const user = await UsersService.getUser(userId);

          serverMember = await prisma.serverMember.create({
            data: {
              serverId,
              userId: user.id,
            },
          });
        }

        return serverMember;
      },
      {
        cache,
        key: cacheKey,
        ttl: cacheTtl,
      },
    );
  }
}
