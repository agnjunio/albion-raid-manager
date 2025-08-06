import type {
  AlbionGuildResponse,
  AlbionKillboardResponse,
  AlbionPlayerResponse,
  AlbionSearchResponse,
  AlbionUser,
} from "./types";

import { sleep } from "@albion-raid-manager/core/scheduler";
import { logger } from "@albion-raid-manager/logger";
import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";

import { getServerUrl, type ServerId } from "./servers";

export class AlbionAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public url: string,
  ) {
    super(message);
    this.name = "AlbionAPIError";
  }
}

// Single Axios instance for the entire package
const albionApiClient = axios.create({
  timeout: 60000,
  headers: {
    "User-Agent": "Albion-Raid-Manager/1.0.0",
    Accept: "application/json",
    "Accept-Language": "en-US,en;q=0.9",
  },
});

// Setup timeouts for axios client because sometimes server just hangs indefinetly
albionApiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const source = axios.CancelToken.source();
  setTimeout(() => {
    source.cancel("Client timeout");
  }, 60000);
  config.cancelToken = source.token;
  return config;
});

// Add response interceptor for error handling
albionApiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const { config, response } = error;
    if (config && response && response.status == 504) {
      logger.warn(`Albion API request to ${config.url} returned ${response.status}. Retrying...`);
      await sleep(5000);
      return albionApiClient.request(config);
    }

    if (response) {
      const apiError = new AlbionAPIError(
        `Albion API error: ${response.status} ${response.statusText}`,
        error.response.status,
        error.config.url || "",
      );
      logger.error("Albion API error:", apiError);
      throw apiError;
    }

    throw error;
  },
);

/**
 * Search for players and guilds
 */
export async function searchAlbionPlayers(query: string, server: ServerId = "AMERICAS"): Promise<AlbionSearchResponse> {
  try {
    logger.debug(`Searching for: ${query} on server: ${server}`);

    const baseURL = getServerUrl(server);
    const response = await albionApiClient.get<AlbionSearchResponse>(`${baseURL}/search`, {
      params: { q: query },
    });

    logger.debug(
      `Search results: ${response.data.players?.length || 0} players, ${response.data.guilds?.length || 0} guilds`,
    );
    return response.data;
  } catch (error) {
    logger.error("Search failed:", error);
    throw error;
  }
}

/**
 * Get detailed player information
 */
export async function getAlbionPlayer(playerId: string, server: ServerId = "AMERICAS"): Promise<AlbionPlayerResponse> {
  try {
    logger.debug(`Getting player: ${playerId} on server: ${server}`);

    const baseURL = getServerUrl(server);
    const response = await albionApiClient.get<AlbionPlayerResponse>(`${baseURL}/players/${playerId}`);

    logger.debug(`Player data retrieved for: ${response.data.Name}`);
    return response.data;
  } catch (error) {
    logger.error("Get player failed:", error);
    throw error;
  }
}

/**
 * Get detailed guild information
 */
export async function getAlbionGuild(guildId: string, server: ServerId = "AMERICAS"): Promise<AlbionGuildResponse> {
  try {
    logger.debug(`Getting guild: ${guildId} on server: ${server}`);

    const baseURL = getServerUrl(server);
    const response = await albionApiClient.get<AlbionGuildResponse>(`${baseURL}/guilds/${guildId}`);

    logger.debug(`Guild data retrieved for: ${response.data.Name}`);
    return response.data;
  } catch (error) {
    logger.error("Get guild failed:", error);
    throw error;
  }
}

/**
 * Get killboard events for a player
 */
export async function getAlbionPlayerKillboard(
  playerId: string,
  server: ServerId = "AMERICAS",
  limit: number = 50,
): Promise<AlbionKillboardResponse[]> {
  try {
    logger.debug(`Getting killboard for player: ${playerId} on server: ${server}`);

    const baseURL = getServerUrl(server);
    const response = await albionApiClient.get<AlbionKillboardResponse[]>(`${baseURL}/players/${playerId}/kills`, {
      params: { limit },
    });

    logger.debug(`Killboard data retrieved: ${response.data.length} events`);
    return response.data;
  } catch (error) {
    logger.error("Get player killboard failed:", error);
    throw error;
  }
}

/**
 * Get killboard events for a guild
 */
export async function getAlbionGuildKillboard(
  guildId: string,
  server: ServerId = "AMERICAS",
  limit: number = 50,
): Promise<AlbionKillboardResponse[]> {
  try {
    logger.debug(`Getting killboard for guild: ${guildId} on server: ${server}`);

    const baseURL = getServerUrl(server);
    const response = await albionApiClient.get<AlbionKillboardResponse[]>(`${baseURL}/guilds/${guildId}/kills`, {
      params: { limit },
    });

    logger.debug(`Guild killboard data retrieved: ${response.data.length} events`);
    return response.data;
  } catch (error) {
    logger.error("Get guild killboard failed:", error);
    throw error;
  }
}

/**
 * Verify if a player exists in Albion Online
 */
export async function verifyAlbionPlayer(username: string, server: ServerId = "AMERICAS"): Promise<AlbionUser | null> {
  try {
    const searchResults = await searchAlbionPlayers(username, server);

    // Find exact match (case-insensitive)
    const exactMatch = searchResults.players.find((player) => player.Name.toLowerCase() === username.toLowerCase());

    if (exactMatch) {
      // Return the search result directly
      return exactMatch;
    }

    // If no exact match, return the first result if there's only one
    if (searchResults.players.length === 1) {
      return searchResults.players[0];
    }

    return null;
  } catch (error) {
    logger.error("Player verification failed:", error);
    throw error;
  }
}
