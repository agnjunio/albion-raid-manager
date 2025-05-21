import { APIErrorType, APIResponse } from "@albion-raid-manager/core/types/api";
import {
  AddServerRequestBody,
  AddServerResponse,
  GetServersResponse,
} from "@albion-raid-manager/core/types/api/servers";
import { prisma } from "@albion-raid-manager/database";
import { discordService, isAxiosError } from "@albion-raid-manager/discord";
import { logger } from "@albion-raid-manager/logger";
import { Request, Response, Router } from "express";

import { requireAuth } from "@/auth/middleware";
import { validateRequest } from "@/request";

import { addServerSchema } from "./schemas";

export const serverRouter: Router = Router();

serverRouter.use(requireAuth);

serverRouter.get("/", async (req: Request, res: Response<APIResponse.Type<GetServersResponse>>) => {
  try {
    const servers = await discordService.servers.getUserGuilds(req.session.accessToken ?? "", {
      admin: true,
    });
    if (!servers) {
      res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR, "Failed to get servers"));
      return;
    }

    res.json(APIResponse.Success({ servers }));
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED));
    } else {
      logger.warn("Failed to get servers", error);
      res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR));
    }
  }
});

serverRouter.post(
  "/",
  validateRequest(addServerSchema),
  async (req: Request<{}, {}, AddServerRequestBody>, res: Response<APIResponse.Type<AddServerResponse>>) => {
    try {
      const { serverId } = req.body;

      const server = await discordService.servers.getGuild(serverId, {
        authorization: `Bearer ${req.session.accessToken}`,
      });

      const existingGuild = await prisma.guild.findUnique({
        where: {
          id: serverId,
        },
      });
      if (existingGuild) {
        // TODO: If user is a server admin, join the guild automatically instead
        res.status(400).json(APIResponse.Error(APIErrorType.GUILD_ALREADY_EXISTS, "Guild already exists"));
        return;
      }

      if (!req.session.user) {
        res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED));
        return;
      }

      const guild = await prisma.guild.create({
        data: {
          discordId: serverId,
          name: existingGuild?.name,
          icon: existingGuild?.icon,
          ownerId: req.session.user.id,
        },
      });
    } catch (error) {
      logger.warn("Failed to add server", error);
      res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR, "Failed to add server"));
    }
  },
);
