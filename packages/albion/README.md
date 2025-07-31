# Albion Package

A comprehensive TypeScript client for the Albion Online Game Info API using functional programming patterns.

## Features

- **Functional API**: Pure functions instead of class instantiation
- **Single Axios Instance**: Efficient HTTP client with shared configuration
- **Multi-Server Support**: Americas, Asia, and Europe servers
- **Type Safety**: Full TypeScript support with comprehensive types
- **Error Handling**: Robust error handling with custom error classes
- **Logging**: Integrated logging for debugging and monitoring
- **HTTP Client**: Built on axios with proper timeouts and headers
- **Unit Testing**: Comprehensive vitest test suite

## Installation

```bash
pnpm add @albion-raid-manager/albion
```

## Usage

### Basic Usage

```typescript
import { searchAlbionPlayers, getAlbionPlayer, verifyAlbionPlayer } from "@albion-raid-manager/albion";

// Search for players
const results = await searchAlbionPlayers("Anjek");
console.log(`Found ${results.players.length} players`);

// Get detailed player information
const player = await getAlbionPlayer("hK0T1yR9SIea9Sg_3-D2rw");
console.log(`${player.Name} has ${player.KillFame.toLocaleString()} kill fame`);

// Verify a player exists
const verifiedPlayer = await verifyAlbionPlayer("Anjek");
if (verifiedPlayer) {
  console.log(`Player verified: ${verifiedPlayer.Name}`);
}
```

### Multi-Server Support

```typescript
import { searchAlbionPlayers, getAlbionPlayer, getServerUrl } from "@albion-raid-manager/albion";

// Search on different servers
const americasResults = await searchAlbionPlayers("Anjek", "AMERICAS");
const asiaResults = await searchAlbionPlayers("Anjek", "ASIA");
const europeResults = await searchAlbionPlayers("Anjek", "EUROPE");

// Get server URLs directly
const americasUrl = getServerUrl("AMERICAS");
const asiaUrl = getServerUrl("ASIA");
const europeUrl = getServerUrl("EUROPE");
```

### Search for Players

```typescript
const results = await searchAlbionPlayers("Anjek");

// Find exact match
const exactMatch = results.players.find((player) => player.Name.toLowerCase() === "anjek".toLowerCase());

if (exactMatch) {
  console.log(`Found: ${exactMatch.Name} (${exactMatch.GuildName || "No Guild"})`);
}
```

### Get Player Details

```typescript
const player = await getAlbionPlayer("hK0T1yR9SIea9Sg_3-D2rw");

console.log(`Player: ${player.Name}`);
console.log(`Guild: ${player.GuildName || "None"}`);
console.log(`Kill Fame: ${player.KillFame.toLocaleString()}`);
console.log(`Death Fame: ${player.DeathFame.toLocaleString()}`);
console.log(`Fame Ratio: ${(player.FameRatio * 100).toFixed(1)}%`);
```

### Get Guild Information

```typescript
import { getAlbionGuild } from "@albion-raid-manager/albion";

const guild = await getAlbionGuild("m1HVpwomTMiAJKxwopwIpQ");

console.log(`Guild: ${guild.Name}`);
console.log(`Members: ${guild.MemberCount}`);
console.log(`Kill Fame: ${guild.KillFame.toLocaleString()}`);
console.log(`Death Fame: ${guild.DeathFame.toLocaleString()}`);
```

### Get Killboard Data

```typescript
import { getAlbionPlayerKillboard, getAlbionGuildKillboard } from "@albion-raid-manager/albion";

// Get player killboard
const playerKills = await getAlbionPlayerKillboard("hK0T1yR9SIea9Sg_3-D2rw", "AMERICAS", 10);

// Get guild killboard
const guildKills = await getAlbionGuildKillboard("m1HVpwomTMiAJKxwopwIpQ", "AMERICAS", 20);
```

## API Reference

### Core Functions

