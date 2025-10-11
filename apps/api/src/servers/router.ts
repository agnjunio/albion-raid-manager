import { logger } from "@albion-raid-manager/core/logger";
import { sleep } from "@albion-raid-manager/core/scheduler";
import { DiscordService, ServersService } from "@albion-raid-manager/core/services";
import {
  APIErrorType,
  APIResponse,
  APIServerMember,
  GetServer,
  GetServerChannels,
  GetServerMembers,
  GetServerRoles,
  GetServers,
  GetServerSettings,
  VerifyServer,
} from "@albion-raid-manager/types/api";
import {
  Channel,
  createServerSettings,
  fromDiscordChannels,
  fromDiscordGuild,
  fromDiscordRoles,
  Role,
  Server,
} from "@albion-raid-manager/types/entities";
import { addServerSchema } from "@albion-raid-manager/types/schemas";
import { isAxiosError } from "axios";
import { APIGuild } from "discord-api-types/v10";
import { Request, Response, Router } from "express";

import { hasAdminPermission, isAuthenticated, isServerMember } from "@/middleware";
import { validateRequest } from "@/request";

import { serverRaidsRouter } from "./raids/router";

export const serverRouter: Router = Router();

serverRouter.use(isAuthenticated);

serverRouter.use("/:serverId/raids", serverRaidsRouter);

serverRouter.get("/", async (req: Request, res: Response<APIResponse.Type<GetServers.Response>>) => {
  try {
    if (!req.session.user) {
      return res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED));
    }

    let discordServers: APIGuild[] = [];
    if (req.session.accessToken) {
      try {
        discordServers = await DiscordService.getGuilds({
          type: "user",
          token: req.session.accessToken,
        });
      } catch (error) {
        logger.warn("Failed to get servers from Discord", { error });
      }
    }
    const servers = new Map<string, Server>();
    const isBotInstalledMap = await ServersService.hasServersByIds(
      discordServers.map((server) => server.id),
      {
        cache: req.context.cache,
      },
    );

    for (const server of discordServers) {
      servers.set(server.id, {
        ...fromDiscordGuild(server),
        bot: !!isBotInstalledMap.get(server.id),
      });
    }

    const filteredServers = Array.from(servers.values()).filter((server) => {
      return server.admin || server.owner || server.bot;
    });

    res.json(APIResponse.Success({ servers: filteredServers }));
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
    if (!req.session.user || !req.session.accessToken) {
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
          verifiedServer = await ServersService.ensureServerWithAccessToken(serverId, req.session.accessToken);
        } catch (error) {
          logger.warn(`Failed to ensure server with access token try: ${tries}`, {
            serverId,
            accessToken: req.session.accessToken,
            error,
          });
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

      await ServersService.ensureServerMember(verifiedServer.id, req.session.user.id, undefined, {
        cache: req.context.cache,
      });

      res.json(APIResponse.Success({ server: verifiedServer }));
    } catch (error) {
      logger.warn("Failed to add server", { error });
      res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR, "Failed to add server"));
    }
  },
);

serverRouter.get(
  "/:serverId",
  isServerMember,
  async (req: Request, res: Response<APIResponse.Type<GetServer.Response>>) => {
    try {
      const server = req.context.server;
      if (!server) {
        return res.status(404).json(APIResponse.Error(APIErrorType.NOT_FOUND));
      }

      res.json(APIResponse.Success({ server }));
    } catch (error) {
      logger.warn("Failed to get server", { error });
      res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR));
    }
  },
);

serverRouter.get(
  "/:serverId/members",
  isServerMember,
  async (req: Request, res: Response<APIResponse.Type<GetServerMembers.Response>>) => {
    try {
      const { serverId } = req.params;

      const discordMembers = await ServersService.getDiscordGuildMembers(serverId, {
        cache: req.context.cache,
      });
      const registeredMembers = await ServersService.getServerMembers(serverId, {
        cache: req.context.cache,
      });
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
  isServerMember,
  async (req: Request<GetServerSettings.Params>, res: Response<APIResponse.Type<GetServerSettings.Response>>) => {
    try {
      const server = req.context.server;
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

serverRouter.put("/:serverId/settings", isServerMember, hasAdminPermission, async (req: Request, res: Response) => {
  try {
    const { serverId } = req.params;

    const {
      name,
      icon,
      auditChannelId,
      adminRoles,
      callerRoles,
      raidAnnouncementChannelId,
      serverGuildId,
      memberRoleId,
      friendRoleId,
      language,
    } = req.body;

    if (!req.session.user) {
      return res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED));
    }
    await ServersService.updateServer(
      serverId,
      {
        name,
        icon,
        auditChannelId,
        adminRoles,
        callerRoles,
        raidAnnouncementChannelId,
        serverGuildId,
        memberRoleId,
        friendRoleId,
        language,
      },
      {
        cache: req.context.cache,
      },
    );

    res.json(APIResponse.Success({ message: "Server settings updated successfully" }));
  } catch (error) {
    logger.warn("Failed to update server settings", { error });
    res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR, "Failed to update server settings"));
  }
});

serverRouter.get(
  "/:serverId/channels",
  isServerMember,
  async (req: Request<GetServerChannels.Params>, res: Response<APIResponse.Type<GetServerChannels.Response>>) => {
    try {
      const { serverId } = req.params;

      const discordChannels = await ServersService.getDiscordGuildChannels(serverId, {
        cache: req.context.cache,
      });

      const channels: Channel[] = fromDiscordChannels(discordChannels);

      res.json(APIResponse.Success({ channels }));
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED));
      } else {
        logger.warn("Failed to get server channels", { error });
        res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR, "Failed to get server channels"));
      }
    }
  },
);

serverRouter.get(
  "/:serverId/roles",
  isServerMember,
  async (req: Request<GetServerRoles.Params>, res: Response<APIResponse.Type<GetServerRoles.Response>>) => {
    try {
      const { serverId } = req.params;

      const discordRoles = await ServersService.getDiscordGuildRoles(serverId, {
        cache: req.context.cache,
      });

      const roles: Role[] = fromDiscordRoles(discordRoles);

      res.json(APIResponse.Success({ roles }));
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED));
      } else {
        logger.warn("Failed to get server roles", { error });
        res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR, "Failed to get server roles"));
      }
    }
  },
);
