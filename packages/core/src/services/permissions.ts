import type { Cache } from "@albion-raid-manager/core/redis";

import { CacheKeys, withCache } from "@albion-raid-manager/core/cache/utils";
import config from "@albion-raid-manager/core/config";
import { prisma } from "@albion-raid-manager/core/database";
import { logger } from "@albion-raid-manager/core/logger";

import { DiscordService } from "./discord";

export interface PermissionsServiceOptions {
  cache?: Cache;
  cacheTtl?: number;
}

export namespace PermissionsService {
  const DEFAULT_CACHE_TTL = 300; // 5 minutes cache for permission checks

  /**
   * Checks if a user has the specified role type in a server
   * @param serverId - The Discord server ID
   * @param userId - The Discord user ID
   * @param type - The role type to check ("admin" or "caller")
   * @param options - Service options including cache
   * @returns Promise<boolean> - True if user has the specified role type
   */
  export async function hasRole(
    serverId: string,
    userId: string,
    type: "admin" | "caller",
    options: PermissionsServiceOptions = {},
  ): Promise<boolean> {
    const { cache, cacheTtl = DEFAULT_CACHE_TTL } = options;
    const cacheKey = CacheKeys.permissions(serverId, userId, type);

    return withCache(
      async () => {
        // Check if the user is a discord server administrator
        const hasDiscordAdmin = await DiscordService.hasAdministratorPermission(serverId, userId, {
          type: "bot",
          token: config.discord.token,
        });

        if (hasDiscordAdmin) {
          logger.debug("User has Discord Administrator permission", { serverId, userId });
          return true;
        }

        // Get server role configuration based on type
        const server = await prisma.server.findUnique({
          where: { id: serverId },
          select: {
            adminRoles: type === "admin",
            callerRoles: type === "caller",
          },
        });

        const roles = type === "admin" ? server?.adminRoles : server?.callerRoles;
        if (!server || !roles || roles.length === 0) {
          logger.debug(`No ${type} roles configured for server`, { serverId });
          return false;
        }

        // Get user's Discord member data from the server
        const member = await DiscordService.getGuildMember(serverId, userId, {
          type: "bot",
          token: config.discord.token,
        });

        if (!member || !member.roles) {
          logger.debug("Could not fetch user roles from Discord", { serverId, userId });
          return false;
        }

        // Check if user has any of the configured roles
        const hasRole = member.roles.some((roleId) => roles?.includes(roleId));

        logger.debug(`${type} role check completed`, {
          serverId,
          userId,
          hasRole,
          userRoles: member.roles,
          configuredRoles: roles,
        });

        return hasRole;
      },
      {
        cache,
        key: cacheKey,
        ttl: cacheTtl,
      },
    );
  }
}
