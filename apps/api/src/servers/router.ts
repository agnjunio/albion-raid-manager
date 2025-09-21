import config from "@albion-raid-manager/core/config";
import { logger } from "@albion-raid-manager/core/logger";
import { sleep } from "@albion-raid-manager/core/scheduler";
import { DiscordService, ServersService } from "@albion-raid-manager/core/services";
import {
  APIErrorType,
  APIResponse,
  APIServerMember,
  GetServer,
  GetServerMembers,
  GetServers,
  GetServerSettings,
  VerifyServer,
} from "@albion-raid-manager/types/api";
import { createServerSettings, fromDiscordGuild, Server } from "@albion-raid-manager/types/entities";
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

    const servers = await ServersService.getServersForUser(req.session.user.id, {
      accessToken: req.session.accessToken,
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
      logger.warn("Failed to get servers", { error });
      res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR));
    }
  }
});

serverRouter.post(
  "/",
  validateRequest({ body: addServerSchema }),
  async (req: Request<{}, void, VerifyServer.Body>, res: Response<APIResponse.Type<VerifyServer.Response>>) => {
    if (!req.session.user) {
      return res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED));
    }

    try {
      const { serverId } = req.body;

      let tries = 0;
      let verifiedServer: Server | null = null;

      while (tries < 3) {
        await sleep(3000);
        tries++;

        try {
          const discordServer = await DiscordService.servers.getServer(serverId, {
            type: "bot",
            token: req.session.accessToken,
          });
          verifiedServer = fromDiscordGuild(discordServer);
        } catch {
          continue;
        }

        if (verifiedServer) {
          break;
        }
      }

      if (!verifiedServer) {
        return res
          .status(404)
          .json(
            APIResponse.Error(APIErrorType.SERVER_VERIFICATION_FAILED, "Failed to verify server. Please try again."),
          );
      }

      await ServersService.ensureServerMember(verifiedServer.id, req.session.user.id);

      res.json(APIResponse.Success({ server: verifiedServer }));
    } catch (error) {
      logger.warn("Failed to add server", { error });
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
      const server = await ServersService.getServerWithServerMember(serverId, req.session.user.id);
      if (!server) {
        return res.status(404).json(APIResponse.Error(APIErrorType.NOT_FOUND, "Server not found"));
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
        logger.warn("Failed to get server members", { error });
        res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR, "Failed to get server members"));
      }
    }
  },
);

serverRouter.get(
  "/:serverId/settings",
  async (req: Request<GetServerSettings.Params>, res: Response<APIResponse.Type<GetServerSettings.Response>>) => {
    try {
      const { serverId } = req.params;

      if (!req.session.user) {
        return res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED));
      }

      const server = await ServersService.getServerById(serverId);
      if (!server) {
        return res.status(404).json(APIResponse.Error(APIErrorType.NOT_FOUND, "Server not found"));
      }

      const settings = createServerSettings(server);

      res.json(APIResponse.Success({ settings }));
    } catch (error) {
      logger.warn("Failed to get server settings", { error });
      res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR, "Failed to get server settings"));
    }
  },
);

serverRouter.put("/:serverId/settings", async (req: Request, res: Response) => {
  try {
    const { serverId } = req.params;

    if (!req.session.user) {
      return res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED));
    }

    const server = await ServersService.getServerById(serverId);
    if (!server) {
      return res.status(404).json(APIResponse.Error(APIErrorType.NOT_FOUND, "Server not found"));
    }

    const {
      name,
      icon,
      adminRoles,
      raidRoles,
      compositionRoles,
      raidAnnouncementChannelId,
      serverGuildId,
      memberRoleId,
      friendRoleId,
      auditChannelId,
      language,
    } = req.body;

    await ServersService.updateServer(serverId, {
      name,
      icon,
      adminRoles,
      raidRoles,
      compositionRoles,
      raidAnnouncementChannelId,
      serverGuildId,
      memberRoleId,
      friendRoleId,
      auditChannelId,
      language,
    });

    res.json(APIResponse.Success({ message: "Server settings updated successfully" }));
  } catch (error) {
    logger.warn("Failed to update server settings", { error });
    res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR, "Failed to update server settings"));
  }
});
