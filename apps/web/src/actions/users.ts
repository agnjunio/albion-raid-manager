import { prisma } from "@albion-raid-manager/database";
import { discordService } from "@albion-raid-manager/discord";
import logger from "@albion-raid-manager/logger";
import { ActionResponse } from ".";

export async function upsertUser(userId: string) {
  try {
    const user = await discordService.users.getUser(userId);

    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        username: user.name || "Usuário Desconhecido",
        avatar: user.image,
      },
      update: {
        username: user.name || "Usuário Desconhecido",
        avatar: user.image,
      },
    });
  } catch (error) {
    logger.warn(`Failed to update information for ${userId}`, { error });
    return ActionResponse.Failure("UPSERT_USER_FAILED");
  }
}
