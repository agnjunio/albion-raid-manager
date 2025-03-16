import { sleep } from "@albion-raid-manager/common/scheduler";
import logger from "@albion-raid-manager/logger";
import axios from "axios";
import { APIGuild } from "discord-api-types/v10";

const discordApiClient = axios.create({
  baseURL: "https://discord.com/api/v10",
});

// Handle Discord 429: Too Many Requests
discordApiClient.interceptors.response.use(null, async (error) => {
  const { config, response } = error;

  if (config && response && response.status == 429) {
    let retryAfter = 5000;
    if (response.data) retryAfter = response.data.retry_after || retryAfter;
    if (response.headers) retryAfter = response.headers["retry-after"] || retryAfter;
    logger.warn(`Discord API request to ${config.url} returned ${response.status}. Retrying in ${retryAfter}s...`, {
      response: {
        headers: response.headers,
        data: response.data,
      },
      retryAfter,
    });
    await sleep(retryAfter * 1000);
    return discordApiClient.request(config);
  }

  return Promise.reject(error);
});

export async function getUserGuilds(token: string): Promise<APIGuild[]> {
  const res = await discordApiClient.get(`/users/@me/guilds`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
