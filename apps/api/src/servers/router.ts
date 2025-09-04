import { ServersService } from "@albion-raid-manager/core/services";
import { APIErrorType, APIResponse } from "@albion-raid-manager/core/types/api";
import { DiscordServer, GetServer, GetServers, SetupServer } from "@albion-raid-manager/core/types/api/servers";
import { prisma } from "@albion-raid-manager/database";
import { discordService, isAxiosError } from "@albion-raid-manager/discord";
import { logger } from "@albion-raid-manager/logger";
import { Request, Response, Router } from "express";

import { auth } from "@/auth/middleware";
import { validateRequest } from "@/request";

import { addServerSchema } from "./schemas";

export const serverRouter: Router = Router();

serverRouter.use(auth);

serverRouter.get("/", async (req: Request, res: Response<APIResponse.Type<GetServers.Response>>) => {
  try {
    if (!req.session.user) {
      return res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED));
    }

    const [botServers, adminServers] = await Promise.all([
      ServersService.getServersForUser(req.session.user.id),
      discordService.servers.getServers({
        type: "user",
        token: req.session.accessToken,
        admin: true,
      }),
    ]);

    const servers = new Map<string, DiscordServer>();

    for (const server of adminServers) {
      servers.set(server.id, {
        ...server,
        admin: true,
        bot: botServers.some((botServer) => botServer.id === server.id),
      });
    }

    for (const server of botServers) {
      if (servers.has(server.id)) continue;
      servers.set(server.id, {
        ...server,
        admin: false,
        bot: true,
      });
    }

    if (!adminServers) {
      return res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR, "Failed to get servers"));
    }

    res.json(APIResponse.Success({ servers: Array.from(servers.values()) }));
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
  async (req: Request<{}, void, SetupServer.Body>, res: Response<APIResponse.Type<SetupServer.Response>>) => {
    try {
      const { serverId } = req.body;

      const discordServer = await discordService.servers.getServer(serverId);
      if (!discordServer) {
        return res.status(404).json(APIResponse.Error(APIErrorType.NOT_FOUND, "Server not found"));
      }

      const existingServer = await prisma.server.findUnique({
        where: {
          id: serverId,
        },
      });
      if (existingServer) {
        // TODO: If user is a server admin, join the guild automatically instead
        return res.json(APIResponse.Success({ server: existingServer }));
      }

      if (!req.session.user) {
        return res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED));
      }

      const server = await prisma.server.create({
        data: {
          id: serverId,
          name: discordServer.name,
          icon: discordServer.icon,
          members: {
            create: {
              userId: req.session.user.id,
              adminPermission: true,
            },
          },
        },
      });

      res.json(APIResponse.Success({ server }));
    } catch (error) {
      logger.warn("Failed to add server", error);
      res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR, "Failed to add server"));
    }
  },
);

serverRouter.get("/:serverId", async (req: Request, res: Response<APIResponse.Type<GetServer.Response>>) => {
  const { serverId } = req.params;

  const server = await prisma.server.findUnique({
    where: { id: serverId },
  });

  if (!server) {
    return res.status(404).json(APIResponse.Error(APIErrorType.NOT_FOUND));
  }

  res.json(APIResponse.Success({ server }));
});
