import { User } from "@albion-raid-manager/types";

import { CacheInvalidation } from "@albion-raid-manager/core/cache/redis";
import { CacheKeys, withCache } from "@albion-raid-manager/core/cache/utils";
import config from "@albion-raid-manager/core/config";
import { prisma } from "@albion-raid-manager/core/database";
import { logger } from "@albion-raid-manager/core/logger";
import { Cache } from "@albion-raid-manager/core/redis";
import { APIUser, DiscordService } from "@albion-raid-manager/core/services/discord";

export interface UsersServiceOptions {
  cache?: Cache;
  cacheTtl?: number;
}

export namespace UsersService {
  const DEFAULT_CACHE_TTL = 600;

  export async function ensureUser(userId: string, data: Partial<User>, options: UsersServiceOptions = {}) {
    const { cache } = options;

    let user = await getUser(userId);

    // If the user doesn't exist and data is provided, create a user record
    if (!user && data) {
      user = await prisma.user.create({
        data: {
          id: userId,
          username: data.username ?? `User-${userId.slice(-4)}`,
          nickname: data.nickname ?? `User-${userId.slice(-4)}`,
          avatar: data.avatar ?? null,
        },
      });
    }

    // If the user doesn't exist and data is not provided, try to fetch data from Discord
    if (!user && !data) {
      let discordUser: APIUser = await DiscordService.users.getUser(userId, {
        type: "bot",
        token: config.discord.token,
      });
      if (!discordUser) {
        // If the user doesn't exist in Discord, create a minimal user record to satisfy foreign key constraints
        discordUser = {
          id: userId,
          username: `User-${userId.slice(-4)}`,
          global_name: `User-${userId.slice(-4)}`,
          avatar: null,
          discriminator: "0000",
        };
      }

      user = await prisma.user.create({
        data: {
          id: userId,
          username: discordUser.username,
          nickname: discordUser.username,
          avatar: discordUser.avatar,
        },
      });
    }

    if (cache) {
      CacheInvalidation.invalidateUser(cache, userId).catch((error) => {
        logger.warn("Cache invalidation failed", { error, userId });
      });
    }

    return user;
  }

  export async function getUser(userId: string, options: UsersServiceOptions = {}) {
    const { cache, cacheTtl = DEFAULT_CACHE_TTL } = options;
    const cacheKey = CacheKeys.user(userId);

    return withCache(
      async () => {
        return await prisma.user.findUnique({
          where: { id: userId },
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
