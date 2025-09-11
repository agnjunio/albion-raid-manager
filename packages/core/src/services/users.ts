import { Cache } from "@albion-raid-manager/redis";
import { ServiceError, ServiceErrorCode } from "@albion-raid-manager/types/services";

import config from "@albion-raid-manager/core/config";
import { prisma } from "@albion-raid-manager/core/database";

import { CacheKeys, withCache } from "../cache/redis";

import { DiscordService } from "./discord";

export interface UsersServiceOptions {
  cache?: Cache;
  cacheTtl?: number;
}

export namespace UsersService {
  const DEFAULT_CACHE_TTL = 600;

  export async function getUser(userId: string, options: UsersServiceOptions = {}) {
    const { cache, cacheTtl = DEFAULT_CACHE_TTL } = options;
    const cacheKey = CacheKeys.user(userId);

    return withCache(
      async () => {
        let user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          const discordUser = await DiscordService.users.getUser(userId, { type: "bot", token: config.discord.token });
          if (!discordUser) {
            throw new ServiceError(ServiceErrorCode.NOT_FOUND, "User not found");
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

        return user;
      },
      {
        cache,
        key: cacheKey,
        ttl: cacheTtl,
      },
    );
  }
}
