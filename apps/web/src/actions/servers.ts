"use server";

import { ActionResponse } from "@/actions";
import { prisma } from "@albion-raid-manager/database";
import { discordService, type Server } from "@albion-raid-manager/discord";
import logger from "@albion-raid-manager/logger";

export async function getGuildServer(guildId: string) {
  try {
    const guild = await prisma.guild.findUnique({
      where: {
        id: guildId,
      },
    });
    if (!guild) throw new Error("Guild not found.");

    const server = await discordService.guilds.getGuild(guild.discordId);
    if (!server) throw new Error("Failed to find server.");

    return ActionResponse.Success(server);
  } catch (error) {
    logger.error(`Failed to get server ${guildId}`, { error });
    return ActionResponse.Failure("GET_SERVER_FAILED");
  }
}

export async function verifyServer(server: Server) {
  try {
    const verifiedServer = await discordService.guilds.getGuild(server.id);
    if (!verifiedServer) throw new Error("Failed to find server.");
    return ActionResponse.Success(verifiedServer);
  } catch (error) {
    logger.error(`Failed to verify server ${server.name}`, { error, server });
    return ActionResponse.Failure("SERVER_VERIFICATION_FAILED");
  }
}
