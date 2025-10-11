import { vi } from "vitest";

// Mock factories for reusable test data
export const createMockUser = (overrides = {}) => ({
  id: "user123",
  username: "testuser",
  avatar: "avatar.png",
  ...overrides,
});

export const createMockGuild = (overrides = {}) => ({
  id: "guild123",
  name: "Test Guild",
  iconURL: vi.fn(() => "guild-icon.png"),
  channels: {
    cache: {
      get: vi.fn(),
    },
  },
  ...overrides,
});

export const createMockInteraction = (overrides = {}) => ({
  guild: createMockGuild(),
  user: createMockUser(),
  member: {
    user: createMockUser(),
    nickname: "TestUser",
  },
  isChatInputCommand: vi.fn(() => true),
  options: {
    getSubcommand: vi.fn(),
    getString: vi.fn(),
    getInteger: vi.fn(),
  },
  reply: vi.fn(),
  ...overrides,
});

export const createMockRaid = (overrides = {}) => ({
  id: "raid123",
  title: "Test Raid",
  description: "Test Description",
  date: new Date("2024-12-31T20:00:00Z"),
  type: "FIXED",
  contentType: "GROUP_DUNGEON",
  status: "SCHEDULED",
  serverId: "guild123",
  slots: [
    { id: "slot1", name: "CALLER 1", role: "CALLER" },
    { id: "slot2", name: "TANK 1", role: "TANK" },
  ],
  ...overrides,
});

export const createMockServer = (overrides = {}) => ({
  id: "guild123",
  name: "Test Guild",
  raidAnnouncementChannelId: "channel123",
  auditChannelId: "audit123",
  memberRoleId: "member123",
  registeredRoleId: "friend123",
  serverGuildId: "albion123",
  ...overrides,
});

export const createMockChannel = (overrides = {}) => ({
  id: "channel123",
  name: "test-channel",
  isTextBased: vi.fn(() => true),
  send: vi.fn(),
  messages: {
    fetch: vi.fn(),
  },
  ...overrides,
});

export const createMockMessage = (overrides = {}) => ({
  id: "message123",
  content: "Test message",
  author: createMockUser(),
  channel: createMockChannel(),
  edit: vi.fn(),
  delete: vi.fn(),
  ...overrides,
});

// Helper functions for common test scenarios
export const createMockInteractionWithSubcommand = (subcommand: string, options = {}) => {
  return createMockInteraction({
    options: {
      getSubcommand: vi.fn(() => subcommand),
      getString: vi.fn(),
      getInteger: vi.fn(),
      ...options,
    },
  });
};

export const createMockInteractionWithOptions = (optionValues: Record<string, any>) => {
  return createMockInteraction({
    options: {
      getSubcommand: vi.fn(),
      getString: vi.fn((name: string) => optionValues[name] || null),
      getInteger: vi.fn((name: string) => optionValues[name] || null),
    },
  });
};

export const createMockRaidWithSlots = (slotCount: number, overrides = {}) => {
  const slots = Array.from({ length: slotCount }, (_, i) => ({
    id: `slot${i + 1}`,
    name: `SLOT ${i + 1}`,
    role: "MELEE_DPS",
    userId: i % 2 === 0 ? `user${i + 1}` : null,
  }));

  return createMockRaid({
    slots,
    ...overrides,
  });
};

export const createMockFutureDate = (daysFromNow = 1) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

export const createMockPastDate = (daysAgo = 1) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

export const createMockDateString = (date: Date) => {
  return date.toISOString().split("T")[0] + " 20:00";
};
