import config from "@albion-raid-manager/config";

import { discordApiClient } from "./client";
import { DiscordAccessToken } from "./types";

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

  const res = await discordApiClient.post<DiscordAccessToken>("/oauth2/token", params);
  return res.data;
}

export async function refreshToken(refreshToken: string) {
  const { clientId, clientSecret } = getDiscordClientCredentials();

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);

  const res = await discordApiClient.post<DiscordAccessToken>("/oauth2/token", params);
  return res.data;
}
