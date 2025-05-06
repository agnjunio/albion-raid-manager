import { prisma } from "@albion-raid-manager/database";
import { Request, Response, Router } from "express";

const router = Router();

// Get guild settings
router.get("/:guildId", async (req: Request, res: Response) => {
  try {
    const { guildId } = req.params;

    const guild = await prisma.guild.findUnique({
      where: { id: guildId },
      select: {
        adminRoles: true,
        raidRoles: true,
        compositionRoles: true,
        raidAnnouncementChannelId: true,
      },
    });

    if (!guild) {
      return res.status(404).json({ error: "Guild not found" });
    }

    res.json({ settings: guild });
  } catch (error) {
    console.error("Failed to get guild settings:", error);
    res.status(500).json({ error: "Failed to fetch guild settings" });
  }
});

// Update guild settings
router.patch("/:guildId", async (req: Request, res: Response) => {
  try {
    const { guildId } = req.params;
    const { adminRoles, raidRoles, compositionRoles, raidAnnouncementChannelId } = req.body;

    const guild = await prisma.guild.update({
      where: { id: guildId },
      data: {
        adminRoles,
        raidRoles,
        compositionRoles,
        raidAnnouncementChannelId,
      },
      select: {
        adminRoles: true,
        raidRoles: true,
        compositionRoles: true,
        raidAnnouncementChannelId: true,
      },
    });

    res.json({ settings: guild });
  } catch (error) {
    console.error("Failed to update guild settings:", error);
    res.status(500).json({ error: "Failed to update guild settings" });
  }
});

export default router;
