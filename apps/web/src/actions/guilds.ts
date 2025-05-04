"use server";

import { ActionResponse } from "@/actions";
import { prisma } from "@albion-raid-manager/database";
import { Guild } from "@albion-raid-manager/database/models";
import { getServer, type Server } from "@albion-raid-manager/discord";
import logger from "@albion-raid-manager/logger";

export type CreateGuildSuccessResponse = {
  guild: Guild;
};

export async function createGuild(server: Server, userId: string) {
  try {
    const existingGuild = await prisma.guild.findUnique({
      where: {
        discordId: server.id,
      },
    });

    if (existingGuild) {
      return ActionResponse.Failure("GUILD_ALREADY_EXISTS");
    }

    const guild = await prisma.guild.create({
      data: {
        discordId: server.id,
        name: server.name,
        icon: server.icon,
        members: {
          create: {
            userId,
            role: "LEADER",
            default: true,
          },
        },
      },
    });

    return ActionResponse.Success<CreateGuildSuccessResponse>({
      guild,
    });
  } catch (error) {
    logger.error(`Failed to create guild for server ${server.id}`, error);
    return ActionResponse.Failure("CREATE_GUILD_FAILED");
  }
}

export async function verifyServer(server: Server) {
  try {
    const verifiedServer = await getServer(server.id);
    if (!verifiedServer) throw new Error("Failed to find server.");
    return ActionResponse.Success(verifiedServer);
  } catch (error) {
    logger.error(`Failed to verify server ${server.name}`, { error, server });
    return ActionResponse.Failure("SERVER_VERIFICATION_FAILED");
  }
}
