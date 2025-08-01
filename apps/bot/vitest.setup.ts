import { vi } from "vitest";

// Set up test environment variables
process.env.AI_ENABLED = "true";
process.env.AI_PROVIDER = "openai";
process.env.OPENAI_API_KEY = "test-key";
process.env.ANTHROPIC_API_KEY = "test-key";

// Mock axios
vi.mock("axios", () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPut = vi.fn();
  const mockDelete = vi.fn();

  return {
    default: {
      get: mockGet,
      post: mockPost,
      put: mockPut,
      delete: mockDelete,
    },
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
  };
});

// Mock OpenAI
vi.mock("openai", () => {
  const mockCreate = vi.fn();
  return {
    OpenAI: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    })),
  };
});

// Mock Anthropic
vi.mock("@anthropic-ai/sdk", () => {
  const mockCreate = vi.fn();
  return {
    Anthropic: vi.fn().mockImplementation(() => ({
      messages: {
        create: mockCreate,
      },
    })),
  };
});

vi.mock("@albion-raid-manager/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("@albion-raid-manager/config", () => ({
  config: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock("@albion-raid-manager/albion", async () => {
  const actual = await vi.importActual<typeof import("@albion-raid-manager/albion")>("@albion-raid-manager/albion");
  return {
    ...actual,
    verifyAlbionPlayer: vi.fn(),
    AlbionUser: vi.fn().mockImplementation(() => ({})),
  };
});
vi.mock("@albion-raid-manager/core");
vi.mock("@albion-raid-manager/config");
vi.mock("@albion-raid-manager/database", () => ({
  prisma: {
    server: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      create: vi.fn(),
    },
    serverMember: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    raid: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    raidSlot: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(vi.mocked({}))),
  },
  ensureUserAndServer: vi.fn(),
}));
vi.mock("@albion-raid-manager/discord", () => ({
  getGuildMember: vi.fn(),
  sendAuditMessage: vi.fn(),
}));
vi.mock("@albion-raid-manager/logger");

// Mock local discord utils
vi.mock("@/utils/discord", () => ({
  getGuild: vi.fn(),
  getGuildMember: vi.fn(),
}));

// Mock Discord.js
vi.mock("discord.js", () => ({
  Client: vi.fn().mockImplementation(() => ({
    login: vi.fn(),
    on: vi.fn(),
    user: {
      setActivity: vi.fn(),
    },
  })),
  GatewayIntentBits: {
    Guilds: 1,
    GuildMembers: 2,
    GuildMessages: 4,
  },
  Partials: {
    Channel: 1,
  },
  SlashCommandBuilder: vi.fn().mockImplementation(() => ({
    setName: vi.fn().mockReturnThis(),
    setDescription: vi.fn().mockReturnThis(),
    addStringOption: vi.fn().mockReturnThis(),
    addUserOption: vi.fn().mockReturnThis(),
    addRoleOption: vi.fn().mockReturnThis(),
    addChannelOption: vi.fn().mockReturnThis(),
    addSubcommand: vi.fn().mockReturnThis(),
    toJSON: vi.fn().mockReturnValue({}),
    name: "",
    description: "",
    options: [],
  })),
  EmbedBuilder: vi.fn().mockImplementation(() => ({
    setTitle: vi.fn().mockReturnThis(),
    setDescription: vi.fn().mockReturnThis(),
    setColor: vi.fn().mockReturnThis(),
    addFields: vi.fn().mockReturnThis(),
    setTimestamp: vi.fn().mockReturnThis(),
    setFooter: vi.fn().mockReturnThis(),
    data: {
      title: "Mock Title",
      description: "Mock Description",
      color: 0x00ff00,
      fields: [],
      timestamp: new Date().toISOString(),
      footer: { text: "Mock Footer" },
    },
  })),
  ActionRowBuilder: vi.fn().mockImplementation(() => ({
    addComponents: vi.fn().mockReturnThis(),
  })),
  ButtonBuilder: vi.fn().mockImplementation(() => ({
    setCustomId: vi.fn().mockReturnThis(),
    setLabel: vi.fn().mockReturnThis(),
    setStyle: vi.fn().mockReturnThis(),
  })),
  ButtonStyle: {
    Primary: 1,
    Secondary: 2,
    Success: 3,
    Danger: 4,
  },
  Colors: {
    Red: 0xff0000,
    Green: 0x00ff00,
    Blue: 0x0000ff,
    Yellow: 0xffff00,
  },
  ApplicationCommandOptionType: {
    String: 3,
    User: 6,
    Role: 8,
    Channel: 7,
  },
  ChannelType: {
    GuildText: 0,
    GuildVoice: 2,
  },
  MessageFlags: {
    Ephemeral: 64,
  },
}));
