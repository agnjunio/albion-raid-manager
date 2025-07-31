import { logger } from "@albion-raid-manager/logger";

import { prisma } from "./client";

/**
 * Ensures a Discord user exists in the database.
 * Creates the user if they don't exist, or updates their username if they do.
 *
 * @param discordUserId - The Discord user ID
 * @param username - The username to set/update
 * @param options - Optional parameters
 * @param options.nickname - The user's nickname/global name
 * @param options.avatar - The user's avatar URL
 * @returns The user record
 */
export async function ensureUser(
  discordUserId: string,
  username: string,
  { nickname, avatar }: { nickname?: string; avatar?: string | null } = {},
) {
  try {
    const user = await prisma.user.upsert({
      where: { id: discordUserId },
      update: {
        username, // Update with provided username
        ...(nickname !== undefined && { nickname }),
        ...(avatar !== undefined && { avatar }),
      },
      create: {
        id: discordUserId,
        username,
        ...(nickname !== undefined && { nickname }),
        ...(avatar !== undefined && { avatar }),
      },
    });

    logger.debug(`Ensured user exists: ${username} (${discordUserId})`);
    return user;
  } catch (error) {
    logger.error("Error ensuring user exists:", error);
    throw error;
  }
}

/**
 * Ensures a Discord server exists in the database.
 * Creates the server if it doesn't exist.
 *
 * @param discordServerId - The Discord server ID
 * @param serverName - Optional server name (defaults to "Unknown Server")
 * @returns The server record
 */
export async function ensureServer(discordServerId: string, { serverName = "Unknown Server" } = {}) {
  try {
    const server = await prisma.server.upsert({
      where: { discordId: discordServerId },
      update: {
        // Only update name if provided and different from "Unknown Server"
        ...(serverName !== "Unknown Server" && { name: serverName }),
      },
      create: {
        discordId: discordServerId,
        name: serverName,
      },
    });

    logger.debug(`Ensured server exists: ${server.name} (${discordServerId})`);
    return server;
  } catch (error) {
    logger.error("Error ensuring server exists:", error);
    throw error;
  }
}

/**
 * Ensures a server member exists in the database.
 * Creates the server member if they don't exist.
 *
 * @param serverId - The server ID (from ensureServer)
 * @param userId - The user ID (from ensureUser)
 * @returns The server member record
 */
export async function ensureServerMember(serverId: string, userId: string) {
  try {
    const serverMember = await prisma.serverMember.upsert({
      where: {
        serverId_userId: {
          serverId,
          userId,
        },
      },
      update: {
        // No updates needed for existing members
      },
      create: {
        serverId,
        userId,
      },
    });

    logger.debug(`Ensured server member exists: ${userId} in server ${serverId}`);
    return serverMember;
  } catch (error) {
    logger.error("Error ensuring server member exists:", error);
    throw error;
  }
}

/**
 * Convenience function to ensure both user and server exist, then create/update server member.
 * Uses a transaction to ensure all operations succeed or fail together.
 *
 * @param discordUserId - The Discord user ID
 * @param username - The username to set/update
 * @param discordServerId - The Discord server ID
 * @param options - Optional parameters
 * @param options.serverName - Server name (defaults to "Unknown Server")
 * @param options.nickname - The user's nickname/global name
 * @param options.avatar - The user's avatar URL
 * @returns Object containing user, server, and server member records
 */
export async function ensureUserAndServer(
  discordUserId: string,
  username: string,
  discordServerId: string,
  {
    serverName = "Unknown Server",
    nickname,
    avatar,
  }: { serverName?: string; nickname?: string; avatar?: string | null } = {},
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Ensure user exists
      const user = await tx.user.upsert({
        where: { id: discordUserId },
        update: {
          username,
          ...(nickname !== undefined && { nickname }),
          ...(avatar !== undefined && { avatar }),
        },
        create: {
          id: discordUserId,
          username,
          ...(nickname !== undefined && { nickname }),
          ...(avatar !== undefined && { avatar }),
        },
      });

      // Ensure server exists
      const server = await tx.server.upsert({
        where: { discordId: discordServerId },
        update: {
          // Only update name if provided and different from "Unknown Server"
          ...(serverName !== "Unknown Server" && { name: serverName }),
        },
        create: {
          discordId: discordServerId,
          name: serverName,
        },
      });

      // Ensure server member exists
      const serverMember = await tx.serverMember.upsert({
        where: {
          serverId_userId: {
            serverId: server.id,
            userId: user.id,
          },
        },
        update: {
          // No updates needed for existing members
        },
        create: {
          serverId: server.id,
          userId: user.id,
        },
      });

      return { user, server, serverMember };
    });

    logger.debug(`Ensured user and server exist: ${username} (${discordUserId}) in server ${discordServerId}`);
    return result;
  } catch (error) {
    logger.error("Error ensuring user and server exist:", error);
    throw error;
  }
}
