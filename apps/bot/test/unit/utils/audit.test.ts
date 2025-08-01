import { sendAuditMessage } from "@/utils/audit";
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

describe("sendAuditMessage", () => {
  const mockClient = {
    guilds: {
      cache: {
        get: vi.fn(),
      },
    },
  } as any;

  const mockMember = {
    user: {
      tag: "TestUser#1234",
      id: "123456789",
    },
    nickname: "TestNick",
    roles: {
      cache: {
        find: vi.fn(),
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

  const mockAuditChannel = {
    isTextBased: () => true,
    send: vi.fn().mockResolvedValue({ id: "mock-message-id" }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("when audit channel is not configured", () => {
    it("should return early without sending message", async () => {
      const mockPrisma = vi.mocked(prisma);
      mockPrisma.server.findUnique.mockResolvedValue({
        auditChannelId: null,
        name: "Test Server",
      });

      await sendAuditMessage(mockClient, "test-server-id", mockMember, mockAlbionData);

      expect(mockPrisma.server.findUnique).toHaveBeenCalledWith({
        where: { id: "test-server-id" },
        select: {
          auditChannelId: true,
          name: true,
        },
      });
      expect(mockClient.guilds.cache.get).not.toHaveBeenCalled();
    });
  });

  describe("when guild is not found", () => {
    it("should log warning and return early", async () => {
      const mockPrisma = vi.mocked(prisma);
      const mockLogger = vi.mocked(logger);

      mockPrisma.server.findUnique.mockResolvedValue({
        auditChannelId: "test-channel-id",
        name: "Test Server",
      });
      mockClient.guilds.cache.get.mockReturnValue(null);

      await sendAuditMessage(mockClient, "test-server-id", mockMember, mockAlbionData);

      expect(mockLogger.warn).toHaveBeenCalledWith("Guild not found for audit message: test-server-id");
    });
  });

  describe("when audit channel is not a text channel", () => {
    it("should log warning and return early", async () => {
      const mockPrisma = vi.mocked(prisma);
      const mockLogger = vi.mocked(logger);

      mockPrisma.server.findUnique.mockResolvedValue({
        auditChannelId: "test-channel-id",
        name: "Test Server",
      });

      const mockGuild = {
        channels: {
          fetch: vi.fn().mockResolvedValue({
            isTextBased: () => false,
          }),
        },
      };
      mockClient.guilds.cache.get.mockReturnValue(mockGuild);

      await sendAuditMessage(mockClient, "test-server-id", mockMember, mockAlbionData);

      expect(mockLogger.warn).toHaveBeenCalledWith("Audit channel not found or not a text channel: test-channel-id");
    });
  });

  describe("when audit channel is properly configured", () => {
    it("should send registration audit message", async () => {
      const mockPrisma = vi.mocked(prisma);
      const mockLogger = vi.mocked(logger);

      mockPrisma.server.findUnique.mockResolvedValue({
        auditChannelId: "test-channel-id",
        name: "Test Server",
      });

      const mockGuild = {
        channels: {
          fetch: vi.fn().mockResolvedValue(mockAuditChannel),
        },
      };
      mockClient.guilds.cache.get.mockReturnValue(mockGuild);

      await sendAuditMessage(mockClient, "test-server-id", mockMember, mockAlbionData, "registration");

      expect(mockAuditChannel.send).toHaveBeenCalledWith({
        embeds: [
          expect.objectContaining({
            data: expect.objectContaining({
              title: "👤 User Registration",
              color: 0x00ff00,
            }),
          }),
        ],
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Sent audit message for registration to channel test-channel-id",
        expect.objectContaining({
          serverId: "test-server-id",
          userId: "123456789",
          action: "registration",
        }),
      );
    });

    it("should send role assignment audit message with role information", async () => {
      const mockPrisma = vi.mocked(prisma);
      const mockLogger = vi.mocked(logger);

      mockPrisma.server.findUnique.mockResolvedValue({
        auditChannelId: "test-channel-id",
        name: "Test Server",
      });

      const mockGuild = {
        channels: {
          fetch: vi.fn().mockResolvedValue(mockAuditChannel),
        },
      };
      mockClient.guilds.cache.get.mockReturnValue(mockGuild);

      // Mock role detection
      mockMember.roles.cache.find
        .mockReturnValueOnce({ name: "Member", id: "member-role-id" })
        .mockReturnValueOnce({ name: "Friend", id: "friend-role-id" });

      await sendAuditMessage(mockClient, "test-server-id", mockMember, mockAlbionData, "role_assignment");

      expect(mockAuditChannel.send).toHaveBeenCalledWith({
        embeds: [
          expect.objectContaining({
            data: expect.objectContaining({
              title: "👤 User Role Assignment",
              color: 0x0099ff,
            }),
          }),
        ],
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Sent audit message for role_assignment to channel test-channel-id",
        expect.objectContaining({
          serverId: "test-server-id",
          userId: "123456789",
          action: "role_assignment",
        }),
      );
    });
  });

  describe("when sending message fails", () => {
    it("should log error but not throw", async () => {
      const mockPrisma = vi.mocked(prisma);
      const mockLogger = vi.mocked(logger);

      mockPrisma.server.findUnique.mockResolvedValue({
        auditChannelId: "test-channel-id",
        name: "Test Server",
      });

      const mockGuild = {
        channels: {
          fetch: vi.fn().mockResolvedValue({
            ...mockAuditChannel,
            send: vi.fn().mockRejectedValue(new Error("Discord API error")),
          }),
        },
      };
      mockClient.guilds.cache.get.mockReturnValue(mockGuild);

      await expect(sendAuditMessage(mockClient, "test-server-id", mockMember, mockAlbionData)).resolves.not.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to send audit message for registration:",
        expect.any(Error),
      );
    });
  });

  describe("embed content validation", () => {
    it("should include all required fields in the embed", async () => {
      const mockPrisma = vi.mocked(prisma);

      mockPrisma.server.findUnique.mockResolvedValue({
        auditChannelId: "test-channel-id",
        name: "Test Server",
      });

      const mockGuild = {
        channels: {
          fetch: vi.fn().mockResolvedValue(mockAuditChannel),
        },
      };
      mockClient.guilds.cache.get.mockReturnValue(mockGuild);

      await sendAuditMessage(mockClient, "test-server-id", mockMember, mockAlbionData);

      const sentMessage = mockAuditChannel.send.mock.calls[0][0];
      const embed = sentMessage.embeds[0];

      expect(embed.data.fields).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Discord User",
            value: "TestUser#1234 (123456789)",
          }),
          expect.objectContaining({
            name: "Nickname",
            value: "TestNick",
          }),
          expect.objectContaining({
            name: "Albion Character",
            value: "TestPlayer",
          }),
          expect.objectContaining({
            name: "Guild",
            value: "TestGuild",
          }),
          expect.objectContaining({
            name: "Kill Fame",
            value: "1,000,000",
          }),
          expect.objectContaining({
            name: "Death Fame",
            value: "50,000",
          }),
          expect.objectContaining({
            name: "Fame Ratio",
            value: "95.0%",
          }),
        ]),
      );
    });
  });
});
