import { prisma } from "@albion-raid-manager/database";
import { Request, Response, Router } from "express";

const router = Router();

// Get all servers (guilds)
router.get("/", async (_req: Request, res: Response) => {
  try {
    const servers = await prisma.guild.findMany({
      select: {
        id: true,
        name: true,
        icon: true,
        discordId: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    res.json({ servers });
  } catch (error) {
    console.error("Failed to get servers:", error);
    res.status(500).json({ error: "Failed to fetch servers" });
  }
});

// Get server details
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const server = await prisma.guild.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!server) {
      return res.status(404).json({ error: "Server not found" });
    }

    res.json({ server });
  } catch (error) {
    console.error("Failed to get server:", error);
    res.status(500).json({ error: "Failed to fetch server" });
  }
});

export default router;
