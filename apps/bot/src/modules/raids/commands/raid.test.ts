import { ContentType, RaidRole, RaidStatus, RaidType } from "@albion-raid-manager/database";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { generateDefaultSlots, raidCommand } from "./raid";

describe("Raid Command", () => {
  let mockPrisma: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get fresh mock instances
    mockPrisma = vi.mocked(await import("@albion-raid-manager/database")).prisma;
  });

  describe("generateDefaultSlots", () => {
    it("should generate correct number of slots", () => {
      const slots = generateDefaultSlots(4);
      expect(slots).toHaveLength(4);
      expect(slots[0].role).toBe(RaidRole.CALLER);
      expect(slots[1].role).toBe(RaidRole.TANK);
      expect(slots[2].role).toBe(RaidRole.HEALER);
      expect(slots[3].role).toBe(RaidRole.SUPPORT);
    });

    it("should handle more than 8 slots by cycling roles", () => {
      const slots = generateDefaultSlots(10);
      expect(slots).toHaveLength(10);
      expect(slots[8].role).toBe(RaidRole.MELEE_DPS); // 9th slot (index 8)
      expect(slots[9].role).toBe(RaidRole.MELEE_DPS); // 10th slot (index 9) - cycles back to MELEE_DPS
    });

    it("should generate proper slot names", () => {
      const slots = generateDefaultSlots(2);
      expect(slots[0].name).toBe("CALLER 1");
      expect(slots[1].name).toBe("TANK 1");
    });
  });

  describe("handleCreateRaid", () => {
    it("should reject interaction without guild", async () => {
      const mockInteraction = createMockInteractionWithSubcommand("create", {
        getString: vi.fn((name: string) => {
          if (name === "title") return "Test Raid";
          if (name === "date") return "2024-12-31 20:00";
          return null;
        }),
      });
      mockInteraction.guild = null;

      await raidCommand.execute(mockInteraction);

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
    });

    it("should reject invalid date format", async () => {
      const mockInteraction = createMockInteractionWithSubcommand("create", {
        getString: vi.fn((name: string) => {
          if (name === "title") return "Test Raid";
          if (name === "date") return "invalid-date";
          return null;
        }),
      });

      await raidCommand.execute(mockInteraction);

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: "Invalid date format. Please use format: YYYY-MM-DD HH:MM",
        ephemeral: true,
      });
    });

    it("should reject past dates", async () => {
      const pastDate = createMockPastDate(1);
      const pastDateString = createMockDateString(pastDate);

      const mockInteraction = createMockInteractionWithSubcommand("create", {
        getString: vi.fn((name: string) => {
          if (name === "title") return "Test Raid";
          if (name === "date") return pastDateString;
          return null;
        }),
      });

      await raidCommand.execute(mockInteraction);

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: "Raid date cannot be in the past.",
        ephemeral: true,
      });
    });

    it("should create raid with valid data", async () => {
      const futureDate = createMockFutureDate(1);
      const futureDateString = createMockDateString(futureDate);

      const mockRaid = createMockRaid({
        date: futureDate,
        slots: [
          { id: "slot1", name: "CALLER 1", role: RaidRole.CALLER },
          { id: "slot2", name: "TANK 1", role: RaidRole.TANK },
        ],
      });

      mockPrisma.server.upsert.mockResolvedValue({});
      mockPrisma.raid.create.mockResolvedValue(mockRaid);

      const mockInteraction = createMockInteractionWithOptions({
        title: "Test Raid",
        description: "Test Description",
        date: futureDateString,
        type: RaidType.FIXED,
        content: ContentType.GROUP_DUNGEON,
        location: "Test Location",
        slots: 8,
      });
      mockInteraction.options.getSubcommand = vi.fn(() => "create");

      await raidCommand.execute(mockInteraction);

      expect(mockPrisma.server.upsert).toHaveBeenCalledWith({
        where: { id: "guild123" },
        update: { name: "Test Guild" },
        create: {
          id: "guild123",
          name: "Test Guild",
          icon: "guild-icon.png",
        },
      });

      expect(mockPrisma.raid.create).toHaveBeenCalledWith({
        data: {
          title: "Test Raid",
          description: "Test Description",
          date: expect.any(Date),
          type: RaidType.FIXED,
          contentType: ContentType.GROUP_DUNGEON,
          location: "Test Location",
          serverId: "guild123",
          status: RaidStatus.SCHEDULED,
          slots: {
            create: expect.any(Array),
          },
        },
        include: {
          slots: true,
        },
      });

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        embeds: expect.any(Array),
        components: expect.any(Array),
        ephemeral: true,
      });
    });
  });

  describe("handleListRaids", () => {
    it("should list raids without filter", async () => {
      const mockRaids = [
        createMockRaid({
          id: "raid1",
          title: "Raid 1",
          date: new Date("2024-12-31T20:00:00Z"),
          status: RaidStatus.OPEN,
          type: RaidType.FIXED,
          slots: [{ userId: "user1" }, { userId: null }],
        }),
        createMockRaid({
          id: "raid2",
          title: "Raid 2",
          date: new Date("2024-12-30T20:00:00Z"),
          status: RaidStatus.SCHEDULED,
          type: RaidType.FLEX,
          slots: [{ userId: null }, { userId: null }],
        }),
      ];

      mockPrisma.raid.findMany.mockResolvedValue(mockRaids);

      const mockInteraction = createMockInteraction({
        options: {
          getSubcommand: vi.fn(() => "list"),
          getString: vi.fn(() => null),
          getInteger: vi.fn(),
        },
      });

      await raidCommand.execute(mockInteraction);

      expect(mockPrisma.raid.findMany).toHaveBeenCalledWith({
        where: {
          serverId: "guild123",
        },
        include: {
          slots: {
            where: { userId: { not: null } },
          },
        },
        orderBy: { date: "asc" },
        take: 10,
      });

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        embeds: expect.any(Array),
        ephemeral: true,
      });
    });

    it("should list raids with status filter", async () => {
      mockPrisma.raid.findMany.mockResolvedValue([]);

      const mockInteraction = createMockInteraction({
        options: {
          getSubcommand: vi.fn(() => "list"),
          getString: vi.fn((name: string) => {
            if (name === "status") return RaidStatus.OPEN;
            return null;
          }),
          getInteger: vi.fn(),
        },
      });

      await raidCommand.execute(mockInteraction);

      expect(mockPrisma.raid.findMany).toHaveBeenCalledWith({
        where: {
          serverId: "guild123",
          status: RaidStatus.OPEN,
        },
        include: {
          slots: {
            where: { userId: { not: null } },
          },
        },
        orderBy: { date: "asc" },
        take: 10,
      });
    });

    it("should handle no raids found", async () => {
      mockPrisma.raid.findMany.mockResolvedValue([]);

      const mockInteraction = global.createMockInteraction({
        options: {
          getSubcommand: vi.fn(() => "list"),
          getString: vi.fn(() => null),
          getInteger: vi.fn(),
        },
      });

      await raidCommand.execute(mockInteraction);

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: "No raids found.",
        ephemeral: true,
      });
    });
  });

  describe("handleAnnounceRaid", () => {
    it("should reject if raid not found", async () => {
      mockPrisma.raid.findUnique.mockResolvedValue(null);

      const mockInteraction = global.createMockInteraction({
        options: {
          getSubcommand: vi.fn(() => "announce"),
          getString: vi.fn((name: string) => {
            if (name === "raid_id") return "nonexistent-raid";
            return null;
          }),
          getInteger: vi.fn(),
        },
      });

      await raidCommand.execute(mockInteraction);

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: "Raid not found.",
        ephemeral: true,
      });
    });

    it("should reject if raid belongs to different server", async () => {
      const mockRaid = global.createMockRaid({
        serverId: "different-guild",
        slots: [],
      });

      mockPrisma.raid.findUnique.mockResolvedValue(mockRaid);

      const mockInteraction = global.createMockInteraction({
        options: {
          getSubcommand: vi.fn(() => "announce"),
          getString: vi.fn((name: string) => {
            if (name === "raid_id") return "raid123";
            return null;
          }),
          getInteger: vi.fn(),
        },
      });

      await raidCommand.execute(mockInteraction);

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: "This raid belongs to a different server.",
        ephemeral: true,
      });
    });

    it("should reject if no announcement channel configured", async () => {
      const mockRaid = global.createMockRaid({ slots: [] });
      const mockServer = global.createMockServer({
        raidAnnouncementChannelId: null,
      });

      mockPrisma.raid.findUnique.mockResolvedValue(mockRaid);
      mockPrisma.server.findUnique.mockResolvedValue(mockServer);

      const mockInteraction = global.createMockInteraction({
        options: {
          getSubcommand: vi.fn(() => "announce"),
          getString: vi.fn((name: string) => {
            if (name === "raid_id") return "raid123";
            return null;
          }),
          getInteger: vi.fn(),
        },
      });

      await raidCommand.execute(mockInteraction);

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: "No raid announcement channel configured. Use `/config` to set one up.",
        ephemeral: true,
      });
    });
  });

  describe("handleCloseRaid", () => {
    it("should close raid successfully", async () => {
      const mockRaid = global.createMockRaid();

      mockPrisma.raid.findUnique.mockResolvedValue(mockRaid);
      mockPrisma.raid.update.mockResolvedValue({});

      const mockInteraction = global.createMockInteraction({
        options: {
          getSubcommand: vi.fn(() => "close"),
          getString: vi.fn((name: string) => {
            if (name === "raid_id") return "raid123";
            return null;
          }),
          getInteger: vi.fn(),
        },
      });

      await raidCommand.execute(mockInteraction);

      expect(mockPrisma.raid.update).toHaveBeenCalledWith({
        where: { id: "raid123" },
        data: { status: RaidStatus.CLOSED },
      });

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: "✅ Raid raid123 closed for signups.",
        ephemeral: true,
      });
    });
  });

  describe("handleOpenRaid", () => {
    it("should open raid successfully", async () => {
      const mockRaid = global.createMockRaid();

      mockPrisma.raid.findUnique.mockResolvedValue(mockRaid);
      mockPrisma.raid.update.mockResolvedValue({});

      const mockInteraction = global.createMockInteraction({
        options: {
          getSubcommand: vi.fn(() => "open"),
          getString: vi.fn((name: string) => {
            if (name === "raid_id") return "raid123";
            return null;
          }),
          getInteger: vi.fn(),
        },
      });

      await raidCommand.execute(mockInteraction);

      expect(mockPrisma.raid.update).toHaveBeenCalledWith({
        where: { id: "raid123" },
        data: { status: RaidStatus.OPEN },
      });

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: "✅ Raid raid123 opened for signups.",
        ephemeral: true,
      });
    });
  });
});
