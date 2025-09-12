import { beforeEach, vi } from "vitest";

// Mock external dependencies that are commonly used across the core package
// This prevents actual external calls during testing

// Mock Prisma client
vi.mock("@albion-raid-manager/core/database", () => ({
  prisma: {
    $transaction: vi.fn(),
    server: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    serverMember: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    raid: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    raidSlot: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    session: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    auditConfig: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    build: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    buildPiece: {
      create: vi.fn(),
      createMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
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
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    })),
  },
}));

// Mock cron for scheduler
vi.mock("cron", () => ({
  CronJob: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    destroy: vi.fn(),
  })),
}));

// Global test utilities
declare global {
  // Test helper functions can be added here
  // These will be available in all test files
}

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
