import { requireAuth } from "@/middleware/auth";
import { APIError, APIErrorType } from "@/types/error";
import { prisma } from "@albion-raid-manager/database";
import { Request, Response, Router } from "express";
import { GuildWithMembers } from "../../../../packages/core/src/types.bkp";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: Request, res: Response<GuildWithMembers[] | APIError>) => {
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
    res.json(guilds);
  } catch (error) {
    console.error("Failed to get guilds:", error);
    res.status(500).json({ error: "Failed to fetch guilds" });
  }
});

router.get("/:id", async (req: Request, res: Response<GuildWithMembers | APIError>) => {
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
      return res.status(404).json({ error: APIErrorType.NOT_FOUND });
    }

    res.json(guild);
  } catch (error) {
    console.error("Failed to get guild:", error);
    res.status(500).json({ error: "Failed to fetch guild" });
  }
});

// Create a new guild
router.post("/", async (req: Request, res: Response) => {
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

    res.status(201).json({ guild });
  } catch (error) {
    console.error("Failed to create guild:", error);
    res.status(500).json({ error: "Failed to create guild" });
  }
});

// Update a guild
router.patch("/:id", async (req: Request, res: Response) => {
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

    res.json({ guild });
  } catch (error) {
    console.error("Failed to update guild:", error);
    res.status(500).json({ error: "Failed to update guild" });
  }
});

// Delete a guild
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.guild.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete guild:", error);
    res.status(500).json({ error: "Failed to delete guild" });
  }
});

export default router;
