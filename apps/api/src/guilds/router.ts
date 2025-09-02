import { APIErrorType, APIResponse } from "@albion-raid-manager/core/types/api";
import { CreateGuildResponse, GetGuildResponse, GetGuildsResponse } from "@albion-raid-manager/core/types/api/guilds";
import { prisma } from "@albion-raid-manager/database";
import { discordService } from "@albion-raid-manager/discord";
import { logger } from "@albion-raid-manager/logger";
import { Request, Response, Router } from "express";

import { auth } from "@/auth/middleware";

import { compositionsRouter } from "./compositions/router";
import { raidsRouter } from "./raids/router";
import { createGuildSchema } from "./schemas";

export const guildsRouter: Router = Router();

guildsRouter.use("/:guildId/raids", raidsRouter);
guildsRouter.use("/:guildId/compositions", compositionsRouter);
guildsRouter.use(auth);

guildsRouter.get("/", async (req: Request, res: Response<APIResponse.Type<GetGuildsResponse>>) => {
  try {
    const guilds = await prisma.server.findMany({
      where: {
        members: {
          some: {
            userId: req.session.user?.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
    res.json(APIResponse.Success({ guilds }));
  } catch (error) {
    console.error("Failed to get guilds:", error);
    res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR));
  }
});

guildsRouter.get("/:guildId", async (req: Request, res: Response<APIResponse.Type<GetGuildResponse>>) => {
  try {
    const { guildId } = req.params;

    if (!guildId) {
      return res.status(400).json(APIResponse.Error(APIErrorType.BAD_REQUEST));
    }

    const guild = await prisma.server.findUnique({
      where: { id: guildId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!guild) {
      return res.status(404).json(APIResponse.Error(APIErrorType.NOT_FOUND));
    }

    res.json(APIResponse.Success({ guild }));
  } catch (error) {
    console.error("Failed to get guild:", error);
    res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR));
  }
});

guildsRouter.post("/", async (req: Request, res: Response<APIResponse.Type<CreateGuildResponse>>) => {
  const { server } = createGuildSchema.parse(req.body);

  try {
    const existingGuild = await prisma.server.findUnique({
      where: {
        id: server.id,
      },
    });
    if (existingGuild) {
      return res.status(400).json(APIResponse.Error(APIErrorType.GUILD_ALREADY_EXISTS));
    }

    const user = await discordService.users.getCurrentUser({
      type: "user",
      token: req.session.accessToken,
    });
    if (!user) {
      return res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED));
    }

    const guild = await prisma.server.create({
      data: {
        id: server.id,
        name: server.name,
        icon: server.icon,
        members: {
          create: {
            userId: user.id,
            nickname: user.username,
          },
        },
      },
    });

    res.status(201).json(APIResponse.Success({ guild }));
  } catch (error) {
    logger.error(`Failed to create guild for server: ${server.id}`, error);
    res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR));
  }
});
