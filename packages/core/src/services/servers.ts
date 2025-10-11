import type { Cache } from "@albion-raid-manager/core/redis";

import { ServerMember } from "@albion-raid-manager/types";
import { Server } from "@albion-raid-manager/types/entities";
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
      logger.info("Ensuring server with data", { serverId, data });
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
      logger.info("Ensuring server with Discord data", { serverId });
      const discordServer = await DiscordService.getGuild(serverId, {
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

  export async function hasServersByIds(
    serverIds: string[],
    options: ServersServiceOptions = {},
  ): Promise<Map<string, boolean>> {
    const { cache, cacheTtl = DEFAULT_CACHE_TTL } = options;
    const cacheKey = CacheKeys.serversByIds(serverIds);

    return withCache(
      async () => {
        const servers = await prisma.server.findMany({
          where: { id: { in: serverIds } },
          select: { id: true, active: true },
        });

        const hasServers = new Map<string, boolean>();
        for (const serverId of serverIds) {
          hasServers.set(
            serverId,
            servers.some((server) => server.id === serverId && server.active),
          );
        }
        return hasServers;
      },
      {
        cache,
        key: cacheKey,
        ttl: cacheTtl,
      },
    );
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

  export async function getServersForUser(userId: string, options: ServersServiceOptions = {}): Promise<Server[]> {
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

  export async function getServerWithServerMember(
    serverId: string,
    userId: string,
    options: ServersServiceOptions = {},
  ) {
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

  export async function ensureServerMember(
    serverId: string,
    userId: string,
    data?: Omit<Prisma.ServerMemberCreateInput, "server" | "user">,
    options: ServersServiceOptions = {},
  ): Promise<ServerMember> {
    const { cache } = options;

    logger.info("Ensuring server member", { serverId, userId });
    let serverMember = await getServerMember(serverId, userId);

    if (!serverMember) {
      const user = await UsersService.ensureUser(userId, {});

      if (!user) {
        logger.warn("Failed to ensure user", { serverId, userId });
        throw new ServiceError(
          ServiceErrorCode.CREATE_FAILED,
          `Failed to ensure server member ${userId} in server ${serverId} because user ${userId} does not exist after attempting to create it.`,
        );
      }

      serverMember = await prisma.serverMember.upsert({
        where: { serverId_userId: { serverId, userId } },
        update: {
          nickname: data?.nickname,
          albionPlayerId: data?.albionPlayerId,
          albionGuildId: data?.albionGuildId,
          killFame: data?.killFame,
          deathFame: data?.deathFame,
          lastUpdated: data?.lastUpdated,
        },
        create: {
          serverId,
          userId,
          nickname: data?.nickname,
          albionPlayerId: data?.albionPlayerId,
          albionGuildId: data?.albionGuildId,
          killFame: data?.killFame,
          deathFame: data?.deathFame,
          lastUpdated: data?.lastUpdated,
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

    logger.info("Server settings updated", {
      serverId,
      updates: input,
    });

    return server;
  }

  export async function ensureServerWithAccessToken(
    serverId: string,
    accessToken: string,
    options: ServersServiceOptions = {},
  ) {
    logger.debug("Ensuring server with access token", { serverId, accessToken });
    const discordGuild = await DiscordService.getGuild(serverId, {
      type: "user",
      token: accessToken,
    });

    if (!discordGuild) {
      logger.warn("Failed to get Discord guild", { serverId, accessToken });
      throw new Error("Failed to get Discord guild");
    }

    return await ensureServer(
      serverId,
      {
        name: discordGuild.name,
        icon: discordGuild.icon,
      },
      options,
    );
  }

  export async function getDiscordGuildMembers(serverId: string, _options: ServersServiceOptions = {}) {
    try {
      return await DiscordService.getGuildMembers(serverId, {
        type: "bot",
        token: config.discord.token,
      });
    } catch (error) {
      logger.error("Failed to get Discord guild members:", { error, serverId });
      throw error;
    }
  }

  export async function getDiscordGuildChannels(serverId: string, _options: ServersServiceOptions = {}) {
    try {
      return await DiscordService.getGuildChannels(serverId, {
        type: "bot",
        token: config.discord.token,
      });
    } catch (error) {
      logger.error("Failed to get Discord guild channels:", { error, serverId });
      throw error;
    }
  }

  export async function getDiscordGuildRoles(serverId: string, _options: ServersServiceOptions = {}) {
    try {
      return await DiscordService.getGuildRoles(serverId, {
        type: "bot",
        token: config.discord.token,
      });
    } catch (error) {
      logger.error("Failed to get Discord guild roles:", { error, serverId });
      throw error;
    }
  }
}
