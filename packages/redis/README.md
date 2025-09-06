# Redis Package

This package provides Redis functionality for the Albion Raid Manager project, including caching, pub/sub, and event handling.

## Quick Start

```typescript
import { Redis } from "@albion-raid-manager/redis";

// Initialize Redis
await Redis.initClient();

// Use caching
const cache = Redis.getCache();
await cache.set("key", "value", 300);
const value = await cache.get("key");

// Disconnect when done
await Redis.disconnect();
```

## Package Structure

### Core Files

- **`@redis.ts`** - Main namespace for apps (recommended entry point)
- **`client.ts`** - Redis client wrapper with connection management
- **`cache.ts`** - Redis cache implementation with TTL and patterns

### Event System

- **`publisher.ts`** - Redis message publisher
- **`subscriber.ts`** - Redis message subscriber
- **`builder.ts`** - Event message builder
- **`events.ts`** - Event type definitions

### Event Handlers

- **`raids/`** - Raid-related events
- **`registration/`** - User registration events

## Usage Patterns

### 1. Simple Caching

```typescript
import { Redis } from "@albion-raid-manager/redis";

await Redis.initClient();
const cache = Redis.getCache();

// Basic operations
await cache.set("user:123", userData, 300);
const user = await cache.get("user:123");
await cache.delete("user:123");
await cache.deletePattern("user:*");
```

### 2. Service Integration

```typescript
import { Redis } from "@albion-raid-manager/redis";
import { ServersService } from "@albion-raid-manager/core";

await Redis.initClient();

// Use services with caching
const servers = await ServersService.getServersForUser("user123", {
  cache: Redis.getCache(),
  cacheTtl: 600,
});
```

### 3. Custom Cache Instances

```typescript
import { RedisCache } from "@albion-raid-manager/redis";

await Redis.initClient();

// Create custom cache with different settings
const customCache = new RedisCache(Redis.getClient(), 1200, "custom");
```

## API Reference

### Redis Namespace

#### Initialization

- `Redis.initClient()` - Initialize Redis client and caches
- `Redis.disconnect()` - Disconnect from Redis
- `Redis.isHealthy()` - Check if Redis is connected
- `Redis.ping()` - Ping Redis server

#### Cache Access

- `Redis.getCache()` - Get the default cache instance

### Cache Interface

```typescript
interface Cache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  deletePattern(pattern: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}
```

### RedisCache Class

```typescript
class RedisCache implements Cache {
  constructor(
    client: RedisClientType,
    defaultTtl = 300,
    defaultPrefix = "albion"
  );
}
```

## Best Practices

### 1. Initialization

Always initialize Redis before use:

```typescript
await Redis.initClient();
```

### 2. Error Handling

```typescript
try {
  const value = await cache.get("key");
} catch (error) {
  // Handle cache errors gracefully
  console.error("Cache error:", error);
}
```

### 3. Key Naming

Use consistent key naming patterns:

```typescript
// Good
"user:123";
"server:456:members";
"raids:server:789:OPEN";

// Avoid
"user123";
"server_members_456";
```

### 4. TTL Values

Set appropriate TTL values based on data volatility:

```typescript
// Frequently changing data
cache.set("raids:active", data, 60); // 1 minute

// Moderately changing data
cache.set("user:profile", data, 300); // 5 minutes

// Rarely changing data
cache.set("server:config", data, 1800); // 30 minutes
```

### 5. Cleanup

Always disconnect when done:

```typescript
await Redis.disconnect();
```

## Migration from App-Specific Redis

If you're migrating from app-specific Redis implementations:

### Before

```typescript
// apps/api/src/redis.ts
export namespace Redis {
  // ... local implementation
}
```

### After

```typescript
// apps/api/src/redis.ts
export { Redis } from "@albion-raid-manager/redis";
```

The API remains the same, but now it's centralized in the package.
