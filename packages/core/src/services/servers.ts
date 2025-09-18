import type { Cache } from "@albion-raid-manager/core/redis";

import { Server, ServerMember } from "@albion-raid-manager/types";
import { APIServer } from "@albion-raid-manager/types/api";
import { ServiceError, ServiceErrorCode } from "@albion-raid-manager/types/services";

import { CacheInvalidation } from "@albion-raid-manager/core/cache/redis";
import { CacheKeys, withCache } from "@albion-raid-manager/core/cache/utils";
import config from "@albion-raid-manager/core/config";
import { Prisma, prisma } from "@albion-raid-manager/core/database";
import { logger } from "@albion-raid-manager/core/logger";

import { DiscordService } from "./discord";
import { UsersService } from "./users";

export interface ServersServiceOptions {
  cache?: Cache;
  cacheTtl?: number;
}

export namespace ServersService {
  const DEFAULT_CACHE_TTL = 600;

  export async function ensureServer(
    serverId: string,
    data?: Pick<Server, "name" | "icon">,
    options: ServersServiceOptions = {},
  ): Promise<Server> {
    const { cache } = options;

    let server = await getServerById(serverId);

    // If the server doesn't exist and data is provided, create a server record
    if (!server && data) {
      server = await prisma.server.upsert({
        where: { id: serverId },
        update: {
          name: data.name,
          icon: data.icon,
          active: true,
        },
        create: {
          id: serverId,
          name: data.name,
          icon: data.icon,
          active: true,
        },
      });
    }

    // If the server doesn't exist and data is not provided, try to fetch data from Discord
    if (!server && !data) {
      const discordServer: APIServer = await DiscordService.servers.getServer(serverId, {
        type: "bot",
        token: config.discord.token,
      });

      if (!discordServer) {
        throw new ServiceError(
          ServiceErrorCode.NOT_FOUND,
          `Server ${serverId} not found. Please ensure the server is registered.`,
        );
      }

      server = await prisma.server.upsert({
        where: { id: serverId },
        create: {
          id: serverId,
          name: discordServer.name,
          icon: discordServer.icon,
        },
        update: {
          name: discordServer.name,
          icon: discordServer.icon,
          active: true,
        },
      });
    }

    if (!server) {
      throw new ServiceError(
        ServiceErrorCode.NOT_FOUND,
        `Server ${serverId} not found. Please ensure the server is registered.`,
      );
    }

    if (cache) {
      CacheInvalidation.invalidateServer(cache, serverId).catch((error) => {
        logger.warn("Cache invalidation failed", { error, serverId });
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
            active: true,
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
            active: true,
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

  export async function addServerForUser(
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
    data?: Omit<Prisma.ServerMemberCreateInput, "server" | "user">,
    options: ServersServiceOptions = {},
  ): Promise<ServerMember> {
    const { cache } = options;

    let serverMember = await getServerMember(serverId, userId);

    if (!serverMember) {
      const user = await UsersService.ensureUser(userId, {});

      if (!user) {
        throw new ServiceError(
          ServiceErrorCode.CREATE_FAILED,
          `Failed to ensure server member ${userId} in server ${serverId} because user ${userId} does not exist after attempting to create it.`,
        );
      }

      serverMember = await prisma.serverMember.upsert({
        where: { serverId_userId: { serverId, userId } },
        update: {
          adminPermission: data?.adminPermission,
          raidPermission: data?.raidPermission,
          compositionPermission: data?.compositionPermission,
        },
        create: {
          serverId,
          userId,
          adminPermission: data?.adminPermission,
          raidPermission: data?.raidPermission,
          compositionPermission: data?.compositionPermission,
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
        const serverMember = await prisma.serverMember.findUnique({
          where: { serverId_userId: { serverId, userId } },
        });
        return serverMember;
      },
      {
        cache,
        key: cacheKey,
        ttl: cacheTtl,
      },
    );
  }

  export async function updateServer(
    serverId: string,
    input: Prisma.ServerUpdateInput,
    options: ServersServiceOptions = {},
  ) {
    const { cache } = options;

    const server = await prisma.server.update({
      where: { id: serverId },
      data: input,
    });

    if (cache) {
      CacheInvalidation.invalidateServer(cache, serverId).catch((error) => {
        logger.warn("Cache invalidation failed", { error, serverId });
      });
    }

    return server;
  }
}
