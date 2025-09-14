import config from "@albion-raid-manager/core/config";
import { logger } from "@albion-raid-manager/core/logger";
import { DiscordService, ServersService } from "@albion-raid-manager/core/services";
import {
  APIErrorType,
  APIResponse,
  APIServer,
  APIServerMember,
  GetServer,
  GetServerMembers,
  GetServers,
  SetupServer,
} from "@albion-raid-manager/types/api";
import { addServerSchema } from "@albion-raid-manager/types/schemas";
import { isAxiosError } from "axios";
import { Request, Response, Router } from "express";

import { auth } from "@/auth/middleware";
import { validateRequest } from "@/request";

import { serverRaidsRouter } from "./raids/router";

export const serverRouter: Router = Router();

serverRouter.use(auth);

serverRouter.use("/:serverId/raids", serverRaidsRouter);

serverRouter.get("/", async (req: Request, res: Response<APIResponse.Type<GetServers.Response>>) => {
  try {
    if (!req.session.user) {
      return res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED));
    }

    const [botServers, adminServers] = await Promise.all([
      ServersService.getServersForUser(req.session.user.id),
      DiscordService.servers.getServers({
        type: "user",
        token: req.session.accessToken,
        admin: true,
      }),
    ]);

    const servers = new Map<string, APIServer>();

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
        icon: server.icon ?? null,
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

      const discordServer = await DiscordService.servers.getServer(serverId);
      if (!discordServer) {
        return res.status(404).json(APIResponse.Error(APIErrorType.NOT_FOUND, "Server not found"));
      }

      const existingServer = await ServersService.getServerById(serverId);
      if (existingServer) {
        return res.json(APIResponse.Success({ server: existingServer }));
      }

      if (!req.session.user) {
        return res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED));
      }

      const server = await ServersService.createServerForUser(req.session.user.id, {
        id: serverId,
        name: discordServer.name,
        icon: discordServer.icon,
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

  const server = await ServersService.getServerById(serverId);

  if (!server) {
    return res.status(404).json(APIResponse.Error(APIErrorType.NOT_FOUND));
  }

  res.json(APIResponse.Success({ server }));
});

serverRouter.get(
  "/:serverId/members",
  async (req: Request, res: Response<APIResponse.Type<GetServerMembers.Response>>) => {
    try {
      const { serverId } = req.params;

      if (!req.session.user) {
        return res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED));
      }

      // Check if user has access to this server
      const server = await ServersService.getServerWithMember(serverId, req.session.user.id);
      if (!server) {
        return res.status(404).json(APIResponse.Error(APIErrorType.NOT_FOUND, "Server not found"));
      }

      const member = server.members[0];
      if (!member || (!member.adminPermission && !member.raidPermission && !member.compositionPermission)) {
        return res
          .status(403)
          .json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED, "You don't have permission to view server members"));
      }

      const discordMembers = await DiscordService.servers.getServerMembers(serverId, {
        type: "bot",
        token: config.discord.token,
      });
      const registeredMembers = await ServersService.getServerMembers(serverId);
      const registeredMembersMap = new Map(registeredMembers.map((member) => [member.userId, member]));

      const members: APIServerMember[] = discordMembers
        .map((discordMember) => {
          const registeredMember = registeredMembersMap.get(discordMember.user.id);
          const id = discordMember.user.id || registeredMember?.userId;
          if (!id) return null;

          return {
            id,
            username: discordMember.user.username || registeredMember?.user?.username || "",
            nickname: discordMember.nick || registeredMember?.nickname || null,
            avatar: discordMember.avatar || discordMember.user.avatar,
            roles: discordMember.roles,
            adminPermission: registeredMember?.adminPermission || false,
            raidPermission: registeredMember?.raidPermission || false,
            compositionPermission: registeredMember?.compositionPermission || false,
            registered: registeredMember?.albionPlayerId ? true : false,
            albionPlayerId: registeredMember?.albionPlayerId || null,
            albionGuildId: registeredMember?.albionGuildId || null,
            killFame: registeredMember?.killFame || 0,
            deathFame: registeredMember?.deathFame || 0,
            lastUpdated: registeredMember?.lastUpdated || null,
          };
        })
        .filter((member) => member !== null);

      res.json(APIResponse.Success({ members }));
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED));
      } else {
        logger.warn("Failed to get server members", error);
        res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR, "Failed to get server members"));
      }
    }
  },
);
