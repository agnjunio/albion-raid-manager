import { APIErrorType, APIResponse } from "@albion-raid-manager/core/types/api";
import { CreateGuildResponse, GetGuildResponse, GetGuildsResponse } from "@albion-raid-manager/core/types/api/guilds";
import { prisma } from "@albion-raid-manager/database";
import { discordService, Server } from "@albion-raid-manager/discord";
import { logger } from "@albion-raid-manager/logger";
import { Request, Response, Router } from "express";
import { z } from "zod";

import { requireAuth } from "@/auth/middleware";

export const guildsRouter: Router = Router();

guildsRouter.use(requireAuth);

guildsRouter.get("/", async (req: Request, res: Response<APIResponse.Type<GetGuildsResponse>>) => {
  try {
    const guilds = await prisma.guild.findMany({
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

guildsRouter.get("/:id", async (req: Request, res: Response<APIResponse.Type<GetGuildResponse>>) => {
  try {
    const { id } = req.params;

    const guild = await prisma.guild.findUnique({
      where: { id },
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
  const createGuildSchema = z.object({
    server: z.custom<Server>(),
  });
  const { server } = createGuildSchema.parse(req.body);

  try {
    const existingGuild = await prisma.guild.findUnique({
      where: {
        discordId: server.id,
      },
    });
    if (existingGuild) {
      return res.status(400).json(APIResponse.Error(APIErrorType.GUILD_ALREADY_EXISTS));
    }

    const user = await discordService.users.getCurrentUser(`Bearer ${req.session.accessToken}`);
    if (!user) {
      return res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED));
    }

    const guild = await prisma.guild.create({
      data: {
        discordId: server.id,
        name: server.name,
        icon: server.icon,
        members: {
          create: {
            userId: user.id,
            role: "LEADER",
            default: true,
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
