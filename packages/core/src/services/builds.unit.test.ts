import { Build, GearSlot } from "@albion-raid-manager/types";
import { CreateBuildInput, ServiceError, ServiceErrorCode } from "@albion-raid-manager/types/services";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "@albion-raid-manager/core/database";

import { BuildService } from "./builds";

// Mock the servers service
vi.mock("./servers", () => ({
  ServersService: {
    ensureServerExists: vi.fn(),
  },
}));

describe("BuildService", () => {
  let mockPrisma: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = vi.mocked(prisma);
  });

  describe("createBuild", () => {
    it("should create a build successfully", async () => {
      // Arrange
      const input: CreateBuildInput = {
        name: "Tank Build",
        description: "Standard tank build",
        role: "TANK",
        serverId: "server123",
        pieces: [
          {
            gearSlot: "MAIN_HAND",
            itemName: "T6_2H_MACE@0",
            quantity: 1,
            order: 0,
          },
        ],
      };

      const mockBuild: Build = {
        id: "build123",
        name: "Tank Build",
        description: "Standard tank build",
        role: "TANK",
        serverId: "server123",
        createdAt: new Date(),
        updatedAt: new Date(),
        pieces: [
          {
            id: "piece123",
            buildId: "build123",
            gearSlot: "MAIN_HAND",
            itemName: "T6_2H_MACE@0",
            quantity: 1,
            description: null,
            order: 0,
            createdAt: new Date(),
          },
        ],
      };

      mockPrisma.$transaction.mockImplementation(async (callback: Function) => {
        const tx = {
          build: {
            create: vi.fn().mockResolvedValue(mockBuild),
            findUnique: vi.fn().mockResolvedValue(mockBuild),
          },
          buildPiece: {
            createMany: vi.fn().mockResolvedValue({ count: 1 }),
          },
        };
        return await callback(tx as any);
      });

      // Act
      const result = await BuildService.createBuild(input);

      // Assert
      expect(result).toEqual(mockBuild);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it("should throw error if build name already exists", async () => {
      // Arrange
      const input: CreateBuildInput = {
        name: "Existing Build",
        role: "TANK",
        serverId: "server123",
      };

      const existingBuild = {
        id: "existing123",
        name: "Existing Build",
        description: null,
        role: "TANK",
        serverId: "server123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.build.findFirst.mockResolvedValue(existingBuild);

      // Act & Assert
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
      // Arrange
      const mockBuild: Build = {
        id: "build123",
        name: "Tank Build",
        description: "Standard tank build",
        role: "TANK",
        serverId: "server123",
        createdAt: new Date(),
        updatedAt: new Date(),
        pieces: [
          {
            id: "piece123",
            buildId: "build123",
            gearSlot: "MAIN_HAND",
            itemName: "T6_2H_MACE@0",
            quantity: 1,
            description: null,
            order: 0,
            createdAt: new Date(),
          },
        ],
      };

      mockPrisma.build.findUnique.mockResolvedValue(mockBuild);

      // Act
      const result = await BuildService.getBuildById("build123");

      // Assert
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
      // Arrange
      mockPrisma.build.findUnique.mockResolvedValue(null);

      // Act
      const result = await BuildService.getBuildById("nonexistent");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("getBuildsByServer", () => {
    it("should return builds with default filters", async () => {
      // Arrange
      const mockBuilds: Build[] = [
        {
          id: "build123",
          name: "Tank Build",
          description: "Standard tank build",
          role: "TANK",
          serverId: "server123",
          createdAt: new Date(),
          updatedAt: new Date(),
          pieces: [],
        },
      ];

      mockPrisma.build.findMany.mockResolvedValue(mockBuilds);

      // Act
      const result = await BuildService.getBuildsByServer("server123");

      // Assert
      expect(result).toEqual(mockBuilds);
      expect(mockPrisma.build.findMany).toHaveBeenCalledWith({
        where: {
          serverId: "server123",
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

    it("should apply custom filters", async () => {
      // Arrange
      const mockBuilds: Build[] = [];
      mockPrisma.build.findMany.mockResolvedValue(mockBuilds);

      // Act
      await BuildService.getBuildsByServer("server123", { role: "TANK" });

      // Assert
      expect(mockPrisma.build.findMany).toHaveBeenCalledWith({
        where: {
          serverId: "server123",
          role: "TANK",
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
      // Arrange
      const input = {
        name: "Updated Tank Build",
        description: "Updated description",
      };

      const existingBuild: Build = {
        id: "build123",
        name: "Tank Build",
        description: "Standard tank build",
        role: "TANK",
        serverId: "server123",
        createdAt: new Date(),
        updatedAt: new Date(),
        pieces: [],
      };

      const updatedBuild: Build = {
        id: "build123",
        name: "Updated Tank Build",
        description: "Updated description",
        role: "TANK",
        serverId: "server123",
        createdAt: new Date(),
        updatedAt: new Date(),
        pieces: [],
      };

      mockPrisma.$transaction.mockImplementation(async (callback: Function) => {
        const tx = {
          build: {
            findUnique: vi.fn().mockResolvedValue(existingBuild),
            findFirst: vi.fn().mockResolvedValue(null), // No conflicting build
            update: vi.fn().mockResolvedValue(updatedBuild),
          },
        };
        return await callback(tx as any);
      });

      // Act
      const result = await BuildService.updateBuild("build123", input);

      // Assert
      expect(result).toEqual(updatedBuild);
    });

    it("should throw error if build not found", async () => {
      // Arrange
      mockPrisma.$transaction.mockImplementation(async (callback: Function) => {
        const tx = {
          build: {
            findUnique: vi.fn().mockResolvedValue(null),
          },
        };
        return await callback(tx as any);
      });

      // Act & Assert
      await expect(BuildService.updateBuild("nonexistent", { name: "New Name" })).rejects.toThrow(
        new ServiceError(ServiceErrorCode.NOT_FOUND, 'Build with ID "nonexistent" not found'),
      );
    });
  });

  describe("deleteBuild", () => {
    it("should delete build successfully", async () => {
      // Arrange
      const existingBuild = {
        id: "build123",
        name: "Tank Build",
        description: "Standard tank build",
        role: "TANK",
        serverId: "server123",
        createdAt: new Date(),
        updatedAt: new Date(),
        raidSlots: [],
      };

      mockPrisma.$transaction.mockImplementation(async (callback: Function) => {
        const tx = {
          build: {
            findUnique: vi.fn().mockResolvedValue(existingBuild),
            delete: vi.fn().mockResolvedValue({}),
          },
        };
        return await callback(tx as any);
      });

      // Act
      await BuildService.deleteBuild("build123");

      // Assert
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it("should throw error if build is being used by raid slots", async () => {
      // Arrange
      const existingBuild = {
        id: "build123",
        name: "Tank Build",
        description: "Standard tank build",
        role: "TANK",
        serverId: "server123",
        createdAt: new Date(),
        updatedAt: new Date(),
        raidSlots: [{ id: "slot123" }],
      };

      mockPrisma.$transaction.mockImplementation(async (callback: Function) => {
        const tx = {
          build: {
            findUnique: vi.fn().mockResolvedValue(existingBuild),
          },
        };
        return await callback(tx as any);
      });

      // Act & Assert
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
      // Arrange
      const input = {
        gearSlot: "MAIN_HAND" as GearSlot,
        itemName: "T6_2H_MACE@0",
        quantity: 1,
      };

      const existingBuild: Build = {
        id: "build123",
        name: "Tank Build",
        description: "Standard tank build",
        role: "TANK",
        serverId: "server123",
        createdAt: new Date(),
        updatedAt: new Date(),
        pieces: [],
      };

      const newPiece = {
        id: "piece123",
        buildId: "build123",
        gearSlot: "MAIN_HAND" as GearSlot,
        itemName: "T6_2H_MACE@0",
        quantity: 1,
        description: null,
        order: 0,
        createdAt: new Date(),
      };

      mockPrisma.$transaction.mockImplementation(async (callback: Function) => {
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

      // Act
      const result = await BuildService.addBuildPiece("build123", input);

      // Assert
      expect(result).toEqual(newPiece);
    });
  });
});
