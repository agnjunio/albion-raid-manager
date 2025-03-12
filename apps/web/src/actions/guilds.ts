import { ActionResponse } from "@/actions/action-response";
import { prisma } from "@albion-raid-manager/database";
import type { Server } from "@albion-raid-manager/discord";
import logger from "@albion-raid-manager/logger";

export async function createGuild(server: Server) {
  try {
    const existingGuild = await prisma.guild.findUnique({
      where: {
        discordId: server.id,
      },
    });

    if (existingGuild) {
      return ActionResponse.Failure("Guild already exists");
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create a new guild if it doesn't exist
    return ActionResponse.Success({
      serverId: server.id,
    });
  } catch (error) {
    logger.error(`Failed to create guild for server ${server.id}`, error);
    return ActionResponse.Failure("Failed to create guild. Please try again later.");
  }
}
