import { CreateUserDto, UpdateUserDto, UserDetailsDto, UserDto } from "@albion-raid-manager/common";
import { prisma } from "@albion-raid-manager/database";
import { Request, Response, Router } from "express";

const router = Router();

// Get all users
router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();

    const response: UserDto[] = users.map((user) => ({
      id: user.id,
      username: user.username,
      avatar: user.avatar ?? undefined,
    }));

    res.json({ users: response });
  } catch (error) {
    console.error("Failed to get users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get a specific user
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        GuildMember: {
          include: {
            guild: true,
          },
        },
        RaidSlot: {
          include: {
            raid: true,
            build: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const response: UserDetailsDto = {
      id: user.id,
      username: user.username,
      avatar: user.avatar ?? undefined,
      guildMemberships: user.GuildMember.map((membership) => ({
        guild: {
          id: membership.guild.id,
          name: membership.guild.name,
          icon: membership.guild.icon ?? undefined,
          discordId: membership.guild.discordId,
          adminRoles: membership.guild.adminRoles,
          raidRoles: membership.guild.raidRoles,
          compositionRoles: membership.guild.compositionRoles,
          raidAnnouncementChannelId: membership.guild.raidAnnouncementChannelId ?? undefined,
        },
        nickname: membership.nickname ?? undefined,
        role: membership.role,
      })),
      raidSlots: user.RaidSlot.map((slot) => ({
        raid: slot.raid
          ? {
              id: slot.raid.id,
              guildId: slot.raid.guildId,
              description: slot.raid.description,
              date: slot.raid.date,
              allowLateJoin: slot.raid.allowLateJoin,
              status: slot.raid.status,
              announcementMessageId: slot.raid.announcementMessageId ?? undefined,
              slots: [],
            }
          : {
              id: "",
              guildId: "",
              description: "",
              date: new Date(),
              allowLateJoin: false,
              status: "OPEN",
              slots: [],
            },
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
        name: slot.name,
        comment: slot.comment ?? undefined,
        joinedAt: slot.joinedAt ?? undefined,
      })),
    };

    res.json({ user: response });
  } catch (error) {
    console.error("Failed to get user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Create a new user
router.post("/", async (req: Request<{}, {}, CreateUserDto>, res: Response) => {
  try {
    const { id, username, avatar } = req.body;

    const user = await prisma.user.create({
      data: {
        id,
        username,
        avatar,
      },
    });

    const response: UserDto = {
      id: user.id,
      username: user.username,
      avatar: user.avatar ?? undefined,
    };

    res.status(201).json({ user: response });
  } catch (error) {
    console.error("Failed to create user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Update a user
router.patch("/:id", async (req: Request<{ id: string }, {}, UpdateUserDto>, res: Response) => {
  try {
    const { id } = req.params;
    const { username, avatar } = req.body;

    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        username,
        avatar,
      },
    });

    const response: UserDto = {
      id: user.id,
      username: user.username,
      avatar: user.avatar ?? undefined,
    };

    res.json({ user: response });
  } catch (error) {
    console.error("Failed to update user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete a user
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: {
        id,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
