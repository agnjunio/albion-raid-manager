import { GuildMemberDto, GuildMemberRole, UpdateGuildMemberDto } from "@albion-raid-manager/core/types";
import { prisma } from "@albion-raid-manager/database";
import { Request, Response, Router } from "express";

const router: Router = Router();

// Get all guild members for a guild
router.get("/", async (req: Request, res: Response) => {
  try {
    const { guildId } = req.query;

    if (!guildId || typeof guildId !== "string") {
      return res.status(400).json({ error: "Guild ID is required" });
    }

    const guildMembers = await prisma.guildMember.findMany({
      where: {
        guildId,
      },
      include: {
        user: true,
      },
    });

    const response: GuildMemberDto[] = guildMembers.map((member) => ({
      guildId: member.guildId,
      userId: member.userId,
      nickname: member.nickname ?? undefined,
      role: member.role,
      user: {
        id: member.user.id,
        username: member.user.username,
        avatar: member.user.avatar ?? undefined,
      },
    }));

    res.json({ guildMembers: response });
  } catch (error) {
    console.error("Failed to get guild members:", error);
    res.status(500).json({ error: "Failed to fetch guild members" });
  }
});

// Get a specific guild member
router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const { guildId } = req.query;
    const { userId } = req.params;

    if (!guildId || typeof guildId !== "string") {
      return res.status(400).json({ error: "Guild ID is required" });
    }

    const guildMember = await prisma.guildMember.findUnique({
      where: {
        guildId_userId: {
          guildId,
          userId,
        },
      },
      include: {
        user: true,
      },
    });

    if (!guildMember) {
      return res.status(404).json({ error: "Guild member not found" });
    }

    const response: GuildMemberDto = {
      guildId: guildMember.guildId,
      userId: guildMember.userId,
      nickname: guildMember.nickname ?? undefined,
      role: guildMember.role,
      user: {
        id: guildMember.user.id,
        username: guildMember.user.username,
        avatar: guildMember.user.avatar ?? undefined,
      },
    };

    res.json({ guildMember: response });
  } catch (error) {
    console.error("Failed to get guild member:", error);
    res.status(500).json({ error: "Failed to fetch guild member" });
  }
});

// Update a guild member
router.patch("/:userId", async (req: Request<{ userId: string }, {}, UpdateGuildMemberDto>, res: Response) => {
  try {
    const { guildId } = req.query;
    const { userId } = req.params;
    const { nickname, role } = req.body;

    if (!guildId || typeof guildId !== "string") {
      return res.status(400).json({ error: "Guild ID is required" });
    }

    const guildMember = await prisma.guildMember.update({
      where: {
        guildId_userId: {
          guildId,
          userId,
        },
      },
      data: {
        nickname,
        role: role as GuildMemberRole,
      },
      include: {
        user: true,
      },
    });

    const response: GuildMemberDto = {
      guildId: guildMember.guildId,
      userId: guildMember.userId,
      nickname: guildMember.nickname ?? undefined,
      role: guildMember.role,
      user: {
        id: guildMember.user.id,
        username: guildMember.user.username,
        avatar: guildMember.user.avatar ?? undefined,
      },
    };

    res.json({ guildMember: response });
  } catch (error) {
    console.error("Failed to update guild member:", error);
    res.status(500).json({ error: "Failed to update guild member" });
  }
});

// Delete a guild member
router.delete("/:userId", async (req: Request, res: Response) => {
  try {
    const { guildId } = req.query;
    const { userId } = req.params;

    if (!guildId || typeof guildId !== "string") {
      return res.status(400).json({ error: "Guild ID is required" });
    }

    await prisma.guildMember.delete({
      where: {
        guildId_userId: {
          guildId,
          userId,
        },
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete guild member:", error);
    res.status(500).json({ error: "Failed to delete guild member" });
  }
});

export default router;
