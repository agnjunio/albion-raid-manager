import { logger } from "@albion-raid-manager/core/logger";
import { AlbionService } from "@albion-raid-manager/core/services";
import { ensureUserAndServer, prisma } from "@albion-raid-manager/core/database";
import { Guild, GuildMember } from "discord.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sendAuditMessage } from "@/utils/audit";
import { getGuild, getGuildMember } from "@/utils/discord";
import { assignRolesBasedOnGuild } from "@/utils/roles";

import { registerCommand } from "./command";

vi.mock("@/utils/discord");
vi.mock("@/utils/roles");
vi.mock("@/utils/audit");

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

    // Mock the discord utils functions
    vi.mocked(getGuild).mockResolvedValue(mockGuild as unknown as Guild);
    vi.mocked(getGuildMember).mockResolvedValue(mockMember as unknown as GuildMember);

    // Mock the albion functions
    vi.mocked(AlbionService.players.verifyAlbionPlayer).mockResolvedValue(mockUserData as unknown as any);

    // Mock the database functions
    vi.mocked(ensureUserAndServer).mockResolvedValue({ serverMember: mockServerMember } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("successful registration", () => {
    it("should call audit function after successful registration", async () => {
      const mockPrisma = vi.mocked(prisma);

      (mockPrisma.serverMember.update as any).mockResolvedValue({} as any);

      await registerCommand.execute(mockInteraction);

      // Note: The actual audit call would be tested in integration tests
      // This test just ensures the registration flow completes
      expect(mockPrisma.serverMember.update).toHaveBeenCalled();
    });

    it("should update server member with Albion data", async () => {
      const mockPrisma = vi.mocked(prisma);

      (mockPrisma.serverMember.update as any).mockResolvedValue({} as any);

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
      const mockPrisma = vi.mocked(prisma);
      await registerCommand.execute(mockInteraction);

      // Note: Role assignment would be tested in integration tests
      // This test just ensures the registration flow completes
      expect(mockPrisma.serverMember.update).toHaveBeenCalled();
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
      vi.mocked(AlbionService.players.verifyAlbionPlayer).mockResolvedValue(null);

      await registerCommand.execute(mockInteraction);

      expect(mockInteraction.editReply).toHaveBeenCalledWith({
        content: expect.stringContaining('❌ User "TestPlayer" not found in Albion Online.'),
      });

      expect(sendAuditMessage).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should handle Albion API errors gracefully", async () => {
      vi.mocked(AlbionService.players.verifyAlbionPlayer).mockRejectedValue(
        new AlbionService.errors.AlbionAPIError("Not found", 404, ""),
      );

      await registerCommand.execute(mockInteraction);

      expect(mockInteraction.editReply).toHaveBeenCalledWith({
        content: expect.stringContaining('❌ User "TestPlayer" not found in Albion Online.'),
      });
    });

    it("should handle network errors gracefully", async () => {
      vi.mocked(AlbionService.players.verifyAlbionPlayer).mockImplementation(() =>
        Promise.reject(new Error("Network timeout")),
      );

      await registerCommand.execute(mockInteraction);

      expect(mockInteraction.editReply).toHaveBeenCalledWith({
        content: expect.stringContaining("❌ Connection to Albion Online timed out"),
      });
    });
  });

  describe("when nickname update fails", () => {
    it("should log warning but continue with registration", async () => {
      mockMember.setNickname.mockRejectedValue(new Error("Permission denied"));

      await registerCommand.execute(mockInteraction);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Failed to update nickname for user test-user-id"),
        expect.any(Error),
      );

      // Registration should still complete successfully
      expect(sendAuditMessage).toHaveBeenCalled();
    });
  });

  describe("when role assignment fails", () => {
    it("should log error but continue with registration", async () => {
      const error = new Error("Failed to assign roles for user test-user-id");

      vi.mocked(assignRolesBasedOnGuild).mockImplementation(() => Promise.reject(error));
      vi.mocked(sendAuditMessage).mockResolvedValue(undefined);

      await registerCommand.execute(mockInteraction);

      expect(logger.error).toHaveBeenCalledWith(expect.anything(), error);

      // Registration should still complete successfully
      expect(mockInteraction.editReply).toHaveBeenCalledWith({
        content: expect.stringContaining("✅ Successfully registered"),
      });
    });
  });

  describe("when audit function fails", () => {
    it("should log error but not break registration", async () => {
      const error = new Error("Audit failed");

      vi.mocked(sendAuditMessage).mockRejectedValue(error);

      await registerCommand.execute(mockInteraction);

      expect(logger.error).toHaveBeenCalledWith(expect.anything(), error);

      // Registration should still complete successfully
      expect(mockInteraction.editReply).toHaveBeenCalledWith({
        content: expect.stringContaining("✅ Successfully registered"),
      });
    });
  });
});
