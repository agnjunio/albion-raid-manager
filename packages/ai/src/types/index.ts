import { ContentType } from "@albion-raid-manager/types";
import { z } from "zod";

export * from "./ai-raid";

// AI Provider Types
export enum AIProvider {
  OPENAI = "openai",
  ANTHROPIC = "anthropic",
  GOOGLE = "google",
  AZURE = "azure",
}

// Base AI Service Interface
export interface AIService {
  provider: AIProvider;
  parseDiscordPing(message: string): Promise<ParsedRaidData>;
  validateMessage(message: string): Promise<boolean>;
}

// AI Service Configuration
export interface AIServiceConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}

// Parsed Raid Data Structure
export interface ParsedRaidData {
  title: string;
  description?: string;
  date: Date;
  location?: string;
  requirements?: string[];
  roles?: RaidRole[];
  maxParticipants?: number;
  notes?: string;
  confidence: number;
  contentType?: ContentType;
  contentTypeConfidence?: number;
}

// Raid Role Structure
export interface RaidRole {
  name: string;
  role: string; // The mapped role enum value (TANK, HEALER, SUPPORT, etc.)
  count: number;
  preAssignedUser?: string; // Discord user ID or username
  requirements?: string[]; // Role-specific requirements (optional)
}

// AI Response Structure
export interface AIResponse<T = unknown> {
  data: T;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: AIProvider;
}

// Discord Message Context
export interface DiscordMessageContext {
  guildId: string;
  channelId: string;
  authorId: string;
  messageId: string;
  timestamp: Date;
  mentions: string[];
  attachments: string[];
}

// Validation Schemas
export const ParsedRaidDataSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.date(),
  location: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  roles: z
    .array(
      z.object({
        name: z.string(),
        role: z.string(),
        count: z.number().positive(),
        preAssignedUser: z.string().optional(),
        requirements: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  maxParticipants: z.number().positive().optional(),
  notes: z.string().optional(),
  confidence: z.number().min(0).max(1),
  contentType: z.string().optional(),
  contentTypeConfidence: z.number().min(0).max(1).optional(),
});

export const AIServiceConfigSchema = z.object({
  provider: z.nativeEnum(AIProvider),
  apiKey: z.string().min(1),
  model: z.string().optional(),
  baseUrl: z.string().url().optional(),
  maxTokens: z.number().positive().optional(),
  temperature: z.number().min(0).max(2).optional(),
});

// Error Types
export class AIServiceError extends Error {
  constructor(
    message: string,
    public provider: AIProvider,
    public code?: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = "AIServiceError";
  }
}

export class AIParsingError extends Error {
  constructor(
    message: string,
    public originalMessage: string,
    public confidence: number,
  ) {
    super(message);
    this.name = "AIParsingError";
  }
}
