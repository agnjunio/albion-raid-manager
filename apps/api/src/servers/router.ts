import { APIErrorType, APIResponse } from "@albion-raid-manager/core/types/api";
import { AddServer, GetServerResponse, GetServersResponse } from "@albion-raid-manager/core/types/api/servers";
import { prisma } from "@albion-raid-manager/database";
import { discordService, isAxiosError } from "@albion-raid-manager/discord";
import { logger } from "@albion-raid-manager/logger";
import { Request, Response, Router } from "express";

import { auth } from "@/auth/middleware";
import { validateRequest } from "@/request";

import { addServerSchema, getServerSchema } from "./schemas";

export const serverRouter: Router = Router();

serverRouter.use(auth);

serverRouter.get("/", async (req: Request, res: Response<APIResponse.Type<GetServersResponse>>) => {
  try {
    const servers = await discordService.servers.getServers({
      admin: true,
    });
    if (!servers) {
      return res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR, "Failed to get servers"));
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
  validateRequest({ body: addServerSchema }),
  async (req: Request<{}, void, AddServer.Body>, res: Response<APIResponse.Type<AddServer.Response>>) => {
    try {
      const { serverId } = req.body;

      const server = await discordService.servers.getServer(serverId);
      if (!server) {
        return res.status(404).json(APIResponse.Error(APIErrorType.NOT_FOUND, "Server not found"));
      }

      const existingGuild = await prisma.guild.findUnique({
        where: {
          discordId: serverId,
        },
      });
      if (existingGuild) {
        // TODO: If user is a server admin, join the guild automatically instead
        return res.status(400).json(APIResponse.Error(APIErrorType.GUILD_ALREADY_EXISTS, "Guild already exists"));
      }

      if (!req.session.user) {
        return res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED));
      }

      const guild = await prisma.guild.create({
        data: {
          discordId: serverId,
          name: server.name,
          icon: server.icon,
          members: {
            create: {
              userId: req.session.user.id,
              adminPermission: true,
            },
          },
        },
      });

      res.json(APIResponse.Success({ guild }));
    } catch (error) {
      logger.warn("Failed to add server", error);
      res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR, "Failed to add server"));
    }
  },
);

serverRouter.get(
  "/:serverId",
  validateRequest({ params: getServerSchema }),
  async (req: Request, res: Response<APIResponse.Type<GetServerResponse>>) => {
    try {
      const { serverId } = req.params;

      if (!serverId) {
        return res.status(400).json(APIResponse.Error(APIErrorType.BAD_REQUEST));
      }

      const server = await discordService.servers.getServer(serverId, {
        type: "user",
        token: req.session.accessToken,
      });

      if (!server) {
        return res.status(404).json(APIResponse.Error(APIErrorType.NOT_FOUND, "Server not found"));
      }

      res.json(APIResponse.Success({ server }));
    } catch (error) {
      logger.warn("Get server error", error);
      res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR, "Failed to get server"));
    }
  },
);
