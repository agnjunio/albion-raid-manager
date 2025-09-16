import { beforeEach, vi } from "vitest";

import {
  createMockAuditConfig,
  createMockAxiosError,
  createMockBuild,
  createMockBuildPiece,
  createMockDiscordServer,
  createMockRaid,
  createMockRaidSlot,
  createMockServer,
  createMockServerMember,
  createMockSession,
  createMockUser,
} from "./src/test-helpers";

// Mock the memoize function
vi.mock("@albion-raid-manager/core/cache/memory", () => ({
  memoize: vi.fn((key, fn) => fn()),
}));

// Mock the transformGuild function
vi.mock("@albion-raid-manager/core/utils/discord", () => ({
  transformGuild: vi.fn((guild) => guild),
}));

// Mock Prisma client with proper mock functions
const createMockFn = () => vi.fn();
const createMockPrismaClient = () => ({
  $transaction: createMockFn(),
  server: {
    findUnique: createMockFn(),
    findMany: createMockFn(),
    create: createMockFn(),
    update: createMockFn(),
    upsert: createMockFn(),
    delete: createMockFn(),
  },
  serverMember: {
    findUnique: createMockFn(),
    findMany: createMockFn(),
    create: createMockFn(),
    update: createMockFn(),
    upsert: createMockFn(),
    delete: createMockFn(),
  },
  user: {
    findUnique: createMockFn(),
    findMany: createMockFn(),
    create: createMockFn(),
    update: createMockFn(),
    upsert: createMockFn(),
    delete: createMockFn(),
  },
  raid: {
    findUnique: createMockFn(),
    findMany: createMockFn(),
    create: createMockFn(),
    update: createMockFn(),
    upsert: createMockFn(),
    delete: createMockFn(),
  },
  raidSlot: {
    findUnique: createMockFn(),
    findMany: createMockFn(),
    create: createMockFn(),
    createMany: createMockFn(),
    update: createMockFn(),
    updateMany: createMockFn(),
    upsert: createMockFn(),
    delete: createMockFn(),
  },
  session: {
    findUnique: createMockFn(),
    findMany: createMockFn(),
    create: createMockFn(),
    update: createMockFn(),
    upsert: createMockFn(),
    delete: createMockFn(),
  },
  auditConfig: {
    findUnique: createMockFn(),
    findMany: createMockFn(),
    create: createMockFn(),
    update: createMockFn(),
    upsert: createMockFn(),
    delete: createMockFn(),
  },
  build: {
    create: createMockFn(),
    findUnique: createMockFn(),
    findFirst: createMockFn(),
    findMany: createMockFn(),
    update: createMockFn(),
    delete: createMockFn(),
  },
  buildPiece: {
    create: createMockFn(),
    createMany: createMockFn(),
    findFirst: createMockFn(),
    update: createMockFn(),
    delete: createMockFn(),
  },
});

vi.mock("@albion-raid-manager/core/database", () => ({
  prisma: createMockPrismaClient(),
  RaidStatus: {
    SCHEDULED: "SCHEDULED",
    OPEN: "OPEN",
    CLOSED: "CLOSED",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
  },
  RaidType: {
    FIXED: "FIXED",
    FLEX: "FLEX",
  },
  ContentType: {
    DUNGEON: "DUNGEON",
    ROAD: "ROAD",
    ZVZ: "ZVZ",
    GANK: "GANK",
    OTHER: "OTHER",
  },
  RoleType: {
    TANK: "TANK",
    HEALER: "HEALER",
    DPS: "DPS",
    SUPPORT: "SUPPORT",
  },
  RaidRole: {
    TANK: "TANK",
    SUPPORT: "SUPPORT",
    HEALER: "HEALER",
    RANGED_DPS: "RANGED_DPS",
    MELEE_DPS: "MELEE_DPS",
    BATTLEMOUNT: "BATTLEMOUNT",
  },
  GearSlot: {
    MAIN_HAND: "MAIN_HAND",
    OFF_HAND: "OFF_HAND",
    HEAD: "HEAD",
    BODY: "BODY",
    FEET: "FEET",
    CAPE: "CAPE",
    BAG: "BAG",
    MOUNT: "MOUNT",
    FOOD: "FOOD",
    POTION: "POTION",
    INVENTORY: "INVENTORY",
  },
}));

