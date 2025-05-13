import { Guild } from "@albion-raid-manager/core/types";
import { APIErrorType, APIResponse } from "@albion-raid-manager/core/types/api";
import { prisma } from "@albion-raid-manager/database";
import { Request, Response, Router } from "express";

import { requireAuth } from "@/middleware/auth";

const router: Router = Router();

router.use(requireAuth);

router.get("/", async (req: Request, res: Response<APIResponse.Type<Guild[]>>) => {
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
    res.json(APIResponse.Success(guilds));
  } catch (error) {
    console.error("Failed to get guilds:", error);
    res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR));
  }
});

router.get("/:id", async (req: Request, res: Response<APIResponse.Type<Guild>>) => {
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

router.post("/", async (req: Request, res: Response<APIResponse.Type<Guild>>) => {
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

router.patch("/:id", async (req: Request, res: Response<APIResponse.Type<Guild>>) => {
  try {
    const { id } = req.params;
    const { name, icon, adminRoles, raidRoles, compositionRoles, raidAnnouncementChannelId } = req.body;

    const guild = await prisma.guild.update({
      where: { id },
      data: {
        name,
        icon,
        adminRoles,
        raidRoles,
        compositionRoles,
        raidAnnouncementChannelId,
      },
    });

    res.json(APIResponse.Success(guild));
  } catch (error) {
    console.error("Failed to update guild:", error);
    res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR));
  }
});

router.delete("/:id", async (req: Request, res: Response<APIResponse.Type>) => {
  try {
    const { id } = req.params;

    await prisma.guild.delete({
      where: { id },
    });

    res.json(APIResponse.Success());
  } catch (error) {
    console.error("Failed to delete guild:", error);
    res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR));
  }
});

export default router;
