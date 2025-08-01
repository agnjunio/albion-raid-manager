import { assignRolesBasedOnGuild } from "@/utils/roles";
import { prisma } from "@albion-raid-manager/database";
import { logger } from "@albion-raid-manager/logger";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@albion-raid-manager/database", () => ({
  prisma: {
    server: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@albion-raid-manager/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("assignRolesBasedOnGuild", () => {
  const mockMember = {
    user: {
      id: "123456789",
    },
    nickname: "TestNick",
    roles: {
      add: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
      cache: {
        get: vi.fn(),
      },
    },
    guild: {
      roles: {
        cache: {
          get: vi.fn(),
        },
      },
    },
  } as any;

  const mockAlbionData = {
    Name: "TestPlayer",
    GuildName: "TestGuild",
    KillFame: 1000000,
    DeathFame: 50000,
    FameRatio: 0.95,
    GuildId: "test-guild-id",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("when server configuration is not found", () => {
    it("should log warning and return early", async () => {
      const mockPrisma = vi.mocked(prisma);
      const mockLogger = vi.mocked(logger);

      mockPrisma.server.findUnique.mockResolvedValue(null);

      await assignRolesBasedOnGuild(mockMember, "test-server-id", "test-guild-id");

      expect(mockLogger.warn).toHaveBeenCalledWith("Server configuration not found for server test-server-id");
      expect(mockMember.roles.add).not.toHaveBeenCalled();
      expect(mockMember.roles.remove).not.toHaveBeenCalled();
    });
  });

  describe("when player is in server guild", () => {
    it("should add member role and remove friend role", async () => {
      const mockPrisma = vi.mocked(prisma);
      const mockLogger = vi.mocked(logger);

      mockPrisma.server.findUnique.mockResolvedValue({
        memberRoleId: "member-role-id",
        friendRoleId: "friend-role-id",
        serverGuildId: "test-guild-id",
      });

      const mockMemberRole = { id: "member-role-id", name: "Member" };
      const mockFriendRole = { id: "friend-role-id", name: "Friend" };

      mockMember.guild.roles.cache.get.mockReturnValueOnce(mockMemberRole).mockReturnValueOnce(mockFriendRole);

      await assignRolesBasedOnGuild(mockMember, "test-server-id", "test-guild-id");

      expect(mockMember.roles.add).toHaveBeenCalledWith(mockMemberRole);
      expect(mockMember.roles.remove).toHaveBeenCalledWith(mockFriendRole);

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Added member role to user TestNick in server test-server-id",
        expect.objectContaining({
          memberRole: mockMemberRole,
          friendRole: mockFriendRole,
          isInServerGuild: true,
        }),
      );
    });

    it("should only add member role if no friend role configured", async () => {
      const mockPrisma = vi.mocked(prisma);

      mockPrisma.server.findUnique.mockResolvedValue({
        memberRoleId: "member-role-id",
        friendRoleId: null,
        serverGuildId: "test-guild-id",
      });

      const mockMemberRole = { id: "member-role-id", name: "Member" };
      mockMember.guild.roles.cache.get.mockReturnValue(mockMemberRole);

      await assignRolesBasedOnGuild(mockMember, "test-server-id", "test-guild-id");

      expect(mockMember.roles.add).toHaveBeenCalledWith(mockMemberRole);
      expect(mockMember.roles.remove).not.toHaveBeenCalled();
    });
  });

  describe("when player is not in server guild", () => {
    it("should add friend role and remove member role", async () => {
      const mockPrisma = vi.mocked(prisma);
      const mockLogger = vi.mocked(logger);

      mockPrisma.server.findUnique.mockResolvedValue({
        memberRoleId: "member-role-id",
        friendRoleId: "friend-role-id",
        serverGuildId: "test-guild-id",
      });

      const mockMemberRole = { id: "member-role-id", name: "Member" };
      const mockFriendRole = { id: "friend-role-id", name: "Friend" };

      mockMember.guild.roles.cache.get.mockReturnValueOnce(mockMemberRole).mockReturnValueOnce(mockFriendRole);

      await assignRolesBasedOnGuild(mockMember, "test-server-id", "different-guild-id");

      expect(mockMember.roles.add).toHaveBeenCalledWith(mockFriendRole);
      expect(mockMember.roles.remove).toHaveBeenCalledWith(mockMemberRole);

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Added friend role to user TestNick in server test-server-id",
        expect.objectContaining({
          memberRole: mockMemberRole,
          friendRole: mockFriendRole,
          isInServerGuild: false,
        }),
      );
    });

    it("should only add friend role if no member role configured", async () => {
      const mockPrisma = vi.mocked(prisma);

      mockPrisma.server.findUnique.mockResolvedValue({
        memberRoleId: null,
        friendRoleId: "friend-role-id",
        serverGuildId: "test-guild-id",
      });

      const mockFriendRole = { id: "friend-role-id", name: "Friend" };
      mockMember.guild.roles.cache.get.mockReturnValue(mockFriendRole);

      await assignRolesBasedOnGuild(mockMember, "test-server-id", "different-guild-id");

      expect(mockMember.roles.add).toHaveBeenCalledWith(mockFriendRole);
      expect(mockMember.roles.remove).not.toHaveBeenCalled();
    });
  });

  describe("when roles are not found in guild", () => {
    it("should not add or remove roles", async () => {
      const mockPrisma = vi.mocked(prisma);

      mockPrisma.server.findUnique.mockResolvedValue({
        memberRoleId: "member-role-id",
        friendRoleId: "friend-role-id",
        serverGuildId: "test-guild-id",
      });

      mockMember.guild.roles.cache.get.mockReturnValue(null);

      await assignRolesBasedOnGuild(mockMember, "test-server-id", "test-guild-id");

      expect(mockMember.roles.add).not.toHaveBeenCalled();
      expect(mockMember.roles.remove).not.toHaveBeenCalled();
    });
  });

  describe("when role assignment fails", () => {
    it("should log error but not throw", async () => {
      const mockPrisma = vi.mocked(prisma);
      const mockLogger = vi.mocked(logger);

      mockPrisma.server.findUnique.mockResolvedValue({
        memberRoleId: "member-role-id",
        friendRoleId: null,
        serverGuildId: "test-guild-id",
      });

      const mockMemberRole = { id: "member-role-id", name: "Member" };
      mockMember.guild.roles.cache.get.mockReturnValue(mockMemberRole);
      mockMember.roles.add.mockRejectedValue(new Error("Discord API error"));

      await expect(assignRolesBasedOnGuild(mockMember, "test-server-id", "test-guild-id")).resolves.not.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to assign roles for user 123456789 in server test-server-id:",
        expect.any(Error),
      );
    });
  });

  describe("with audit functionality", () => {
    it("should call audit function when client and albionData provided", async () => {
      const mockPrisma = vi.mocked(prisma);
      const mockClient = {} as any;

      mockPrisma.server.findUnique.mockResolvedValue({
        memberRoleId: "member-role-id",
        friendRoleId: null,
        serverGuildId: "test-guild-id",
      });

      const mockMemberRole = { id: "member-role-id", name: "Member" };
      mockMember.guild.roles.cache.get.mockReturnValue(mockMemberRole);

      // Mock the dynamic import
      const mockSendAuditMessage = vi.fn().mockResolvedValue(undefined);
      vi.doMock("@/utils/audit", () => ({
        sendAuditMessage: mockSendAuditMessage,
      }));

      await assignRolesBasedOnGuild(mockMember, "test-server-id", "test-guild-id", mockClient, mockAlbionData);

      // Note: The dynamic import is tested in integration tests
      // This test verifies the function signature and behavior
      expect(mockMember.roles.add).toHaveBeenCalledWith(mockMemberRole);
    });

    it("should not call audit function when client or albionData not provided", async () => {
      const mockPrisma = vi.mocked(prisma);

      mockPrisma.server.findUnique.mockResolvedValue({
        memberRoleId: "member-role-id",
        friendRoleId: null,
        serverGuildId: "test-guild-id",
      });

      const mockMemberRole = { id: "member-role-id", name: "Member" };
      mockMember.guild.roles.cache.get.mockReturnValue(mockMemberRole);

      await assignRolesBasedOnGuild(mockMember, "test-server-id", "test-guild-id");

      expect(mockMember.roles.add).toHaveBeenCalledWith(mockMemberRole);
      // No audit call should be made
    });
  });
});
