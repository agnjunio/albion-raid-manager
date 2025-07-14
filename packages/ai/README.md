# AI Service Layer

This package provides a flexible AI service layer for parsing Discord messages to extract raid information for Albion Online. It supports multiple AI providers and can be easily extended to support new vendors.

## Features

- **Multi-Provider Support**: Currently supports OpenAI and Anthropic, with easy extension for Google and Azure
- **Vendor Agnostic**: Switch between AI providers without changing your application code
- **Discord Integration**: Specifically designed for parsing Discord messages and creating raids
- **Confidence Scoring**: Each parsed result includes a confidence score to help filter low-quality results
- **Error Handling**: Comprehensive error handling with custom error types
- **Logging**: Built-in logging for debugging and monitoring

## Installation

The package is part of the monorepo and can be used by adding it as a dependency:

```json
{
  "dependencies": {
    "@albion-raid-manager/ai": "workspace:*"
  }
}
```

## Configuration

Set up environment variables for your chosen AI provider:

### OpenAI

```bash
AI_PROVIDER=openai
AI_API_KEY=your_openai_api_key
AI_MODEL=gpt-4  # optional, defaults to gpt-4
AI_BASE_URL=https://api.openai.com/v1  # optional, defaults to OpenAI API
```

### Anthropic

```bash
AI_PROVIDER=anthropic
AI_API_KEY=your_anthropic_api_key
AI_MODEL=claude-3-sonnet-20240229  # optional, defaults to claude-3-sonnet-20240229
AI_BASE_URL=https://api.anthropic.com/v1  # optional, defaults to Anthropic API
```

### Optional Settings

```bash
AI_MAX_TOKENS=1000  # optional, defaults to 1000
AI_TEMPERATURE=0.1  # optional, defaults to 0.1
```

## Usage

### Basic Usage

```typescript
import { AIServiceFactory, DiscordPingParser } from "@albion-raid-manager/ai";

// Create AI service from environment variables
const aiService = AIServiceFactory.createFromEnv();

// Create parser
const parser = new DiscordPingParser(aiService);

// Parse a Discord message
const message = "@everyone Raid tonight at 8 PM! Need 2 tanks, 3 healers, and 5 DPS for corrupted dungeon!";
const parsedData = await parser.parseMessage(message);

console.log(parsedData);
// Output:
// {
//   title: "Corrupted Dungeon Raid",
//   date: 2024-01-15T20:00:00.000Z,
//   roles: [
//     { name: "Tank", count: 2, preAssignedUsers: ["@Player1", "@Player2"] },
//     { name: "Healer", count: 3, preAssignedUsers: ["@Healer1", "@Healer2", "@Healer3"] },
//     { name: "DPS", count: 5, preAssignedUsers: ["@DPS1", "@DPS2", "@DPS3", "@DPS4", "@DPS5"] }
//   ],
//   confidence: 0.95
// }
```

### Custom Configuration

```typescript
import { AIServiceFactory, AIProvider } from "@albion-raid-manager/ai";

// Create service with custom configuration
const aiService = AIServiceFactory.create({
  provider: AIProvider.OPENAI,
  apiKey: "your-api-key",
  model: "gpt-4-turbo",
  maxTokens: 1500,
  temperature: 0.2,
});

const parser = new DiscordPingParser(aiService);
```

### Discord Bot Integration

```typescript
import { AIRaidIntegration } from "./raids/ai-integration";

// In your Discord bot initialization
const aiIntegration = new AIRaidIntegration();
aiIntegration.initialize(discord);

// The bot will now automatically parse messages and create raids
```

### Manual Message Validation

```typescript
import { AIServiceFactory } from "@albion-raid-manager/ai";

const aiService = AIServiceFactory.createFromEnv();

// Check if a message is raid-related
const isRaidMessage = await aiService.validateMessage("Anyone up for a quick dungeon run?");
// Returns: true/false
```

## API Reference

### AIServiceFactory

Factory class for creating AI service instances.

#### Methods

- `create(config: AIServiceConfig): AIService` - Create service with custom config
- `createFromEnv(): AIService` - Create service from environment variables

### DiscordPingParser

High-level parser for Discord messages.

#### Methods

- `parseMessage(message: string, context?: DiscordMessageContext): Promise<ParsedRaidData>`
- `parseMultipleMessages(messages: Array<{content: string, context?: DiscordMessageContext}>): Promise<Array<{data: ParsedRaidData, originalMessage: string}>>`
- `validateMessage(message: string): Promise<boolean>`

### ParsedRaidData

Structure of parsed raid information:

```typescript
interface ParsedRaidData {
  title: string;
  description?: string;
  date: Date;
  time?: string;
  location?: string;
  requirements?: string[];
  roles?: RaidRole[];
  maxParticipants?: number;
  notes?: string;
  confidence: number;
}
```

### DiscordMessageContext

Context information for Discord messages:

```typescript
interface DiscordMessageContext {
  guildId: string;
  channelId: string;
  authorId: string;
  messageId: string;
  timestamp: Date;
  mentions: string[];
  attachments: string[];
}
```

## Error Handling

The package provides custom error types:

- `AIServiceError` - Errors from AI service providers
- `AIParsingError` - Errors during message parsing

```typescript
import { AIServiceError, AIParsingError } from "@albion-raid-manager/ai";

try {
  const result = await parser.parseMessage(message);
} catch (error) {
  if (error instanceof AIServiceError) {
    console.error(`AI Service Error: ${error.message}`);
  } else if (error instanceof AIParsingError) {
    console.error(`Parsing Error: ${error.message}, Confidence: ${error.confidence}`);
  }
}
```

## Adding New AI Providers

To add support for a new AI provider:

1. Create a new service class extending `BaseAIService`
2. Implement the required methods: `parseDiscordPing()` and `validateMessage()`
3. Add the provider to the `AIProvider` enum
4. Update the `AIServiceFactory.create()` method

Example:

```typescript
import { BaseAIService, AIProvider, ParsedRaidData } from "../types";

export class GoogleAIService extends BaseAIService {
  constructor(config: { apiKey: string; model?: string; baseUrl?: string }) {
    super({
      provider: AIProvider.GOOGLE,
      apiKey: config.apiKey,
      model: config.model || "gemini-pro",
      baseUrl: config.baseUrl || "https://generativelanguage.googleapis.com/v1",
    });
  }

  async parseDiscordPing(message: string): Promise<ParsedRaidData> {
    // Implement Google AI specific logic
  }

  async validateMessage(message: string): Promise<boolean> {
    // Implement Google AI specific validation
  }
}
```

## Testing

The package includes comprehensive error handling and logging. You can test different scenarios:

```typescript
// Test with various message types
const testMessages = [
  "@everyone Raid tonight at 8 PM!",
  "Anyone want to do a dungeon?",
  "Just a regular chat message",
  "Need 2 tanks for corrupted dungeon tomorrow at 7 PM",
];

for (const message of testMessages) {
  try {
    const result = await parser.parseMessage(message);
    console.log(`Success: ${result.title} (confidence: ${result.confidence})`);
  } catch (error) {
    console.log(`Failed: ${error.message}`);
  }
}
```

## Performance Considerations

- The AI service includes request/response interceptors for logging
- Messages are validated before parsing to avoid unnecessary API calls
- Confidence thresholds can be used to filter low-quality results
- Batch processing is supported for multiple messages

## Contributing

When adding new features or providers:

1. Follow the existing code structure
2. Add proper TypeScript types
3. Include error handling
4. Add logging for debugging
5. Update this README with new features
