import { sleep } from "@albion-raid-manager/common/scheduler";
import config from "@albion-raid-manager/config";
import logger from "@albion-raid-manager/logger";
import axios from "axios";

export const discordApiClient = axios.create({
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

function getDiscordClientCredentials() {
  if (!config.discord.clientId || !config.discord.clientSecret) {
    throw new Error("Discord client ID and secret are required.");
  }

  return {
    clientId: config.discord.clientId,
    clientSecret: config.discord.clientSecret,
  };
}

const TOKEN_ENDPOINT = "/oauth2/token";

export async function exchangeCode(code: string, redirect: string) {
  const { clientId, clientSecret } = getDiscordClientCredentials();

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", redirect);

  const res = await discordApiClient.post(TOKEN_ENDPOINT, params);
  return res.data;
}

export async function refreshToken(refreshToken: string) {
  const { clientId, clientSecret } = getDiscordClientCredentials();

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);

  const res = await discordApiClient.post(TOKEN_ENDPOINT, params);
  return res.data;
}
