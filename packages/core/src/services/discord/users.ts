import { APIGuildMember, APIUser } from "discord-api-types/v10";

import { memoize } from "@albion-raid-manager/core/cache/memory";
import config from "@albion-raid-manager/core/config";
import { logger } from "@albion-raid-manager/core/logger";
import { getAuthorization } from "@albion-raid-manager/core/utils/discord";
import { getMilliseconds } from "@albion-raid-manager/core/utils/time";

import { discordApiClient } from "./client";
import { DiscordServiceOptions } from "./types";

export async function getCurrentUser({ type = "bot", token = config.discord.token }: DiscordServiceOptions) {
  return memoize<APIUser>(
    `discord.users.${type}.${token}`,
    async () => {
      const res = await discordApiClient.get<APIUser>(`/users/@me`, {
        headers: {
          Authorization: getAuthorization(type, token),
        },
      });
      return res.data;
    },
    {
      timeout: getMilliseconds(1, "days"),
    },
  );
}

export async function getCurrentUserGuildMember(
  guildId: string,
  { type = "bot", token = config.discord.token }: DiscordServiceOptions,
) {
  return memoize<APIGuildMember>(
    `discord.users.${type}.${token}.${guildId}.guildMember`,
    async () => {
      logger.info("Getting current user guild member", { guildId, type, token });
      const res = await discordApiClient.get<APIGuildMember>(`/users/@me/guilds/${guildId}/member`, {
        headers: {
          Authorization: getAuthorization(type, token),
        },
      });
      return res.data;
    },
    {
      timeout: getMilliseconds(5, "minutes"),
    },
  );
}

export async function getUser(userId: string, { type = "bot", token = config.discord.token }: DiscordServiceOptions) {
  return memoize<APIUser>(
    `discord.users.${type}.${token}.${userId}`,
    async () => {
      const res = await discordApiClient.get<APIUser>(`/users/${userId}`, {
        headers: {
          Authorization: getAuthorization(type, token),
        },
      });
      return res.data;
    },
    {
      timeout: getMilliseconds(1, "days"),
    },
  );
}
