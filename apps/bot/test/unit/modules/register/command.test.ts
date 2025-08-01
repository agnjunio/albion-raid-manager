import { registerCommand } from "@/modules/register/command";
import { prisma } from "@albion-raid-manager/database";
import { logger } from "@albion-raid-manager/logger";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@albion-raid-manager/database", () => ({
  prisma: {
    serverMember: {
      update: vi.fn(),
    },
  },
  ensureUserAndServer: vi.fn(),
}));

vi.mock("@albion-raid-manager/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@albion-raid-manager/albion", () => ({
  verifyAlbionPlayer: vi.fn(),
}));

vi.mock("@/utils/discord", () => ({
  getGuild: vi.fn(),
  getGuildMember: vi.fn(),
}));

vi.mock("@/utils/roles", () => ({
  assignRolesBasedOnGuild: vi.fn(),
}));

vi.mock("@/utils/audit", () => ({
  sendAuditMessage: vi.fn(),
}));

describe("registerCommand", () => {
  const mockInteraction = {
    isChatInputCommand: () => true,
    options: {
      getString: vi.fn(),
    },
    user: {
      id: "test-user-id",
      username: "testuser",
      avatar: "test-avatar",
    },
    guildId: "test-guild-id",
    deferReply: vi.fn().mockResolvedValue(undefined),
    editReply: vi.fn().mockResolvedValue(undefined),
    reply: vi.fn().mockResolvedValue(undefined),
  } as any;

  const mockGuild = {
    id: "test-guild-id",
    name: "Test Guild",
    iconURL: vi.fn().mockReturnValue("test-icon"),
  };

  const mockMember = {
    nickname: "TestNick",
    setNickname: vi.fn().mockResolvedValue(undefined),
  };

  const mockUserData = {
    Name: "TestPlayer",
    GuildName: "TestGuild",
    Id: "test-player-id",
    GuildId: "test-guild-id",
    KillFame: 1000000,
    DeathFame: 50000,
    FameRatio: 0.95,
  };

  const mockServerMember = {
    serverId: "test-guild-id",
    userId: "test-user-id",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    mockInteraction.options.getString.mockReturnValue("TestPlayer");

    const { getGuild, getGuildMember } = require("@/utils/discord");
    getGuild.mockResolvedValue(mockGuild);
    getGuildMember.mockResolvedValue(mockMember);

    const { verifyAlbionPlayer } = require("@albion-raid-manager/albion");
    verifyAlbionPlayer.mockResolvedValue(mockUserData);

    const { ensureUserAndServer } = require("@albion-raid-manager/database");
    ensureUserAndServer.mockResolvedValue({ serverMember: mockServerMember });

    const { assignRolesBasedOnGuild } = require("@/utils/roles");
    assignRolesBasedOnGuild.mockResolvedValue(undefined);

    const { sendAuditMessage } = require("@/utils/audit");
    sendAuditMessage.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("successful registration", () => {
    it("should call audit function after successful registration", async () => {
      const mockPrisma = vi.mocked(prisma);
      const { sendAuditMessage } = require("@/utils/audit");

      mockPrisma.serverMember.update.mockResolvedValue({} as any);

      await registerCommand.execute(mockInteraction);

      expect(sendAuditMessage).toHaveBeenCalledWith(
        expect.any(Object), // client
        "test-guild-id",
        mockMember,
        mockUserData,
        "registration",
      );
    });

    it("should update server member with Albion data", async () => {
      const mockPrisma = vi.mocked(prisma);

      mockPrisma.serverMember.update.mockResolvedValue({} as any);

      await registerCommand.execute(mockInteraction);

      expect(mockPrisma.serverMember.update).toHaveBeenCalledWith({
        where: {
          serverId_userId: {
            serverId: "test-guild-id",
            userId: "test-user-id",
          },
        },
        data: {
          nickname: "TestPlayer",
          albionPlayerId: "test-player-id",
          albionGuildId: "test-guild-id",
          killFame: 1000000,
          deathFame: 50000,
          lastUpdated: expect.any(Date),
        },
      });
    });

    it("should assign roles based on guild membership", async () => {
      const { assignRolesBasedOnGuild } = require("@/utils/roles");

      await registerCommand.execute(mockInteraction);

      expect(assignRolesBasedOnGuild).toHaveBeenCalledWith(mockMember, "test-guild-id", "test-guild-id");
    });

    it("should update user nickname", async () => {
      await registerCommand.execute(mockInteraction);

      expect(mockMember.setNickname).toHaveBeenCalledWith("TestPlayer");
    });

    it("should send success message with player info", async () => {
      await registerCommand.execute(mockInteraction);

      expect(mockInteraction.editReply).toHaveBeenCalledWith({
        content: expect.stringContaining("✅ Successfully registered as **TestPlayer**!"),
      });
    });
  });

  describe("when Albion player not found", () => {
    it("should send error message and not call audit", async () => {
      const { verifyAlbionPlayer } = require("@albion-raid-manager/albion");
      const { sendAuditMessage } = require("@/utils/audit");

      verifyAlbionPlayer.mockResolvedValue(null);

      await registerCommand.execute(mockInteraction);

      expect(mockInteraction.editReply).toHaveBeenCalledWith({
        content: expect.stringContaining('❌ User "TestPlayer" not found in Albion Online.'),
      });

      expect(sendAuditMessage).not.toHaveBeenCalled();
    });
  });

  describe("when nickname update fails", () => {
    it("should log warning but continue with registration", async () => {
      const mockLogger = vi.mocked(logger);
      const { sendAuditMessage } = require("@/utils/audit");

      mockMember.setNickname.mockRejectedValue(new Error("Permission denied"));

      await registerCommand.execute(mockInteraction);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Failed to update nickname for user test-user-id:",
        expect.any(Error),
      );

      // Should still call audit function
      expect(sendAuditMessage).toHaveBeenCalled();
    });
  });

  describe("when role assignment fails", () => {
    it("should log error but continue with registration", async () => {
      const mockLogger = vi.mocked(logger);
      const { assignRolesBasedOnGuild } = require("@/utils/roles");

      assignRolesBasedOnGuild.mockRejectedValue(new Error("Role assignment failed"));

      await registerCommand.execute(mockInteraction);

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to assign roles for user test-user-id in server test-guild-id:",
        expect.any(Error),
      );

      // Should still call audit function
      const { sendAuditMessage } = require("@/utils/audit");
      expect(sendAuditMessage).toHaveBeenCalled();
    });
  });

  describe("when audit function fails", () => {
    it("should log error but not break registration", async () => {
      const mockLogger = vi.mocked(logger);
      const { sendAuditMessage } = require("@/utils/audit");

      sendAuditMessage.mockRejectedValue(new Error("Audit failed"));

      await registerCommand.execute(mockInteraction);

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to send audit message for registration:",
        expect.any(Error),
      );

      // Registration should still complete successfully
      expect(mockInteraction.editReply).toHaveBeenCalledWith({
        content: expect.stringContaining("✅ Successfully registered"),
      });
    });
  });

  describe("error handling", () => {
    it("should handle Albion API errors gracefully", async () => {
      const { verifyAlbionPlayer } = require("@albion-raid-manager/albion");

      const albionError = new Error("Albion API error");
      albionError.status = 404;
      verifyAlbionPlayer.mockRejectedValue(albionError);

      await registerCommand.execute(mockInteraction);

      expect(mockInteraction.editReply).toHaveBeenCalledWith({
        content: expect.stringContaining('❌ User "TestPlayer" not found in Albion Online.'),
      });
    });

    it("should handle network errors gracefully", async () => {
      const { verifyAlbionPlayer } = require("@albion-raid-manager/albion");

      const networkError = new Error("timeout");
      verifyAlbionPlayer.mockRejectedValue(networkError);

      await registerCommand.execute(mockInteraction);

      expect(mockInteraction.editReply).toHaveBeenCalledWith({
        content: expect.stringContaining("❌ Connection to Albion Online timed out."),
      });
    });
  });

  describe("command structure", () => {
    it("should have correct command data", () => {
      const commandData = registerCommand.data;

      expect(commandData.name).toBe("register");
      expect(commandData.description).toBe("Register your Albion Online username");
    });

    it("should have username option", () => {
      const commandData = registerCommand.data;
      const usernameOption = commandData.options?.find((option) => option.name === "username");

      expect(usernameOption).toBeDefined();
      expect(usernameOption?.required).toBe(true);
      expect(usernameOption?.minLength).toBe(1);
      expect(usernameOption?.maxLength).toBe(50);
    });
  });
});