// Mock Redis client
const mockRedisClient = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  ping: vi.fn().mockResolvedValue("PONG"),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  isOpen: true,
  isReady: true,
};

vi.mock("redis", () => ({
  createClient: vi.fn(() => mockRedisClient),
}));

vi.mock("@albion-raid-manager/core/redis", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    exists: vi.fn(),
    expire: vi.fn(),
    hget: vi.fn(),
    hset: vi.fn(),
    hdel: vi.fn(),
    hgetall: vi.fn(),
  },
}));

// Mock logger
vi.mock("@albion-raid-manager/core/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    verbose: vi.fn(),
  },
}));

// Mock Discord.js (if used in core services)
vi.mock("discord.js", () => ({
  EmbedBuilder: vi.fn().mockImplementation(() => ({
    setTitle: vi.fn().mockReturnThis(),
    setDescription: vi.fn().mockReturnThis(),
    setColor: vi.fn().mockReturnThis(),
    setTimestamp: vi.fn().mockReturnThis(),
    addFields: vi.fn().mockReturnThis(),
    setFooter: vi.fn().mockReturnThis(),
    toJSON: vi.fn(),
  })),
  Colors: {
    Red: 0xff0000,
    Green: 0x00ff00,
    Blue: 0x0000ff,
    Yellow: 0xffff00,
    Orange: 0xffa500,
    Purple: 0x800080,
    Gold: 0xffd700,
    Aqua: 0x00ffff,
    White: 0xffffff,
    Grey: 0x808080,
    DarkGrey: 0x404040,
    DarkBlue: 0x000080,
    DarkRed: 0x800000,
    DarkGreen: 0x008000,
    DarkOrange: 0xff8c00,
    DarkPurple: 0x800080,
    DarkGold: 0xb8860b,
    DarkAqua: 0x008b8b,
    DarkWhite: 0xffffff,
  },
}));

// Mock Axios for external API calls
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    CancelToken: {
      source: vi.fn(() => ({
        token: "mock-cancel-token",
        cancel: vi.fn(),
      })),
    },
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
    })),
  },
  isAxiosError: vi.fn((error) => error?.isAxiosError || false),
}));

// Mock cron for scheduler
vi.mock("cron", () => ({
  CronJob: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    destroy: vi.fn(),
  })),
}));

// Mock Discord API types
vi.mock("discord-api-types/v10", () => ({
  ChannelType: {
    GuildText: 0,
    GuildVoice: 2,
    GuildCategory: 4,
  },
  PermissionFlagsBits: {
    Administrator: 8n,
    ManageGuild: 32n,
    ManageRoles: 268435456n,
  },
}));

// Mock Discord service client
vi.mock("@albion-raid-manager/core/services/discord/client", () => ({
  discordApiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      response: {
        use: vi.fn(),
      },
    },
  },
}));

// Mock Discord service functions
vi.mock("@albion-raid-manager/core/services/discord/servers", () => ({
  getServers: vi.fn(),
  getServer: vi.fn(),
  getServerChannels: vi.fn(),
  leaveServer: vi.fn(),
  getServerMembers: vi.fn(),
  getServerMember: vi.fn(),
  addServerMemberRole: vi.fn(),
  removeServerMemberRole: vi.fn(),
}));

// Mock Discord service index
vi.mock("@albion-raid-manager/core/services/discord", () => ({
  DiscordService: {
    servers: {
      getServers: vi.fn(),
      getServer: vi.fn(),
      getServerChannels: vi.fn(),
      leaveServer: vi.fn(),
      getServerMembers: vi.fn(),
      getServerMember: vi.fn(),
      addServerMemberRole: vi.fn(),
      removeServerMemberRole: vi.fn(),
    },
  },
}));

// Mock config
vi.mock("@albion-raid-manager/core/config", () => ({
  default: {
    discord: {
      token: "test-bot-token",
    },
    logger: {
      level: "info",
    },
    redis: {
      url: "redis://localhost:6379",
    },
    database: {
      url: "postgresql://test:test@localhost:5432/test",
    },
  },
}));

