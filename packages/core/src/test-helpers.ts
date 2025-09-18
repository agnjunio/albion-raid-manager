/**
 * Test helper functions for the core package
 * These utilities make it easier to create mock objects and test data
 */

/**
 * Creates a mock Axios error with the specified status and message
 * @param status HTTP status code
 * @param message Error message
 * @returns Mock Axios error object
 */
export function createMockAxiosError(status: number, message = "Request failed") {
  const error = new Error(message) as Error & {
    isAxiosError: boolean;
    response: {
      status: number;
      statusText: string;
      data: { message: string };
      headers: Record<string, unknown>;
      config: Record<string, unknown>;
    };
  };
  error.isAxiosError = true;
  error.response = {
    status,
    statusText: status === 404 ? "Not Found" : "Internal Server Error",
    data: { message },
    headers: {},
    config: {},
  };
  return error;
}

/**
 * Creates a mock Discord server object
 * @param overrides Optional properties to override defaults
 * @returns Mock Discord server object
 */
export function createMockDiscordServer(overrides: Record<string, unknown> = {}) {
  return {
    id: "guild123",
    name: "Test Guild",
    icon: "test-icon",
    admin: false,
    owner: undefined,
    ...overrides,
  };
}

/**
 * Creates a mock Discord user object
 * @param overrides Optional properties to override defaults
 * @returns Mock Discord user object
 */
export function createMockUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "user123",
    username: "testuser",
    discriminator: "0001",
    avatar: "test-avatar",
    ...overrides,
  };
}

/**
 * Creates a mock raid object
 * @param overrides Optional properties to override defaults
 * @returns Mock raid object
 */
export function createMockRaid(overrides: Record<string, unknown> = {}) {
  return {
    id: "raid123",
    title: "Test Raid",
    description: "A test raid",
    date: new Date("2024-12-31T20:00:00Z"),
    type: "FIXED",
    contentType: "ROADS_OF_AVALON",
    maxPlayers: 7,
    location: "Brecilien",
    serverId: "guild123",
    status: "SCHEDULED",
    createdAt: new Date(),
    updatedAt: new Date(),
    slots: [],
    ...overrides,
  };
}

/**
 * Creates a mock server object
 * @param overrides Optional properties to override defaults
 * @returns Mock server object
 */
export function createMockServer(overrides: Record<string, unknown> = {}) {
  return {
    id: "guild123",
    name: "Test Guild",
    icon: "test-icon",
    createdAt: new Date(),
    updatedAt: new Date(),
    members: [],
    ...overrides,
  };
}

/**
 * Creates a mock server member object
 * @param overrides Optional properties to override defaults
 * @returns Mock server member object
 */
export function createMockServerMember(overrides: Record<string, unknown> = {}) {
  return {
    id: "member123",
    serverId: "guild123",
    userId: "user123",
    albionPlayerId: null,
    albionGuildId: null,
    killFame: 0,
    deathFame: 0,
    lastUpdated: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: createMockUser(),
    ...overrides,
  };
}

/**
 * Creates a mock raid slot object
 * @param overrides Optional properties to override defaults
 * @returns Mock raid slot object
 */
export function createMockRaidSlot(overrides: Record<string, unknown> = {}) {
  return {
    id: "slot123",
    raidId: "raid123",
    userId: "user123",
    role: "TANK",
    status: "FILLED",
    createdAt: new Date(),
    updatedAt: new Date(),
    user: createMockUser(),
    ...overrides,
  };
}

/**
 * Creates a mock session object
 * @param overrides Optional properties to override defaults
 * @returns Mock session object
 */
export function createMockSession(overrides: Record<string, unknown> = {}) {
  return {
    id: "session123",
    userId: "user123",
    accessToken: "access-token-123",
    refreshToken: "refresh-token-123",
    expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock audit config object
 * @param overrides Optional properties to override defaults
 * @returns Mock audit config object
 */
export function createMockAuditConfig(overrides: Record<string, unknown> = {}) {
  return {
    id: "audit123",
    serverId: "guild123",
    channelId: "channel123",
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock build object
 * @param overrides Optional properties to override defaults
 * @returns Mock build object
 */
export function createMockBuild(overrides: Record<string, unknown> = {}) {
  return {
    id: "build123",
    name: "Test Build",
    description: "A test build",
    contentType: "ROADS_OF_AVALON",
    role: "TANK",
    isPublic: true,
    createdBy: "user123",
    createdAt: new Date(),
    updatedAt: new Date(),
    pieces: [],
    ...overrides,
  };
}

/**
 * Creates a mock build piece object
 * @param overrides Optional properties to override defaults
 * @returns Mock build piece object
 */
export function createMockBuildPiece(overrides: Record<string, unknown> = {}) {
  return {
    id: "piece123",
    buildId: "build123",
    slot: "MAIN_HAND",
    itemId: "item123",
    enchantment: 0,
    quality: "NORMAL",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
