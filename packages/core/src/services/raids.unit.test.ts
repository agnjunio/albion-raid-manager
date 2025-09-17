import { Raid } from "@albion-raid-manager/types";
import { CreateRaidInput, ServiceError, ServiceErrorCode } from "@albion-raid-manager/types/services";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies - use automatic mocking when possible
vi.mock("@albion-raid-manager/core/logger"); // Auto-mocks all exports
vi.mock("@albion-raid-manager/core/cache/redis"); // Auto-mocks all exports
// Note: @albion-raid-manager/core/cache/utils is handled by vitest setup

// Mock the ServersService dependency
vi.mock("./servers", () => ({
  ServersService: {
    ensureServer: vi.fn().mockResolvedValue(undefined),
    ensureServerMember: vi.fn().mockResolvedValue(undefined),
  },
}));

// Custom mock for database - need specific structure for Prisma client
vi.mock("@albion-raid-manager/core/database", () => ({
  prisma: {
    $transaction: vi.fn(),
    raid: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    raidSlot: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from "@albion-raid-manager/core/database";

import { RaidService } from "./raids";

describe("RaidService", () => {
  let mockPrisma: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = vi.mocked(prisma);
  });

  describe("createRaid", () => {
    it("should create a raid with valid input", async () => {
      // Arrange
      const input: CreateRaidInput = {
        title: "Test Raid",
        description: "A test raid",
        date: new Date("2024-12-31T20:00:00Z"),
        contentType: "ROADS_OF_AVALON",
        location: "Brecilien",
        serverId: "guild123",
      };

      const mockRaid: Raid = {
        id: "raid123",
        title: "Test Raid",
        description: "A test raid",
        date: new Date("2024-12-31T20:00:00Z"),
        type: "FIXED",
        contentType: "ROADS_OF_AVALON",
        maxPlayers: 7,
        location: "Brecilien",
        serverId: "guild123",
        status: "SCHEDULED",
        createdAt: new Date(),
        updatedAt: new Date(),
        slots: [],
      };

      mockPrisma.$transaction.mockImplementation((callback: Function) => callback(vi.mocked(prisma)));
      mockPrisma.raid.create.mockResolvedValue(mockRaid);

      // Act
      const result = await RaidService.createRaid(input);

      // Assert
      expect(result).toEqual(mockRaid);
      expect(mockPrisma.raid.create).toHaveBeenCalledWith({
        data: {
          title: "Test Raid",
          description: "A test raid",
          date: new Date("2024-12-31T20:00:00Z"),
          type: "FIXED",
          contentType: "ROADS_OF_AVALON",
          maxPlayers: 7,
          location: "Brecilien",
          serverId: "guild123",
          status: "SCHEDULED",
        },
        include: {
          slots: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });
    });

    it("should create raid slots for fixed size content", async () => {
      // Arrange
      const input: CreateRaidInput = {
        title: "Test Raid",
        description: "A test raid",
        date: new Date("2024-12-31T20:00:00Z"),
        contentType: "ROADS_OF_AVALON",
        location: "Brecilien",
        serverId: "guild123",
      };

      const mockRaid: Raid = {
        id: "raid123",
        title: "Test Raid",
        description: "A test raid",
        date: new Date("2024-12-31T20:00:00Z"),
        type: "FIXED",
        contentType: "ROADS_OF_AVALON",
        maxPlayers: 7,
        location: "Brecilien",
        serverId: "guild123",
        status: "SCHEDULED",
        createdAt: new Date(),
        updatedAt: new Date(),
        slots: [],
      };

      mockPrisma.$transaction.mockImplementation((callback: Function) => callback(vi.mocked(prisma)));
      mockPrisma.raid.create.mockResolvedValue(mockRaid);
      mockPrisma.raidSlot.createMany.mockResolvedValue({ count: 7 });

      // Act
      await RaidService.createRaid(input);

      // Assert
      expect(mockPrisma.raidSlot.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            raidId: "raid123",
            name: "Slot 1",
            role: null,
          }),
          expect.objectContaining({
            raidId: "raid123",
            name: "Slot 2",
            role: null,
          }),
          expect.objectContaining({
            raidId: "raid123",
            name: "Slot 3",
            role: null,
          }),
        ]),
      });
    });

    it("should not create raid slots for flex size content", async () => {
      // Arrange
      const input: CreateRaidInput = {
        title: "Test Raid",
        description: "A test raid",
        date: new Date("2024-12-31T20:00:00Z"),
        contentType: "GROUP_DUNGEON",
        location: "Test Location",
        serverId: "guild123",
      };

      const mockRaid: Raid = {
        id: "raid123",
        title: "Test Raid",
        description: "A test raid",
        date: new Date("2024-12-31T20:00:00Z"),
        type: "FLEX",
        contentType: "GROUP_DUNGEON",
        maxPlayers: null,
        location: "Test Location",
        serverId: "guild123",
        status: "SCHEDULED",
        createdAt: new Date(),
        updatedAt: new Date(),
        slots: [],
      };

      mockPrisma.$transaction.mockImplementation((callback: Function) => callback(vi.mocked(prisma)));
      mockPrisma.raid.create.mockResolvedValue(mockRaid);

      // Act
      await RaidService.createRaid(input);

      // Assert
      expect(mockPrisma.raidSlot.createMany).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      // Arrange
      const input: CreateRaidInput = {
        title: "Test Raid",
        description: "A test raid",
        date: new Date("2024-12-31T20:00:00Z"),
        contentType: "ROADS_OF_AVALON",
        location: "Brecilien",
        serverId: "guild123",
      };

      mockPrisma.$transaction.mockRejectedValue(new Error("Database connection failed"));

      // Act & Assert
      await expect(RaidService.createRaid(input)).rejects.toThrow("Database connection failed");
    });
  });

  describe("findRaidsByServer", () => {
    it("should return raids with default filters", async () => {
      // Arrange
      const mockRaids: Raid[] = [
        {
          id: "raid1",
          title: "Raid 1",
          description: "Description 1",
          date: new Date("2024-12-31T20:00:00Z"),
          type: "FIXED",
          contentType: "ROADS_OF_AVALON",
          maxPlayers: 7,
          location: "Brecilien",
          serverId: "guild123",
          status: "SCHEDULED",
          createdAt: new Date(),
          updatedAt: new Date(),
          slots: [],
        },
      ];

      mockPrisma.raid.findMany.mockResolvedValue(mockRaids);

      // Act
      const result = await RaidService.findRaidsByServer("guild123");

      // Assert
      expect(result).toEqual(mockRaids);
      expect(mockPrisma.raid.findMany).toHaveBeenCalledWith({
        where: {
          serverId: "guild123",
        },
        include: {
          slots: true,
        },
        orderBy: {
          date: "asc",
        },
      });
    });

    it("should apply custom filters", async () => {
      // Arrange
      const mockRaids: Raid[] = [];
      mockPrisma.raid.findMany.mockResolvedValue(mockRaids);

      // Act
      await RaidService.findRaidsByServer("guild123", {
        status: "OPEN",
        contentType: "ROADS_OF_AVALON",
      });

      // Assert
      expect(mockPrisma.raid.findMany).toHaveBeenCalledWith({
        where: {
          serverId: "guild123",
          status: "OPEN",
          contentType: "ROADS_OF_AVALON",
        },
        include: {
          slots: true,
        },
        orderBy: {
          date: "asc",
        },
      });
    });
  });

  describe("reorderSlots", () => {
    it("should reorder raid slots successfully", async () => {
      // Arrange
      const raidId = "raid123";
      const slotIds = ["slot3", "slot1", "slot2"]; // New order: slot3 first, slot1 second, slot2 third

      const mockRaid = {
        id: raidId,
        title: "Test Raid",
        slots: [
          { id: "slot1", order: 0, name: "Slot 1" },
          { id: "slot2", order: 1, name: "Slot 2" },
          { id: "slot3", order: 2, name: "Slot 3" },
        ],
      };

      const mockUpdatedRaid = {
        ...mockRaid,
        slots: [
          { id: "slot3", order: 0, name: "Slot 3" },
          { id: "slot1", order: 1, name: "Slot 1" },
          { id: "slot2", order: 2, name: "Slot 2" },
        ],
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          raid: {
            findUnique: vi
              .fn()
              .mockResolvedValueOnce(mockRaid) // First call to verify raid exists
              .mockResolvedValueOnce(mockUpdatedRaid), // Second call to return updated raid
          },
          raidSlot: {
            update: vi.fn().mockResolvedValue({}), // Mock slot updates
          },
        });
      });

      // Act
      const result = await RaidService.reorderSlots(raidId, slotIds);

      // Assert
      expect(result).toEqual(mockUpdatedRaid);
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it("should throw error when raid not found", async () => {
      // Arrange
      const raidId = "nonexistent-raid";
      const slotIds = ["slot1", "slot2"];

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          raid: {
            findUnique: vi.fn().mockResolvedValue(null), // Raid not found
          },
          raidSlot: {
            update: vi.fn().mockResolvedValue({}),
          },
        });
      });

      // Act & Assert
      await expect(RaidService.reorderSlots(raidId, slotIds)).rejects.toThrow(
        new ServiceError(ServiceErrorCode.NOT_FOUND, `Raid with ID ${raidId} not found`),
      );
    });

    it("should throw error when invalid slot IDs provided", async () => {
      // Arrange
      const raidId = "raid123";
      const slotIds = ["slot1", "invalid-slot"]; // One invalid slot ID

      const mockRaid = {
        id: raidId,
        slots: [
          { id: "slot1", order: 0, name: "Slot 1" },
          { id: "slot2", order: 1, name: "Slot 2" },
        ],
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          raid: {
            findUnique: vi.fn().mockResolvedValue(mockRaid),
          },
          raidSlot: {
            update: vi.fn().mockResolvedValue({}),
          },
        });
      });

      // Act & Assert
      await expect(RaidService.reorderSlots(raidId, slotIds)).rejects.toThrow(
        new ServiceError(ServiceErrorCode.INVALID_INPUT, "Invalid slot IDs: invalid-slot"),
      );
    });

    it("should throw error when slot IDs are missing", async () => {
      // Arrange
      const raidId = "raid123";
      const slotIds = ["slot1"]; // Missing slot2

      const mockRaid = {
        id: raidId,
        slots: [
          { id: "slot1", order: 0, name: "Slot 1" },
          { id: "slot2", order: 1, name: "Slot 2" },
        ],
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          raid: {
            findUnique: vi.fn().mockResolvedValue(mockRaid),
          },
          raidSlot: {
            update: vi.fn().mockResolvedValue({}),
          },
        });
      });

      // Act & Assert
      await expect(RaidService.reorderSlots(raidId, slotIds)).rejects.toThrow(
        new ServiceError(ServiceErrorCode.INVALID_INPUT, "Missing slot IDs: slot2"),
      );
    });
  });

  describe("createRaidSlot", () => {
    it("should unassign user from existing slot when creating new slot with user assignment", async () => {
      // Arrange
      const input = {
        raidId: "raid123",
        name: "New Slot",
        userId: "user456",
      };

      const mockRaid = {
        id: "raid123",
        title: "Test Raid",
        serverId: "guild123",
        status: "SCHEDULED",
        slots: [],
      };

      const existingUserSlot = {
        id: "existing-slot",
        userId: "user456",
        raidId: "raid123",
      };

      mockPrisma.raid.findUnique.mockResolvedValue(mockRaid);
      mockPrisma.raidSlot.findFirst.mockResolvedValue(existingUserSlot);
      mockPrisma.raidSlot.update.mockResolvedValue({});
      mockPrisma.raid.update.mockResolvedValue({
        ...mockRaid,
        slots: [{ id: "new-slot", name: "New Slot", userId: "user456" }],
      });

      // Act
      await RaidService.createRaidSlot(input);

      // Assert
      expect(mockPrisma.raidSlot.findFirst).toHaveBeenCalledWith({
        where: {
          raidId: "raid123",
          userId: "user456",
        },
      });
      expect(mockPrisma.raidSlot.update).toHaveBeenCalledWith({
        where: { id: "existing-slot" },
        data: { userId: null },
      });
    });

    it("should not unassign user when no existing assignment found", async () => {
      // Arrange
      const input = {
        raidId: "raid123",
        name: "New Slot",
        userId: "user456",
      };

      const mockRaid = {
        id: "raid123",
        title: "Test Raid",
        serverId: "guild123",
        status: "SCHEDULED",
        slots: [],
      };

      mockPrisma.raid.findUnique.mockResolvedValue(mockRaid);
      mockPrisma.raidSlot.findFirst.mockResolvedValue(null);
      mockPrisma.raid.update.mockResolvedValue({
        ...mockRaid,
        slots: [{ id: "new-slot", name: "New Slot", userId: "user456" }],
      });

      // Act
      await RaidService.createRaidSlot(input);

      // Assert
      expect(mockPrisma.raidSlot.findFirst).toHaveBeenCalledWith({
        where: {
          raidId: "raid123",
          userId: "user456",
        },
      });
      expect(mockPrisma.raidSlot.update).not.toHaveBeenCalled();
    });
  });

  describe("updateRaidSlot", () => {
    it("should unassign user from existing slot when updating slot with user assignment", async () => {
      // Arrange
      const slotId = "slot123";
      const input = {
        userId: "user456",
      };

      const existingSlot = {
        id: slotId,
        raidId: "raid123",
        order: 0,
        raid: {
          id: "raid123",
          serverId: "guild123",
          status: "SCHEDULED",
        },
      };

      const existingUserSlot = {
        id: "other-slot",
        userId: "user456",
        raidId: "raid123",
      };

      const updatedSlot = {
        ...existingSlot,
        userId: "user456",
        raid: {
          ...existingSlot.raid,
          slots: [
            { id: slotId, userId: "user456" },
            { id: "other-slot", userId: null },
          ],
        },
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          raidSlot: {
            findUnique: vi.fn().mockResolvedValue(existingSlot),
            findFirst: vi.fn().mockResolvedValue(existingUserSlot),
            update: vi
              .fn()
              .mockResolvedValueOnce({}) // First update to unassign existing slot
              .mockResolvedValueOnce(updatedSlot), // Second update to assign new slot
          },
        });
      });

      // Act
      const result = await RaidService.updateRaidSlot(slotId, input);

      // Assert
      expect(result).toEqual(updatedSlot);
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it("should not unassign user when updating slot to same user", async () => {
      // Arrange
      const slotId = "slot123";
      const input = {
        userId: "user456",
      };

      const existingSlot = {
        id: slotId,
        userId: "user456", // Already assigned to the same user
        raidId: "raid123",
        order: 0,
        raid: {
          id: "raid123",
          serverId: "guild123",
          status: "SCHEDULED",
        },
      };

      const updatedSlot = {
        ...existingSlot,
        raid: {
          ...existingSlot.raid,
          slots: [{ id: slotId, userId: "user456" }],
        },
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          raidSlot: {
            findUnique: vi.fn().mockResolvedValue(existingSlot),
            findFirst: vi.fn().mockResolvedValue(null), // No other slot found
            update: vi.fn().mockResolvedValue(updatedSlot),
          },
        });
      });

      // Act
      const result = await RaidService.updateRaidSlot(slotId, input);

      // Assert
      expect(result).toEqual(updatedSlot);
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it("should not unassign user when no existing assignment found", async () => {
      // Arrange
      const slotId = "slot123";
      const input = {
        userId: "user456",
      };

      const existingSlot = {
        id: slotId,
        raidId: "raid123",
        order: 0,
        raid: {
          id: "raid123",
          serverId: "guild123",
          status: "SCHEDULED",
        },
      };

      const updatedSlot = {
        ...existingSlot,
        userId: "user456",
        raid: {
          ...existingSlot.raid,
          slots: [{ id: slotId, userId: "user456" }],
        },
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          raidSlot: {
            findUnique: vi.fn().mockResolvedValue(existingSlot),
            findFirst: vi.fn().mockResolvedValue(null), // No existing assignment
            update: vi.fn().mockResolvedValue(updatedSlot),
          },
        });
      });

      // Act
      const result = await RaidService.updateRaidSlot(slotId, input);

      // Assert
      expect(result).toEqual(updatedSlot);
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});
