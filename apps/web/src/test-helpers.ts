// Basic test data factories
export const createMockUser = (overrides = {}) => ({
  id: "user123",
  discordId: "discord123",
  username: "testuser",
  avatar: "https://example.com/avatar.jpg",
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
  ...overrides,
});

export const createMockServer = (overrides = {}) => ({
  id: "server123",
  discordId: "guild123",
  name: "Test Guild",
  icon: "https://example.com/guild-icon.jpg",
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
  ...overrides,
});

export const createMockRaid = (overrides = {}) => ({
  id: "raid123",
  title: "Test Raid",
  description: "A test raid for testing purposes",
  date: new Date("2024-12-31T20:00:00Z"),
  status: "SCHEDULED",
  type: "FIXED",
  contentType: "GROUP_DUNGEON",
  location: "Test Location",
  maxParticipants: 10,
  serverId: "server123",
  createdById: "user123",
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
  ...overrides,
});

export const createMockRaidSlot = (overrides = {}) => ({
  id: "slot123",
  raidId: "raid123",
  role: "TANK",
  userId: "user123",
  isReserved: false,
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
  ...overrides,
});

export const createMockFormData = (overrides = {}) => ({
  title: "Test Raid",
  description: "A test raid",
  date: "2024-12-31",
  time: "20:00",
  type: "FIXED",
  contentType: "GROUP_DUNGEON",
  location: "Test Location",
  maxParticipants: 10,
  ...overrides,
});

export const createMockApiResponse = <T>(data: T, overrides = {}) => ({
  success: true,
  data,
  message: "Success",
  ...overrides,
});

// Date helpers
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

// Test data generators
export const generateMockRaids = (count: number, overrides = {}) => {
  return Array.from({ length: count }, (_, index) =>
    createMockRaid({
      id: `raid${index + 1}`,
      title: `Test Raid ${index + 1}`,
      ...overrides,
    }),
  );
};

export const generateMockUsers = (count: number, overrides = {}) => {
  return Array.from({ length: count }, (_, index) =>
    createMockUser({
      id: `user${index + 1}`,
      username: `testuser${index + 1}`,
      ...overrides,
    }),
  );
};

export const generateMockServers = (count: number, overrides = {}) => {
  return Array.from({ length: count }, (_, index) =>
    createMockServer({
      id: `server${index + 1}`,
      name: `Test Guild ${index + 1}`,
      ...overrides,
    }),
  );
};
