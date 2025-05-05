"use server";

import { getMilliseconds } from "@albion-raid-manager/common/utils/time";
import { prisma } from "@albion-raid-manager/database";
import { APIUser, discordService } from "@albion-raid-manager/discord";
import logger from "@albion-raid-manager/logger";
import { ActionResponse } from ".";

export async function updateUser(userId: string) {
  try {
    const user = await discordService.users.getUser(userId);

    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        username: user.username ?? "Usuário Desconhecido",
        avatar: user.avatar,
      },
      update: {
        username: user.username ?? "Usuário Desconhecido",
        avatar: user.avatar,
      },
    });
  } catch (error) {
    logger.warn(`Failed to update information for ${userId}`, { error });
    return ActionResponse.Failure("UPSERT_USER_FAILED");
  }
}

export async function syncUsers(users: APIUser[]) {
  try {
    await prisma.$transaction(
      async (tx) => {
        const currentUsers = await tx.user.findMany({
          where: {
            id: { in: users.map((user) => user.id) },
          },
        });

        await tx.user.createMany({
          data: users
            .filter((user) => !currentUsers.some((currentUser) => user.id === currentUser.id))
            .map((user) => ({
              id: user.id,
              username: user.username,
              avatar: user.avatar,
            })),
          skipDuplicates: true,
        });

        await Promise.all(
          users
            .filter((user) => currentUsers.some((currentUser) => user.id === currentUser.id))
            .map((user) =>
              tx.user.update({
                where: { id: user.id },
                data: { username: user.username, avatar: user.avatar },
              }),
            ),
        );
      },
      {
        timeout: getMilliseconds(10, "seconds"),
      },
    );
    return ActionResponse.Success("SYNC_USERS_SUCCESS");
  } catch (error) {
    logger.error("Failed to sync users", { error });
    return ActionResponse.Failure("SYNC_USERS_FAILED");
  }
}
