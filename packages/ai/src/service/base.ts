import { logger } from "@albion-raid-manager/logger";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

import { AIProvider, AIService, AIServiceConfig, AIServiceError, ParsedRaidData } from "../types";

export abstract class BaseAIService implements AIService {
  protected client: AxiosInstance;
  protected config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
    });

    // Add request/response interceptors for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`AI Service Request: ${config.method?.toUpperCase()} ${config.url}`, {
          provider: this.provider,
          model: this.config.model,
        });
        return config;
      },
      (error) => {
        logger.error(`AI Service Request Error: ${error.message}`, {
          provider: this.provider,
          error,
        });
        return Promise.reject(error);
      },
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`AI Service Response: ${response.status}`, {
          provider: this.provider,
          model: this.config.model,
          status: response.status,
        });
        return response;
      },
      (error) => {
        logger.error(`AI Service Response Error: ${error.message}`, {
          provider: this.provider,
          status: error.response?.status,
          data: error.response?.data,
        });
        return Promise.reject(error);
      },
    );
  }

  get provider(): AIProvider {
    return this.config.provider;
  }

  abstract parseDiscordPing(message: string): Promise<ParsedRaidData>;
  abstract validateMessage(message: string): Promise<boolean>;

  protected async makeRequest<T = any>(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<T>(endpoint, data, config);
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        throw new AIServiceError(
          error.response?.data?.error?.message || error.message,
          this.provider,
          error.response?.data?.error?.code,
          error.response?.status,
        );
      }
      throw new AIServiceError(error.message || "Unknown AI service error", this.provider);
    }
  }

  protected createRaidParsingPrompt(message: string): string {
    return `You are an AI assistant that parses Discord messages to extract raid information for Albion Online.

Please analyze the following Discord message and extract raid details in JSON format:

Message: "${message}"

Extract the following information:
- title: A concise title for the raid (e.g., "BAU PVE/PVP", "ROADS AVALON PVP/PVE", "Corrupted Dungeon")
- description: Any additional description or context
- date: The date of the raid (in ISO format, use today's date if only time is specified)
- time: The time of the raid (if mentioned, e.g., "16:20", "8 PM", "SAIDÁ ASSIM QUE FECHAR A PT")
- location: The location or zone for the raid (e.g., "BAU", "ROADS AVALON", "Corrupted Dungeon", "Roads", "Outlands")
- requirements: Array of general requirements for participants (e.g., gear level, food, energy, specs, mount requirements)
- roles: Array of roles needed with count, pre-assigned users, and role-specific requirements. For Albion Online, common roles include:
  * Standard roles: TANK, HEALER, DPS, SUPPORT
  * Specific builds: PUTRIDO (Corrupted), ARTICO (Arctic), CANÇÃO (Song), FURA BRUMA (Mistpiercer), STOPPER
  * Custom builds: MARTELO, MONARCA, REDENÇÃO/QUEDA, PATAS DE URSO, ASTRAL, AGUIA
  * Include Discord mentions (@username) as preAssignedUsers for each role
  * Include role-specific gear requirements in the requirements field for each role
- maxParticipants: Maximum number of participants (sum of all roles)
- notes: Any additional notes or special instructions
- confidence: Your confidence level (0-1) in the parsing

Important Albion Online context:
- Gear levels are often specified (e.g., "8.1", "7.3", "t8", "T8.1")
- Food and energy requirements are common
- Mount requirements are often specified
- Communication requirements (Discord call, voice chat)
- PVP vs PVE distinction is important
- Roles can be specified with emojis and parentheses (e.g., "👑(MARTELO)", "😎(MONARCA)")
- Custom server emojis are often used (e.g., ":g_bonk:", ":acs:", ":skll1:")
- Each role may have specific gear requirements listed after the user assignment
- Departure times can be conditional (e.g., "when party is full", "quando fechar")
- Users may be mentioned with or without @ symbol
- Messages may include structured sections with headers and bullet points
- Additional context like guild join commands may be included

Return only valid JSON without any additional text or formatting.`;
  }

  protected validateParsedData(data: any): ParsedRaidData {
    // Basic validation and transformation
    const parsed: ParsedRaidData = {
      title: data.title || "Raid",
      description: data.description,
      date: new Date(data.date || Date.now()),
      time: data.time,
      location: data.location,
      requirements: data.requirements || [],
      roles: data.roles || [],
      maxParticipants: data.maxParticipants,
      notes: data.notes,
      confidence: Math.max(0, Math.min(1, data.confidence || 0.5)),
    };

    return parsed;
  }
}
