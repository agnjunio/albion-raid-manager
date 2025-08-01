import { configCommand } from "@/modules/config/command";
import { prisma } from "@albion-raid-manager/database";
import { logger } from "@albion-raid-manager/logger";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@albion-raid-manager/database", () => ({
  prisma: {
    server: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@albion-raid-manager/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe("configCommand", () => {
  const mockInteraction = {
    isChatInputCommand: () => true,
    guild: {
      id: "test-guild-id",
      name: "Test Guild",
      members: {
        fetch: vi.fn(),
      },
    },
    user: {
      id: "test-user-id",
    },
    options: {
      getSubcommand: vi.fn(),
      getRole: vi.fn(),
      getString: vi.fn(),
      getChannel: vi.fn(),
    },
    deferReply: vi.fn().mockResolvedValue(undefined),
    editReply: vi.fn().mockResolvedValue(undefined),
    reply: vi.fn().mockResolvedValue(undefined),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("audit subcommand", () => {
    beforeEach(() => {
      mockInteraction.options.getSubcommand.mockReturnValue("audit");

      // Mock admin permissions
      mockInteraction.guild.members.fetch.mockResolvedValue({
        permissions: {
          has: vi.fn().mockReturnValue(true),
        },
      });
    });

    it("should configure audit channel when channel is provided", async () => {
      const mockPrisma = vi.mocked(prisma);
      const mockChannel = {
        id: "test-channel-id",
        name: "audit-channel",
      };

      mockInteraction.options.getChannel.mockReturnValue(mockChannel);
      mockPrisma.server.update.mockResolvedValue({} as any);

      await configCommand.execute(mockInteraction);

      expect(mockPrisma.server.update).toHaveBeenCalledWith({
        where: { id: "test-guild-id" },
        data: { auditChannelId: "test-channel-id" },
      });

      expect(mockInteraction.editReply).toHaveBeenCalledWith({
        content: expect.stringContaining("✅ Audit channel configured successfully!"),
      });
    });

    it("should disable audit channel when no channel is provided", async () => {
      const mockPrisma = vi.mocked(prisma);

      mockInteraction.options.getChannel.mockReturnValue(null);
      mockPrisma.server.update.mockResolvedValue({} as any);

      await configCommand.execute(mockInteraction);

      expect(mockPrisma.server.update).toHaveBeenCalledWith({
        where: { id: "test-guild-id" },
        data: { auditChannelId: null },
      });

      expect(mockInteraction.editReply).toHaveBeenCalledWith({
        content: expect.stringContaining("✅ Audit channel disabled successfully!"),
      });
    });
  });

  describe("view subcommand", () => {
    beforeEach(() => {
      mockInteraction.options.getSubcommand.mockReturnValue("view");

      // Mock admin permissions
      mockInteraction.guild.members.fetch.mockResolvedValue({
        permissions: {
          has: vi.fn().mockReturnValue(true),
        },
      });
    });

    it("should display audit channel in configuration view", async () => {
      const mockPrisma = vi.mocked(prisma);

      mockPrisma.server.findUnique.mockResolvedValue({
        memberRoleId: "member-role-id",
        friendRoleId: "friend-role-id",
        serverGuildId: "test-guild-id",
        auditChannelId: "audit-channel-id",
      } as any);

      await configCommand.execute(mockInteraction);

      expect(mockInteraction.editReply).toHaveBeenCalledWith({
        content: expect.stringContaining("• Audit Channel: <#audit-channel-id>"),
      });
    });

    it("should not display audit channel when not configured", async () => {
      const mockPrisma = vi.mocked(prisma);

      mockPrisma.server.findUnique.mockResolvedValue({
        memberRoleId: "member-role-id",
        friendRoleId: "friend-role-id",
        serverGuildId: "test-guild-id",
        auditChannelId: null,
      } as any);

      await configCommand.execute(mockInteraction);

      expect(mockInteraction.editReply).toHaveBeenCalledWith({
        content: expect.not.stringContaining("Audit Channel"),
      });
    });
  });

  describe("permission checks", () => {
    it("should reject non-administrators", async () => {
      mockInteraction.options.getSubcommand.mockReturnValue("audit");

      // Mock non-admin permissions
      mockInteraction.guild.members.fetch.mockResolvedValue({
        permissions: {
          has: vi.fn().mockReturnValue(false),
        },
      });

      await configCommand.execute(mockInteraction);

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: "❌ You need Administrator permissions to configure server settings.",
        flags: expect.any(Number),
      });
    });
  });

  describe("error handling", () => {
    it("should handle database errors gracefully", async () => {
      const mockPrisma = vi.mocked(prisma);
      const mockLogger = vi.mocked(logger);

      mockInteraction.options.getSubcommand.mockReturnValue("audit");
      mockInteraction.guild.members.fetch.mockResolvedValue({
        permissions: {
          has: vi.fn().mockReturnValue(true),
        },
      });

      mockPrisma.server.update.mockRejectedValue(new Error("Database error"));

      await configCommand.execute(mockInteraction);

      expect(mockLogger.error).toHaveBeenCalledWith("Error in config command:", expect.any(Error));
      expect(mockInteraction.editReply).toHaveBeenCalledWith({
        content: "❌ An error occurred while configuring server settings.",
      });
    });
  });

  describe("command structure", () => {
    it("should have audit subcommand in command data", () => {
      const commandData = configCommand.data;

      expect(commandData.options).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "audit",
            description: "Configure audit channel for bot events",
          }),
        ]),
      );
    });

    it("should have channel option in audit subcommand", () => {
      const commandData = configCommand.data;
      const auditSubcommand = commandData.options?.find((option) => option.name === "audit");

      expect(auditSubcommand?.options).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "channel",
            description: "Channel to send audit messages to",
            required: false,
          }),
        ]),
      );
    });
  });
});
