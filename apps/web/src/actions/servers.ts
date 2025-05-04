"use server";

import { ActionResponse } from "@/actions";
import { discordService, type Server } from "@albion-raid-manager/discord";
import logger from "@albion-raid-manager/logger";

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