// Mock utils
vi.mock("@albion-raid-manager/core/utils/discord", () => ({
  getAuthorization: vi.fn((type, token) => `${type === "user" ? "Bearer" : "Bot"} ${token}`),
  hasPermissions: vi.fn(() => true),
  transformChannel: vi.fn((channel) => channel),
  transformGuild: vi.fn((guild) => ({
    ...guild,
    admin: false,
    owner: undefined,
  })),
}));

// Mock scheduler
vi.mock("@albion-raid-manager/core/scheduler", () => ({
  sleep: vi.fn().mockResolvedValue(undefined),
}));

// Mock albion service
vi.mock("@albion-raid-manager/core/services/albion", () => ({
  AlbionService: {
    players: {
      getPlayer: vi.fn(),
      searchPlayers: vi.fn(),
    },
    guilds: {
      getGuild: vi.fn(),
      searchGuilds: vi.fn(),
    },
    killboard: {
      getKills: vi.fn(),
      getDeaths: vi.fn(),
    },
  },
}));

// Mock cache utils
vi.mock("@albion-raid-manager/core/cache/utils", () => ({
  CacheKeys: {
    server: vi.fn((id) => `server:${id}`),
    serversByUser: vi.fn((userId) => `servers:user:${userId}`),
    serverMembers: vi.fn((serverId) => `server:${serverId}:members`),
    serverMember: vi.fn((serverId, userId) => `server:${serverId}:member:${userId}`),
    raidsByServer: vi.fn((serverId, hash) => `raids:server:${serverId}:${hash}`),
    itemSearch: vi.fn((searchTerm, hash) => `items:search:${searchTerm}:${hash}`),
    itemDatabase: vi.fn(() => `items:database`),
    build: vi.fn((buildId) => `build:${buildId}`),
    buildsByServer: vi.fn((serverId, hash) => `builds:server:${serverId}:${hash}`),
    hashObject: vi.fn((obj) => JSON.stringify(obj).replace(/[^a-zA-Z0-9]/g, "")),
  },
  withCache: vi.fn((fn) => fn()),
}));

// Mock cache invalidation
vi.mock("@albion-raid-manager/core/cache/redis", () => ({
  CacheInvalidation: {
    invalidateUser: vi.fn().mockResolvedValue(undefined),
    invalidateServerMember: vi.fn().mockResolvedValue(undefined),
  },
}));

// Global test utilities
declare global {
  // Test helper functions can be added here
  // These will be available in all test files
  var createMockAxiosError: (
    status: number,
    message?: string,
  ) => Error & {
    isAxiosError: boolean;
    response: {
      status: number;
      statusText: string;
      data: { message: string };
      headers: Record<string, unknown>;
      config: Record<string, unknown>;
    };
  };
  var createMockDiscordServer: (overrides?: Record<string, unknown>) => Record<string, unknown>;
  var createMockUser: (overrides?: Record<string, unknown>) => Record<string, unknown>;
  var createMockRaid: (overrides?: Record<string, unknown>) => Record<string, unknown>;
  var createMockServer: (overrides?: Record<string, unknown>) => Record<string, unknown>;
  var createMockServerMember: (overrides?: Record<string, unknown>) => Record<string, unknown>;
  var createMockRaidSlot: (overrides?: Record<string, unknown>) => Record<string, unknown>;
  var createMockSession: (overrides?: Record<string, unknown>) => Record<string, unknown>;
  var createMockAuditConfig: (overrides?: Record<string, unknown>) => Record<string, unknown>;
  var createMockBuild: (overrides?: Record<string, unknown>) => Record<string, unknown>;
  var createMockBuildPiece: (overrides?: Record<string, unknown>) => Record<string, unknown>;
}

// Make test helpers globally available
global.createMockAxiosError = createMockAxiosError;
global.createMockDiscordServer = createMockDiscordServer;
global.createMockUser = createMockUser;
global.createMockRaid = createMockRaid;
global.createMockServer = createMockServer;
global.createMockServerMember = createMockServerMember;
global.createMockRaidSlot = createMockRaidSlot;
global.createMockSession = createMockSession;
global.createMockAuditConfig = createMockAuditConfig;
global.createMockBuild = createMockBuild;
global.createMockBuildPiece = createMockBuildPiece;

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
