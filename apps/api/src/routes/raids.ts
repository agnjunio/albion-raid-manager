import { prisma } from "@albion-raid-manager/database";
import { Request, Response, Router } from "express";
import { CreateRaidDto, RaidDto, RaidStatus, UpdateRaidDto } from "../../../../packages/core/src/types.bkp";

const router = Router();

// Get all raids for a guild
router.get("/", async (req: Request, res: Response) => {
  try {
    const { guildId } = req.query;

    if (!guildId || typeof guildId !== "string") {
      return res.status(400).json({ error: "Guild ID is required" });
    }

    const raids = await prisma.raid.findMany({
      where: {
        guildId,
      },
      include: {
        slots: {
          include: {
            user: true,
            build: true,
          },
        },
      },
    });

    const response: RaidDto[] = raids.map((raid) => ({
      id: raid.id,
      guildId: raid.guildId,
      description: raid.description,
      date: raid.date,
      allowLateJoin: raid.allowLateJoin,
      status: raid.status,
      announcementMessageId: raid.announcementMessageId ?? undefined,
      slots: raid.slots.map((slot) => ({
        id: slot.id,
        name: slot.name,
        comment: slot.comment ?? undefined,
        userId: slot.userId ?? undefined,
        buildId: slot.buildId ?? undefined,
        user: slot.user
          ? {
              id: slot.user.id,
              username: slot.user.username,
              avatar: slot.user.avatar ?? undefined,
            }
          : undefined,
        build: slot.build
          ? {
              id: slot.build.id,
              compositionId: slot.build.compositionId,
              name: slot.build.name,
              role: slot.build.role,
              comment: slot.build.comment ?? undefined,
              count: slot.build.count,
            }
          : undefined,
        joinedAt: slot.joinedAt ?? undefined,
      })),
    }));

    res.json({ raids: response });
  } catch (error) {
    console.error("Failed to get raids:", error);
    res.status(500).json({ error: "Failed to fetch raids" });
  }
});

// Get a specific raid
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const raid = await prisma.raid.findUnique({
      where: {
        id,
      },
      include: {
        slots: {
          include: {
            user: true,
            build: true,
          },
        },
      },
    });

    if (!raid) {
      return res.status(404).json({ error: "Raid not found" });
    }

    const response: RaidDto = {
      id: raid.id,
      guildId: raid.guildId,
      description: raid.description,
      date: raid.date,
      allowLateJoin: raid.allowLateJoin,
      status: raid.status,
      announcementMessageId: raid.announcementMessageId ?? undefined,
      slots: raid.slots.map((slot) => ({
        id: slot.id,
        name: slot.name,
        comment: slot.comment ?? undefined,
        userId: slot.userId ?? undefined,
        buildId: slot.buildId ?? undefined,
        user: slot.user
          ? {
              id: slot.user.id,
              username: slot.user.username,
              avatar: slot.user.avatar ?? undefined,
            }
          : undefined,
        build: slot.build
          ? {
              id: slot.build.id,
              compositionId: slot.build.compositionId,
              name: slot.build.name,
              role: slot.build.role,
              comment: slot.build.comment ?? undefined,
              count: slot.build.count,
            }
          : undefined,
        joinedAt: slot.joinedAt ?? undefined,
      })),
    };

    res.json({ raid: response });
  } catch (error) {
    console.error("Failed to get raid:", error);
    res.status(500).json({ error: "Failed to fetch raid" });
  }
});

// Create a new raid
router.post("/", async (req: Request<{}, {}, CreateRaidDto>, res: Response) => {
  try {
    const { guildId, description, date, allowLateJoin, status } = req.body;

    const raid = await prisma.raid.create({
      data: {
        guildId,
        description,
        date,
        allowLateJoin: allowLateJoin ?? false,
        status: status ?? RaidStatus.OPEN,
      },
      include: {
        slots: {
          include: {
            user: true,
            build: true,
          },
        },
      },
    });

    const response: RaidDto = {
      id: raid.id,
      guildId: raid.guildId,
      description: raid.description,
      date: raid.date,
      allowLateJoin: raid.allowLateJoin,
      status: raid.status,
      announcementMessageId: raid.announcementMessageId ?? undefined,
      slots: raid.slots.map((slot) => ({
        id: slot.id,
        name: slot.name,
        comment: slot.comment ?? undefined,
        userId: slot.userId ?? undefined,
        buildId: slot.buildId ?? undefined,
        user: slot.user
          ? {
              id: slot.user.id,
              username: slot.user.username,
              avatar: slot.user.avatar ?? undefined,
            }
          : undefined,
        build: slot.build
          ? {
              id: slot.build.id,
              compositionId: slot.build.compositionId,
              name: slot.build.name,
              role: slot.build.role,
              comment: slot.build.comment ?? undefined,
              count: slot.build.count,
            }
          : undefined,
        joinedAt: slot.joinedAt ?? undefined,
      })),
    };

    res.status(201).json({ raid: response });
  } catch (error) {
    console.error("Failed to create raid:", error);
    res.status(500).json({ error: "Failed to create raid" });
  }
});

// Update a raid
router.patch("/:id", async (req: Request<{ id: string }, {}, UpdateRaidDto>, res: Response) => {
  try {
    const { id } = req.params;
    const { description, date, allowLateJoin, status } = req.body;

    const raid = await prisma.raid.update({
      where: {
        id,
      },
      data: {
        description,
        date,
        allowLateJoin,
        status: status as RaidStatus,
      },
      include: {
        slots: {
          include: {
            user: true,
            build: true,
          },
        },
      },
    });

    const response: RaidDto = {
      id: raid.id,
      guildId: raid.guildId,
      description: raid.description,
      date: raid.date,
      allowLateJoin: raid.allowLateJoin,
      status: raid.status,
      announcementMessageId: raid.announcementMessageId ?? undefined,
      slots: raid.slots.map((slot) => ({
        id: slot.id,
        name: slot.name,
        comment: slot.comment ?? undefined,
        userId: slot.userId ?? undefined,
        buildId: slot.buildId ?? undefined,
        user: slot.user
          ? {
              id: slot.user.id,
              username: slot.user.username,
              avatar: slot.user.avatar ?? undefined,
            }
          : undefined,
        build: slot.build
          ? {
              id: slot.build.id,
              compositionId: slot.build.compositionId,
              name: slot.build.name,
              role: slot.build.role,
              comment: slot.build.comment ?? undefined,
              count: slot.build.count,
            }
          : undefined,
        joinedAt: slot.joinedAt ?? undefined,
      })),
    };

    res.json({ raid: response });
  } catch (error) {
    console.error("Failed to update raid:", error);
    res.status(500).json({ error: "Failed to update raid" });
  }
});

// Delete a raid
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.raid.delete({
      where: {
        id,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete raid:", error);
    res.status(500).json({ error: "Failed to delete raid" });
  }
});

export default router;
