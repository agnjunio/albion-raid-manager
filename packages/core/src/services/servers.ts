import type { Cache } from "@albion-raid-manager/core/redis";

import { Server, ServerMember } from "@albion-raid-manager/types";
import { APIServer } from "@albion-raid-manager/types/api";
import { ServiceError, ServiceErrorCode } from "@albion-raid-manager/types/services";

import { CacheInvalidation } from "@albion-raid-manager/core/cache/redis";
import { CacheKeys, withCache } from "@albion-raid-manager/core/cache/utils";
import config from "@albion-raid-manager/core/config";
import { prisma } from "@albion-raid-manager/core/database";
import { logger } from "@albion-raid-manager/core/logger";

import { DiscordService } from "./discord";
import { UsersService } from "./users";

export interface ServersServiceOptions {
  cache?: Cache;
  cacheTtl?: number;
}

export namespace ServersService {
  const DEFAULT_CACHE_TTL = 600;

  export async function ensureServer(serverId: string): Promise<Server> {
    let server = await getServerById(serverId);

    if (!server) {
      const discordServer: APIServer = await DiscordService.servers.getServer(serverId, {
        type: "bot",
        token: config.discord.token,
      });

      if (!discordServer) {
        throw new Error(`Server ${serverId} not found. Please ensure the server is registered.`);
      }

      server = await prisma.server.create({
        data: {
          id: serverId,
          name: discordServer.name,
          icon: discordServer.icon,
        },
      });
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

    return withCache<Server[]>(
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

  export async function ensureServerMember(
    serverId: string,
    userId: string,
    options: ServersServiceOptions = {},
  ): Promise<ServerMember> {
    const { cache } = options;

    let serverMember = await getServerMember(serverId, userId);

    if (!serverMember) {
      const user = await UsersService.ensureUser(userId);

      if (!user) {
        throw new ServiceError(
          ServiceErrorCode.CREATE_FAILED,
          `Failed to ensure server member ${userId} in server ${serverId} because user ${userId} does not exist after attempting to create it.`,
        );
      }

      serverMember = await prisma.serverMember.create({
        data: {
          serverId,
          userId: user.id,
        },
      });
    }

    if (cache) {
      CacheInvalidation.invalidateServerMember(cache, serverId, userId).catch((error) => {
        logger.warn("Cache invalidation failed", { error, serverId, userId });
      });
    }

    return serverMember;
  }

  export async function getServerMembers(
    serverId: string,
    options: ServersServiceOptions = {},
  ): Promise<ServerMember[]> {
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
        return await prisma.serverMember.findUnique({
          where: { serverId_userId: { serverId, userId } },
        });
      },
      {
        cache,
        key: cacheKey,
        ttl: cacheTtl,
      },
    );
  }
}
