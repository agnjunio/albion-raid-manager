import { sleep } from "@/scheduler";
import config from "@albion-raid-manager/config";
import logger from "@albion-raid-manager/logger";
import axios from "axios";

const TOKEN_ENDPOINT = "/oauth2/token";
const USERS_ENDPOINT = "/users";
const GUILDS_ENDPOINT = "/guilds";

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

function getDiscordClientCredentials() {
  if (!config.discord.clientId || !config.discord.clientSecret) {
    throw new Error("Discord client ID and secret are required.");
  }

  return {
    clientId: config.discord.clientId,
    clientSecret: config.discord.clientSecret,
  };
}

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

export async function getCurrentUser(token: string) {
  const res = await discordApiClient.get(`${USERS_ENDPOINT}/@me`, {
    headers: {
      Authorization: token,
    },
  });
  return res.data;
}

export async function getCurrentUserGuilds(token: string, params: unknown) {
  const res = await discordApiClient.get(`${USERS_ENDPOINT}/@me/guilds`, {
    headers: {
      Authorization: token,
    },
    params,
  });
  return res.data;
}

export async function leaveGuild(token: string, guildId: string) {
  const res = await discordApiClient.delete(`${USERS_ENDPOINT}/@me/guilds/${guildId}`, {
    headers: {
      Authorization: token,
    },
  });
  return res.data;
}

export async function getUser(token: string, userId: string) {
  const res = await discordApiClient.get(`${USERS_ENDPOINT}/${userId}`, {
    headers: {
      Authorization: token,
    },
  });
  return res.data;
}

export async function getGuild(token: string, guildId: string) {
  const res = await discordApiClient.get(`${GUILDS_ENDPOINT}/${guildId}`, {
    headers: {
      Authorization: token,
    },
  });
  return res.data;
}

export async function getGuildChannels(token: string, guildId: string) {
  const res = await discordApiClient.get(`${GUILDS_ENDPOINT}/${guildId}/channels`, {
    headers: {
      Authorization: token,
    },
  });
  return res.data;
}

export async function addGuildMemberRole(
  token: string,
  { guildId, memberId, roleId, reason }: { guildId: string; memberId: string; roleId: string; reason: string },
) {
  const res = await discordApiClient.put(`/guilds/${guildId}/members/${memberId}/roles/${roleId}`, null, {
    headers: {
      Authorization: token,
      "X-Audit-Log-Reason": reason,
    },
  });
  return res.data;
}

export async function removeGuildMemberRole(
  token: string,
  { guildId, memberId, roleId, reason }: { guildId: string; memberId: string; roleId: string; reason: string },
) {
  const res = await discordApiClient.delete(`/guilds/${guildId}/members/${memberId}/roles/${roleId}`, {
    headers: {
      Authorization: token,
      "X-Audit-Log-Reason": reason,
    },
  });
  return res.data;
}

type File = {
  id: number;
  name: string;
  description: string;
  image: string;
};

export async function createMessage(
  token: string,
  channelId: string,
  { payload, files = [] }: { payload: unknown; files: File[] },
) {
  const form = new FormData();
  form.append("payload_json", JSON.stringify(payload));
  files.forEach((file) => {
    form.append(`files[${file.id}]`, new Blob([file.image]), file.name);
  });

  const res = await discordApiClient.postForm(`/channels/${channelId}/messages`, form, {
    headers: {
      Authorization: token,
    },
  });
  return res.data;
}
