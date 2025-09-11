import { Raid } from "@albion-raid-manager/types";
import { CreateRaidInput } from "@albion-raid-manager/types/services";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "@albion-raid-manager/core/database";

import { RaidService } from "./raids";

// Mock the ServersService dependency
vi.mock("./servers", () => ({
  ServersService: {
    ensureServerExists: vi.fn(),
  },
}));

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

      mockPrisma.$transaction.mockImplementation((callback: Function) => callback(mockPrisma));
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
        include: expect.any(Object),
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

      mockPrisma.$transaction.mockImplementation((callback: Function) => callback(mockPrisma));
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
        maxPlayers: 5,
        location: "Test Location",
        serverId: "guild123",
        status: "SCHEDULED",
        createdAt: new Date(),
        updatedAt: new Date(),
        slots: [],
      };

      mockPrisma.$transaction.mockImplementation((callback: Function) => callback(mockPrisma));
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

  describe("findRaids", () => {
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
      const result = await RaidService.findRaids({ serverId: "guild123" });

      // Assert
      expect(result).toEqual(mockRaids);
      expect(mockPrisma.raid.findMany).toHaveBeenCalledWith({
        where: {
          serverId: "guild123",
        },
        include: {
          slots: undefined,
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
      await RaidService.findRaids({ serverId: "guild123", status: "OPEN", contentType: "ROADS_OF_AVALON" });

      // Assert
      expect(mockPrisma.raid.findMany).toHaveBeenCalledWith({
        where: {
          serverId: "guild123",
          status: "OPEN",
          contentType: "ROADS_OF_AVALON",
        },
        include: {
          slots: undefined,
        },
        orderBy: {
          date: "asc",
        },
      });
    });
  });
});
