import { ServiceError, ServiceErrorCode } from "@albion-raid-manager/types/services";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GearSlot, prisma, RaidRole } from "@albion-raid-manager/core/database";

import { BuildService } from "./builds";

// Mock the servers service
vi.mock("./servers", () => ({
  ServersService: {
    ensureServerExists: vi.fn(),
  },
}));

describe("BuildService", () => {
  const mockPrisma = vi.mocked(prisma);
  const mockTransaction = vi.mocked(prisma.$transaction);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createBuild", () => {
    it("should create a build successfully", async () => {
      const input = {
        name: "Tank Build",
        description: "Standard tank build",
        role: RaidRole.TANK,
        serverId: "server123",
        pieces: [
          {
            gearSlot: GearSlot.MAIN_HAND,
            itemName: "T6_2H_MACE@0",
            quantity: 1,
            order: 0,
          },
        ],
      };

      const mockBuild = {
        id: "build123",
        name: "Tank Build",
        description: "Standard tank build",
        role: RaidRole.TANK,
        serverId: "server123",
        createdAt: new Date(),
        updatedAt: new Date(),
        pieces: [
          {
            id: "piece123",
            buildId: "build123",
            gearSlot: GearSlot.MAIN_HAND,
            itemName: "T6_2H_MACE@0",
            quantity: 1,
            description: null,
            order: 0,
            createdAt: new Date(),
          },
        ],
      };

      // Mock the initial build creation (without pieces)
      const mockBuildWithoutPieces = {
        id: "build123",
        name: "Tank Build",
        description: "Standard tank build",
        role: RaidRole.TANK,
        serverId: "server123",
        createdAt: new Date(),
        updatedAt: new Date(),
        pieces: [],
      };

      mockTransaction.mockImplementation(async (callback) => {
        const tx = {
          build: {
            create: vi.fn().mockResolvedValue(mockBuildWithoutPieces),
            findUnique: vi.fn().mockResolvedValue(mockBuild),
          },
          buildPiece: {
            createMany: vi.fn().mockResolvedValue({}),
          },
        };
        return await callback(tx as any);
      });

      const result = await BuildService.createBuild(input);

      expect(result).toEqual(mockBuild);
      expect(mockTransaction).toHaveBeenCalled();
    });

    it("should throw error if build name already exists", async () => {
      const input = {
        name: "Existing Build",
        role: RaidRole.TANK,
        serverId: "server123",
      };

      const existingBuild = {
        id: "existing123",
        name: "Existing Build",
        description: null,
        role: RaidRole.TANK,
        serverId: "server123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the findFirst call that happens before the transaction
      vi.mocked(prisma.build.findFirst).mockResolvedValue(existingBuild);

      await expect(BuildService.createBuild(input)).rejects.toThrow(
        new ServiceError(
          ServiceErrorCode.INVALID_STATE,
          'Build with name "Existing Build" already exists in this server',
        ),
      );
    });
  });

  describe("getBuildById", () => {
    it("should return build with pieces", async () => {
      const mockBuild = {
        id: "build123",
        name: "Tank Build",
        description: "Standard tank build",
        role: RaidRole.TANK,
        serverId: "server123",
        createdAt: new Date(),
        updatedAt: new Date(),
        pieces: [
          {
            id: "piece123",
            buildId: "build123",
            gearSlot: GearSlot.MAIN_HAND,
            itemName: "T6_2H_MACE@0",
            quantity: 1,
            description: null,
            order: 0,
            createdAt: new Date(),
          },
        ],
      };

      vi.mocked(prisma.build.findUnique).mockResolvedValue(mockBuild);

      const result = await BuildService.getBuildById("build123");

      expect(result).toEqual(mockBuild);
      expect(mockPrisma.build.findUnique).toHaveBeenCalledWith({
        where: { id: "build123" },
        include: {
          pieces: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });
    });

    it("should return null if build not found", async () => {
      vi.mocked(prisma.build.findUnique).mockResolvedValue(null);

      const result = await BuildService.getBuildById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("getBuildsByServer", () => {
    it("should return builds filtered by role", async () => {
      const mockBuilds = [
        {
          id: "build123",
          name: "Tank Build",
          description: "Standard tank build",
          role: RaidRole.TANK,
          serverId: "server123",
          createdAt: new Date(),
          updatedAt: new Date(),
          pieces: [],
        },
      ];

      vi.mocked(prisma.build.findMany).mockResolvedValue(mockBuilds);

      const result = await BuildService.getBuildsByServer("server123", { role: RaidRole.TANK });

      expect(result).toEqual(mockBuilds);
      expect(mockPrisma.build.findMany).toHaveBeenCalledWith({
        where: {
          serverId: "server123",
          role: RaidRole.TANK,
        },
        include: {
          pieces: {
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    });
  });

  describe("updateBuild", () => {
    it("should update build successfully", async () => {
      const input = {
        name: "Updated Tank Build",
        description: "Updated description",
      };

      const existingBuild = {
        id: "build123",
        name: "Tank Build",
        description: "Standard tank build",
        role: RaidRole.TANK,
        serverId: "server123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedBuild = {
        id: "build123",
        name: "Updated Tank Build",
        description: "Updated description",
        role: RaidRole.TANK,
        serverId: "server123",
        createdAt: new Date(),
        updatedAt: new Date(),
        pieces: [],
      };

      mockTransaction.mockImplementation(async (callback) => {
        const tx = {
          build: {
            findUnique: vi.fn().mockResolvedValue(existingBuild),
            findFirst: vi.fn().mockResolvedValue(null), // No conflicting build
            update: vi.fn().mockResolvedValue(updatedBuild),
          },
        };
        return await callback(tx as any);
      });

      const result = await BuildService.updateBuild("build123", input);

      expect(result).toEqual(updatedBuild);
    });

    it("should throw error if build not found", async () => {
      mockTransaction.mockImplementation(async (callback) => {
        const tx = {
          build: {
            findUnique: vi.fn().mockResolvedValue(null),
          },
        };
        return await callback(tx as any);
      });

      await expect(BuildService.updateBuild("nonexistent", { name: "New Name" })).rejects.toThrow(
        new ServiceError(ServiceErrorCode.NOT_FOUND, 'Build with ID "nonexistent" not found'),
      );
    });
  });

  describe("deleteBuild", () => {
    it("should delete build successfully", async () => {
      const existingBuild = {
        id: "build123",
        name: "Tank Build",
        description: "Standard tank build",
        role: RaidRole.TANK,
        serverId: "server123",
        createdAt: new Date(),
        updatedAt: new Date(),
        raidSlots: [],
      };

      mockTransaction.mockImplementation(async (callback) => {
        const tx = {
          build: {
            findUnique: vi.fn().mockResolvedValue(existingBuild),
            delete: vi.fn().mockResolvedValue({}),
          },
        };
        return await callback(tx as any);
      });

      await BuildService.deleteBuild("build123");

      expect(mockTransaction).toHaveBeenCalled();
    });

    it("should throw error if build is being used by raid slots", async () => {
      const existingBuild = {
        id: "build123",
        name: "Tank Build",
        description: "Standard tank build",
        role: RaidRole.TANK,
        serverId: "server123",
        createdAt: new Date(),
        updatedAt: new Date(),
        raidSlots: [{ id: "slot123" }],
      };

      mockTransaction.mockImplementation(async (callback) => {
        const tx = {
          build: {
            findUnique: vi.fn().mockResolvedValue(existingBuild),
          },
        };
        return await callback(tx as any);
      });

      await expect(BuildService.deleteBuild("build123")).rejects.toThrow(
        new ServiceError(
          ServiceErrorCode.INVALID_STATE,
          'Cannot delete build "Tank Build" as it is being used by 1 raid slot(s)',
        ),
      );
    });
  });

  describe("addBuildPiece", () => {
    it("should add piece to build successfully", async () => {
      const input = {
        gearSlot: GearSlot.MAIN_HAND,
        itemName: "T6_2H_MACE@0",
        quantity: 1,
      };

      const existingBuild = {
        id: "build123",
        name: "Tank Build",
        description: "Standard tank build",
        role: RaidRole.TANK,
        serverId: "server123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newPiece = {
        id: "piece123",
        buildId: "build123",
        gearSlot: GearSlot.MAIN_HAND,
        itemName: "T6_2H_MACE@0",
        quantity: 1,
        description: null,
        order: 0,
        createdAt: new Date(),
      };

      mockTransaction.mockImplementation(async (callback) => {
        const tx = {
          build: {
            findUnique: vi.fn().mockResolvedValue(existingBuild),
          },
          buildPiece: {
            findFirst: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue(newPiece),
          },
        };
        return await callback(tx as any);
      });

      const result = await BuildService.addBuildPiece("build123", input);

      expect(result).toEqual(newPiece);
    });
  });
});