- `searchAlbionPlayers(query: string, server?: ServerId): Promise<AlbionSearchResponse>`
- `getAlbionPlayer(playerId: string, server?: ServerId): Promise<AlbionPlayerResponse>`
- `getAlbionGuild(guildId: string, server?: ServerId): Promise<AlbionGuildResponse>`
- `getAlbionPlayerKillboard(playerId: string, server?: ServerId, limit?: number): Promise<AlbionKillboardResponse[]>`
- `getAlbionGuildKillboard(guildId: string, server?: ServerId, limit?: number): Promise<AlbionKillboardResponse[]>`
- `verifyAlbionPlayer(username: string, server?: ServerId): Promise<AlbionPlayerResponse | null>`

### Server Utilities

- `getServerUrl(serverId: ServerId): string` - Get server URL directly
- `getServer(serverId: ServerId): Server` - Get full server configuration
- `getAllServers(): Server[]` - Get all available servers
- `getServerById(id: string): Server | undefined` - Find server by ID
- `getServerByLiveId(liveId: string): Server | undefined` - Find server by live ID

### Servers

```typescript
SERVERS = {
  AMERICAS: {
    id: "americas",
    name: "Albion Americas",
    liveId: "live_us",
    url: "https://gameinfo.albiononline.com/api/gameinfo",
  },
  ASIA: {
    id: "asia",
    name: "Albion Asia",
    liveId: "live_sgp",
    url: "https://gameinfo-sgp.albiononline.com/api/gameinfo",
  },
  EUROPE: {
    id: "europe",
    name: "Albion Europe",
    liveId: "live_ams",
    url: "https://gameinfo-ams.albiononline.com/api/gameinfo",
  },
};
```

## Error Handling

```typescript
import { searchAlbionPlayers, AlbionAPIError } from "@albion-raid-manager/albion";

try {
  const results = await searchAlbionPlayers("NonExistentPlayer");
} catch (error) {
  if (error instanceof AlbionAPIError) {
    console.error(`API Error ${error.status}: ${error.message}`);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

## Testing

Run the test suite:

```bash
cd packages/albion
pnpm run test
```

Run tests with coverage:

```bash
pnpm run test:coverage
```

Run tests in watch mode:

```bash
pnpm run test:watch
```

## API Endpoints

The package supports the following Albion Online Game Info API endpoints:

- `GET /search?q={query}` - Search for players and guilds
- `GET /players/{id}` - Get detailed player information
- `GET /guilds/{id}` - Get detailed guild information
- `GET /players/{id}/kills` - Get player killboard
- `GET /guilds/{id}/kills` - Get guild killboard

## Rate Limiting

The Albion Online API has rate limits. The client includes:

- 10-second timeout for requests
- Proper error handling for rate limit responses
- Logging for debugging rate limit issues

## Architecture

### Single Axios Instance

The package uses a single Axios instance for all HTTP requests, providing:

- **Consistent Configuration**: Shared timeout, headers, and interceptors
- **Resource Efficiency**: No need to create multiple instances
- **Easier Testing**: Single instance to mock in tests
- **Better Performance**: Connection pooling and reuse

### Server URL Management

The package provides clean server URL management:

- **`getServerUrl()`**: Direct access to server URLs
- **`getServer()`**: Full server configuration access
- **No redundant functions**: Clean, focused API design

## Contributing

When adding new features:

1. Add types to `src/types.ts`
2. Add functions to `src/client.ts`
3. Add tests to `test/client.test.ts`
4. Update this README

## Design Principles

- **Functional First**: All API interactions are pure functions
- **Single Instance**: One Axios instance for all requests
- **Type Safety**: Comprehensive TypeScript types for all responses
- **Error Handling**: Custom error classes with detailed information
- **Testing**: Comprehensive unit tests with vitest
- **Logging**: Integrated logging for debugging and monitoring
- **Clean API**: Minimal, focused functions without redundancy
