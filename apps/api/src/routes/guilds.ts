import { prisma } from "@albion-raid-manager/database";
import { Request, Response, Router } from "express";

const router = Router();

// Get all guilds
router.get("/", async (_req: Request, res: Response) => {
  try {
    const guilds = await prisma.guild.findMany();
    res.json({ guilds });
  } catch (error) {
    console.error("Failed to get guilds:", error);
    res.status(500).json({ error: "Failed to fetch guilds" });
  }
});

// Get a specific guild
router.get("/:id", async (req: Request, res: Response) => {
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
      return res.status(404).json({ error: "Guild not found" });
    }

    res.json({ guild });
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
