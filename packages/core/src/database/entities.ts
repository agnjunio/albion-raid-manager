import { logger } from "../logger";

import { prisma } from "./client";
import { Server, User } from "./generated/prisma";

/**
 * Ensures a Discord user exists in the database.
 * Creates the user if they don't exist, or updates their username if they do.
 *
 * @param user - The user to ensure
 * @returns The user record
 */
export async function ensureUser(user: Pick<User, "id" | "username" | "nickname" | "avatar">) {
  try {
    const updatedUser = await prisma.user.upsert({
      where: { id: user.id },
      update: {
        username: user.username,
        nickname: user.nickname ?? undefined,
        avatar: user.avatar ?? undefined,
      },
      create: {
        id: user.id,
        username: user.username,
        nickname: user.nickname ?? undefined,
        avatar: user.avatar ?? undefined,
      },
    });

    logger.debug(`Ensured user exists: ${user.username} (${user.id})`);
    return updatedUser;
  } catch (error) {
    logger.error("Error ensuring user exists:", { error });
    throw error;
  }
}

/**
 * Convenience function to ensure both user and server exist, then create/update server member.
 * Uses a transaction to ensure all operations succeed or fail together.
 *
 * @param user - The user to ensure
 * @param server - The server to ensure
 * @returns Object containing user, server, and server member records
 */
export async function ensureUserAndServer({
  user,
  server,
}: {
  user: Pick<User, "id" | "username" | "nickname" | "avatar">;
  server: Pick<Server, "id" | "name" | "icon">;
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Ensure user exists
      const updatedUser = await tx.user.upsert({
        where: { id: user.id },
        update: {
          username: user.username,
          nickname: user.nickname ?? undefined,
          avatar: user.avatar ?? undefined,
        },
        create: {
          id: user.id,
          username: user.username,
          nickname: user.nickname ?? undefined,
          avatar: user.avatar ?? undefined,
        },
      });

      // Ensure server exists
      const updatedServer = await tx.server.upsert({
        where: { id: server.id },
        update: {
          name: server.name,
          icon: server.icon ?? undefined,
        },
        create: {
          id: server.id,
          name: server.name,
          icon: server.icon ?? undefined,
        },
      });

      // Ensure server member exists
      const serverMember = await tx.serverMember.upsert({
        where: {
          serverId_userId: {
            serverId: updatedServer.id,
            userId: updatedUser.id,
          },
        },
        update: {
          // No updates needed for existing members
        },
        create: {
          serverId: updatedServer.id,
          userId: updatedUser.id,
        },
      });

      return { user, server, serverMember };
    });

    logger.debug(`Ensured user and server exist: ${user.username} (${user.id}) in server ${server.id}`);
    return result;
  } catch (error) {
    logger.error("Error ensuring user and server exist:", { error });
    throw error;
  }
}
