import { vi } from "vitest";

// Set up test environment variables
process.env.AI_ENABLED = "true";
process.env.AI_PROVIDER = "openai";
process.env.OPENAI_API_KEY = "test-key";
process.env.ANTHROPIC_API_KEY = "test-key";
process.env.DISCORD_TOKEN = "test-discord-token";
process.env.DISCORD_CLIENT_ID = "test-client-id";

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
vi.mock("@albion-raid-manager/core", () => ({
  getErrorMessage: vi.fn((error: unknown) => {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }),
}));

vi.mock("@albion-raid-manager/core/cache", () => ({
  runIfChanged: vi.fn((key: string, fn: () => any) => fn()),
}));

vi.mock("@albion-raid-manager/core/entities", () => ({
  getContentTypeInfo: vi.fn(() => ({ name: "Test Content", description: "Test Description" })),
}));

vi.mock("@albion-raid-manager/core/types", () => ({
  Raid: vi.fn(),
  RaidRole: vi.fn(),
  RaidSlot: vi.fn(),
  Server: vi.fn(),
}));

vi.mock("@albion-raid-manager/ai", () => ({
  DiscordMessageContext: vi.fn(),
  parseDiscordMessage: vi.fn(() =>
    Promise.resolve({
      isRaidMessage: true,
      raidData: {
        title: "Test Raid",
        date: new Date(),
        location: "Test Location",
        contentType: "GROUP_DUNGEON",
      },
    }),
  ),
  ParsedRaidData: vi.fn(),
}));
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
      findUnique: vi.fn(),
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
  // Export enums for testing
  RaidStatus: {
    SCHEDULED: "SCHEDULED",
    OPEN: "OPEN",
    CLOSED: "CLOSED",
    ONGOING: "ONGOING",
    FINISHED: "FINISHED",
  },
  RaidType: {
    FIXED: "FIXED",
    FLEX: "FLEX",
  },
  ContentType: {
    GROUP_DUNGEON: "GROUP_DUNGEON",
    AVALONIAN_DUNGEON_FULL_CLEAR: "AVALONIAN_DUNGEON_FULL_CLEAR",
    AVALONIAN_DUNGEON_BUFF_ONLY: "AVALONIAN_DUNGEON_BUFF_ONLY",
    ROADS_OF_AVALON_PVE: "ROADS_OF_AVALON_PVE",
    ROADS_OF_AVALON_PVP: "ROADS_OF_AVALON_PVP",
    HELLGATE_2V2: "HELLGATE_2V2",
    HELLGATE_5V5: "HELLGATE_5V5",
    HELLGATE_10V10: "HELLGATE_10V10",
    ZVZ_CALL_TO_ARMS: "ZVZ_CALL_TO_ARMS",
    GANKING_SQUAD: "GANKING_SQUAD",
    FIGHTING_SQUAD: "FIGHTING_SQUAD",
    OPEN_WORLD_FARMING: "OPEN_WORLD_FARMING",
    OTHER: "OTHER",
  },
  RaidRole: {
    CALLER: "CALLER",
    TANK: "TANK",
    HEALER: "HEALER",
    SUPPORT: "SUPPORT",
    MELEE_DPS: "MELEE_DPS",
    RANGED_DPS: "RANGED_DPS",
    BATTLEMOUNT: "BATTLEMOUNT",
  },
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
  IntentsBitField: {
    Flags: {
      Guilds: 1,
      GuildMembers: 2,
      GuildMessages: 4,
      MessageContent: 8,
    },
  },
  Partials: {
    Channel: 1,
    Message: 2,
    Reaction: 3,
    User: 4,
    GuildMember: 5,
  },
  Events: {
    ShardReady: "shardReady",
    Ready: "ready",
    InteractionCreate: "interactionCreate",
    MessageCreate: "messageCreate",
  },
  SlashCommandBuilder: vi.fn().mockImplementation(() => ({
    setName: vi.fn().mockReturnThis(),
    setDescription: vi.fn().mockReturnThis(),
    setDefaultMemberPermissions: vi.fn().mockReturnThis(),
    addStringOption: vi.fn().mockReturnThis(),
    addUserOption: vi.fn().mockReturnThis(),
    addRoleOption: vi.fn().mockReturnThis(),
    addChannelOption: vi.fn().mockReturnThis(),
    addIntegerOption: vi.fn().mockReturnThis(),
    addSubcommand: vi.fn().mockReturnThis(),
    toJSON: vi.fn().mockReturnValue({}),
    name: "",
    description: "",
    options: [],
  })),
  SlashCommandSubcommandBuilder: vi.fn().mockImplementation(() => ({
    setName: vi.fn().mockReturnThis(),
    setDescription: vi.fn().mockReturnThis(),
    addStringOption: vi.fn().mockReturnThis(),
    addIntegerOption: vi.fn().mockReturnThis(),
  })),
  PermissionFlagsBits: {
    ManageEvents: "ManageEvents",
  },
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
  REST: vi.fn().mockImplementation(() => ({
    setToken: vi.fn().mockReturnThis(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  })),
  Routes: {
    applicationCommands: vi.fn(),
  },
  Collection: vi.fn().mockImplementation(() => ({
    set: vi.fn(),
    get: vi.fn(),
    has: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
    size: 0,
  })),
}));

// Import test helpers and make them globally available
import {
  createMockChannel,
  createMockDateString,
  createMockFutureDate,
  createMockGuild,
  createMockInteraction,
  createMockInteractionWithOptions,
  createMockInteractionWithSubcommand,
  createMockMessage,
  createMockPastDate,
  createMockRaid,
  createMockRaidWithSlots,
  createMockServer,
  createMockUser,
} from "./src/test-helpers";

// Make test helpers globally available
global.createMockUser = createMockUser;
global.createMockGuild = createMockGuild;
global.createMockInteraction = createMockInteraction;
global.createMockRaid = createMockRaid;
global.createMockServer = createMockServer;
global.createMockChannel = createMockChannel;
global.createMockMessage = createMockMessage;
global.createMockInteractionWithSubcommand = createMockInteractionWithSubcommand;
global.createMockInteractionWithOptions = createMockInteractionWithOptions;
global.createMockRaidWithSlots = createMockRaidWithSlots;
global.createMockFutureDate = createMockFutureDate;
global.createMockPastDate = createMockPastDate;
global.createMockDateString = createMockDateString;
