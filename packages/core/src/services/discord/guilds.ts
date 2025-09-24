import { APIGuild, APIGuildChannel, APIGuildMember, ChannelType } from "discord-api-types/v10";

import { memoize } from "@albion-raid-manager/core/cache/memory";
import config from "@albion-raid-manager/core/config";
import { sleep } from "@albion-raid-manager/core/scheduler";
import { getMilliseconds } from "@albion-raid-manager/core/utils";
import { getAuthorization, transformChannel } from "@albion-raid-manager/core/utils/discord";

import { discordApiClient } from "./client";
import { DiscordServiceOptions } from "./types";

type GetUserGuildsOptions = DiscordServiceOptions & {
  admin?: boolean;
};

export async function getGuilds({ type = "bot", token = config.discord.token }: GetUserGuildsOptions) {
  const servers = await memoize<APIGuild[]>(
    `discord.${type}.${token}.guilds`,
    async () => {
      let foundAll = false;
      let after;
      const servers: APIGuild[] = [];

      // Iterate over all pages of guilds because bot can join more than the default 200 servers limit
      while (!foundAll) {
        const res = await discordApiClient.get<APIGuild[]>("/users/@me/guilds", {
          headers: {
            Authorization: getAuthorization(type, token),
          },
          params: { limit: 200, after },
        });

        servers.push(...res.data);
        after = servers[servers.length - 1].id;

        if (res.data.length < 200) {
          foundAll = true;
        } else {
          await sleep(2000);
        }
      }

      return servers;
    },
    {
      refresh: getMilliseconds(10, "minutes"),
    },
  );

  return servers;
}

export async function getGuild(
  guildId: string,
  { type = "bot", token = config.discord.token }: DiscordServiceOptions = {},
) {
  const guild = await memoize<APIGuild>(
    `discord.${type}.${token}.guilds.${guildId}`,
    async () => {
      const res = await discordApiClient.get<APIGuild>(`/guilds/${guildId}`, {
        headers: {
          Authorization: getAuthorization(type, token),
        },
        params: {
          with_counts: true,
        },
      });
      return res.data;
    },
    {
      timeout: getMilliseconds(1, "days"),
    },
  );
  return guild;
}

export async function getGuildChannels(
  guildId: string,
  { type = "bot", token = config.discord.token }: DiscordServiceOptions = {},
) {
  return memoize(
    `discord.${type}.${token}.guilds.${guildId}.channels`,
    async () => {
      const res = await discordApiClient.get<APIGuildChannel<ChannelType.GuildText>[]>(`/guilds/${guildId}/channels`, {
        headers: {
          Authorization: getAuthorization(type, token),
        },
      });
      return res.data.map(transformChannel);
    },
    {
      timeout: getMilliseconds(30, "seconds"),
    },
  );
}

export async function getGuildRoles(
  guildId: string,
  { type = "bot", token = config.discord.token }: DiscordServiceOptions = {},
) {
  return memoize(
    `discord.${type}.${token}.guilds.${guildId}.roles`,
    async () => {
      const res = await discordApiClient.get(`/guilds/${guildId}/roles`, {
        headers: {
          Authorization: getAuthorization(type, token),
        },
      });
      return res.data;
    },
    {
      timeout: getMilliseconds(30, "seconds"),
    },
  );
}

export async function leaveGuild(
  guildId: string,
  { type = "bot", token = config.discord.token }: DiscordServiceOptions = {},
) {
  const res = await discordApiClient.delete(`/users/@me/guilds/${guildId}`, {
    headers: {
      Authorization: getAuthorization(type, token),
    },
  });
  return res.data;
}

export async function getGuildMembers(
  guildId: string,
  { type = "bot", token = config.discord.token }: DiscordServiceOptions = {},
) {
  return memoize<APIGuildMember[]>(
    `discord.${type}.${token}.guilds.${guildId}.members`,
    async () => {
      const res = await discordApiClient.get<APIGuildMember[]>(`/guilds/${guildId}/members`, {
        headers: {
          Authorization: getAuthorization(type, token),
        },
        params: {
          limit: 1000, // TODO: Paginate
        },
      });
      return res.data;
    },
    {
      timeout: getMilliseconds(30, "seconds"),
    },
  );
}

export async function getGuildMember(
  guildId: string,
  userId: string,
  { type = "bot", token = config.discord.token }: DiscordServiceOptions = {},
) {
  return memoize<APIGuildMember>(
    `discord.${type}.${token}.guilds.${guildId}.members.${userId}`,
    async () => {
      const res = await discordApiClient.get<APIGuildMember>(`/guilds/${guildId}/members/${userId}`, {
        headers: {
          Authorization: getAuthorization(type, token),
        },
      });
      return res.data;
    },
    {
      timeout: getMilliseconds(30, "seconds"),
    },
  );
}

export const addGuildMemberRole = async (
  guildId: string,
  memberId: string,
  roleId: string,
  reason: string,
  { type = "bot", token = config.discord.token }: DiscordServiceOptions,
) => {
  const res = await discordApiClient.put(`/guilds/${guildId}/members/${memberId}/roles/${roleId}`, null, {
    headers: {
      Authorization: getAuthorization(type, token),
      "X-Audit-Log-Reason": reason,
    },
  });
  return res.data;
};

export const removeGuildMemberRole = async (
  guildId: string,
  memberId: string,
  roleId: string,
  reason: string,
  { type = "bot", token = config.discord.token }: DiscordServiceOptions,
) => {
  const res = await discordApiClient.delete(`/guilds/${guildId}/members/${memberId}/roles/${roleId}`, {
    headers: {
      Authorization: getAuthorization(type, token),
      "X-Audit-Log-Reason": reason,
    },
  });
  return res.data;
};
