import { Guild } from "@albion-raid-manager/core/types";
import { APIErrorType, APIResponse } from "@albion-raid-manager/core/types/api";
import { GetGuildsResponse } from "@albion-raid-manager/core/types/api/guilds";
import { prisma } from "@albion-raid-manager/database";
import { Request, Response, Router } from "express";

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

guildsRouter.get("/:id", async (req: Request, res: Response<APIResponse.Type<Guild>>) => {
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

    res.json(APIResponse.Success(guild));
  } catch (error) {
    console.error("Failed to get guild:", error);
    res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR));
  }
});

guildsRouter.post("/", async (req: Request, res: Response<APIResponse.Type<Guild>>) => {
  try {
    const { name, icon, discordId, adminRoles, raidRoles, compositionRoles, raidAnnouncementChannelId } = req.body;

    const guild = await prisma.guild.create({
      data: {
        name,
        icon,
        discordId,
        adminRoles: adminRoles || [],
        raidRoles: raidRoles || [],
        compositionRoles: compositionRoles || [],
        raidAnnouncementChannelId,
      },
    });

    res.status(201).json(APIResponse.Success(guild));
  } catch (error) {
    console.error("Failed to create guild:", error);
    res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR));
  }
});
