import { ServiceError, ServiceErrorCode } from "@albion-raid-manager/types/services";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PermissionsService } from "./permissions";

// Mock dependencies
vi.mock("@albion-raid-manager/core/database");
vi.mock("@albion-raid-manager/core/services/discord");
vi.mock("@albion-raid-manager/core/cache/utils");
vi.mock("@albion-raid-manager/core/config");
vi.mock("@albion-raid-manager/core/logger");

const mockPrisma = {
  server: {
    findUnique: vi.fn(),
  },
};

const mockDiscordService = {
  getGuildMember: vi.fn(),
};

const mockConfig = {
  discord: {
    token: "test-token",
  },
};

// Mock the modules
vi.mock("@albion-raid-manager/core/database", () => ({
  prisma: mockPrisma,
}));

vi.mock("@albion-raid-manager/core/services/discord", () => ({
  DiscordService: mockDiscordService,
}));

vi.mock("@albion-raid-manager/core/config", () => ({
  default: mockConfig,
}));

vi.mock("@albion-raid-manager/core/cache/utils", () => ({
  withCache: vi.fn((fn) => fn()),
  CacheKeys: {
    hashObject: vi.fn((obj) => JSON.stringify(obj)),
  },
}));

describe("PermissionsService", () => {
  const serverId = "123456789012345678";
  const userId = "987654321098765432";
  const adminRoleId = "111111111111111111";
  const callerRoleId = "222222222222222222";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("hasRole", () => {
    it("should return true when user has admin roles", async () => {
      // Arrange
      mockPrisma.server.findUnique.mockResolvedValue({
        adminRoles: [adminRoleId],
      });

      mockDiscordService.getGuildMember.mockResolvedValue({
        roles: [adminRoleId, "333333333333333333"],
      });

      // Act
      const result = await PermissionsService.hasRole(serverId, userId, "admin");

      // Assert
      expect(result).toBe(true);
      expect(mockPrisma.server.findUnique).toHaveBeenCalledWith({
        where: { id: serverId },
        select: { adminRoles: true },
      });
      expect(mockDiscordService.getGuildMember).toHaveBeenCalledWith(serverId, userId, {
        type: "bot",
        token: "test-token",
      });
    });

    it("should return true when user has caller roles", async () => {
      // Arrange
      mockPrisma.server.findUnique.mockResolvedValue({
        callerRoles: [callerRoleId],
      });

      mockDiscordService.getGuildMember.mockResolvedValue({
        roles: [callerRoleId, "333333333333333333"],
      });

      // Act
      const result = await PermissionsService.hasRole(serverId, userId, "caller");

      // Assert
      expect(result).toBe(true);
      expect(mockPrisma.server.findUnique).toHaveBeenCalledWith({
        where: { id: serverId },
        select: { callerRoles: true },
      });
    });

    it("should return false when user does not have admin roles", async () => {
      // Arrange
      mockPrisma.server.findUnique.mockResolvedValue({
        adminRoles: [adminRoleId],
      });

      mockDiscordService.getGuildMember.mockResolvedValue({
        roles: ["333333333333333333", "444444444444444444"],
      });

      // Act
      const result = await PermissionsService.hasRole(serverId, userId, "admin");

      // Assert
      expect(result).toBe(false);
    });

    it("should return false when server has no admin roles configured", async () => {
      // Arrange
      mockPrisma.server.findUnique.mockResolvedValue({
        adminRoles: [],
      });

      // Act
      const result = await PermissionsService.hasRole(serverId, userId, "admin");

      // Assert
      expect(result).toBe(false);
      expect(mockDiscordService.getGuildMember).not.toHaveBeenCalled();
    });

    it("should return false when server is not found", async () => {
      // Arrange
      mockPrisma.server.findUnique.mockResolvedValue(null);

      // Act
      const result = await PermissionsService.hasRole(serverId, userId, "admin");

      // Assert
      expect(result).toBe(false);
      expect(mockDiscordService.getGuildMember).not.toHaveBeenCalled();
    });

    it("should return false when Discord member is not found", async () => {
      // Arrange
      mockPrisma.server.findUnique.mockResolvedValue({
        adminRoles: [adminRoleId],
      });

      mockDiscordService.getGuildMember.mockResolvedValue(null);

      // Act
      const result = await PermissionsService.hasRole(serverId, userId, "admin");

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("requireAdminRoles", () => {
    it("should not throw when user has admin roles", async () => {
      // Arrange
      mockPrisma.server.findUnique.mockResolvedValue({
        adminRoles: [adminRoleId],
      });

      mockDiscordService.getGuildMember.mockResolvedValue({
        roles: [adminRoleId],
      });

      // Act & Assert
      await expect(PermissionsService.requireAdminRoles(serverId, userId)).resolves.not.toThrow();
    });

    it("should throw ServiceError when user does not have admin roles", async () => {
      // Arrange
      mockPrisma.server.findUnique.mockResolvedValue({
        adminRoles: [adminRoleId],
      });

      mockDiscordService.getGuildMember.mockResolvedValue({
        roles: ["333333333333333333"],
      });

      // Act & Assert
      await expect(PermissionsService.requireAdminRoles(serverId, userId)).rejects.toThrow(ServiceError);

      await expect(PermissionsService.requireAdminRoles(serverId, userId)).rejects.toMatchObject({
        code: ServiceErrorCode.NOT_AUTHORIZED,
        message: "You do not have permission to perform this action. Admin roles are required.",
      });
    });
  });

  describe("requireAdminOrCallerRoles", () => {
    it("should not throw when user has admin roles", async () => {
      // Arrange
      mockPrisma.server.findUnique.mockResolvedValue({
        adminRoles: [adminRoleId],
      });

      mockDiscordService.getGuildMember.mockResolvedValue({
        roles: [adminRoleId],
      });

      // Act & Assert
      await expect(PermissionsService.requireAdminOrCallerRoles(serverId, userId)).resolves.not.toThrow();
    });

    it("should not throw when user has caller roles", async () => {
      // Arrange
      mockPrisma.server.findUnique
        .mockResolvedValueOnce({
          adminRoles: [adminRoleId],
        })
        .mockResolvedValueOnce({
          callerRoles: [callerRoleId],
        });

      mockDiscordService.getGuildMember.mockResolvedValue({
        roles: [callerRoleId],
      });

      // Act & Assert
      await expect(PermissionsService.requireAdminOrCallerRoles(serverId, userId)).resolves.not.toThrow();
    });

    it("should throw ServiceError when user has neither admin nor caller roles", async () => {
      // Arrange
      mockPrisma.server.findUnique
        .mockResolvedValueOnce({
          adminRoles: [adminRoleId],
        })
        .mockResolvedValueOnce({
          callerRoles: [callerRoleId],
        });

      mockDiscordService.getGuildMember.mockResolvedValue({
        roles: ["333333333333333333"],
      });

      // Act & Assert
      await expect(PermissionsService.requireAdminOrCallerRoles(serverId, userId)).rejects.toThrow(ServiceError);

      await expect(PermissionsService.requireAdminOrCallerRoles(serverId, userId)).rejects.toMatchObject({
        code: ServiceErrorCode.NOT_AUTHORIZED,
        message: "You do not have permission to perform this action. Admin or caller roles are required.",
      });
    });
  });
});
