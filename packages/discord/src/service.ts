import config from "@albion-raid-manager/config";
import { memoize } from "@albion-raid-manager/core/cache";
import { sleep } from "@albion-raid-manager/core/scheduler";
import { getMilliseconds } from "@albion-raid-manager/core/utils";
import { APIGuild, APIGuildChannel, APIGuildMember, APIMessage, APIUser, ChannelType } from "discord-api-types/v10";

import { discordApiClient } from "./client";
import { transformChannel, transformGuild } from "./helpers";
import { DiscordAccessToken, DiscordServiceOptions, Server } from "./types";

const DISCORD_TOKEN = config.discord.token;

function getDiscordClientCredentials() {
  if (!config.discord.clientId || !config.discord.clientSecret) {
    throw new Error("Discord client ID and secret are required.");
  }

  return {
    clientId: config.discord.clientId,
    clientSecret: config.discord.clientSecret,
  };
}

async function exchangeCode(code: string, redirect: string) {
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

async function refreshToken(refreshToken: string) {
  const { clientId, clientSecret } = getDiscordClientCredentials();

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);

  const res = await discordApiClient.post<DiscordAccessToken>("/oauth2/token", params);
  return res.data;
}

export async function getCurrentUser(Authorization: string) {
  return memoize<APIUser>(
    `discord.users.${Authorization}`,
    async () => {
      const res = await discordApiClient.get<APIUser>(`/users/@me`, {
        headers: {
          Authorization,
        },
      });
      return res.data;
    },
    {
      timeout: getMilliseconds(1, "days"),
    },
  );
}

async function getUser(userId: string) {
  return memoize<APIUser>(
    `discord.users.${userId}`,
    async () => {
      const res = await discordApiClient.get<APIUser>(`/users/${userId}`, {
        headers: {
          Authorization: `Bot ${DISCORD_TOKEN}`,
        },
      });
      return res.data;
    },
    {
      timeout: getMilliseconds(1, "days"),
    },
  );
}

export async function getUserGuilds(token: string): Promise<Server[]> {
  return memoize(
    `discord.users.${token}.guilds`,
    async () => {
      const res = await discordApiClient.get<APIGuild[]>(`/users/@me/guilds`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.map(transformGuild);
    },
    {
      timeout: getMilliseconds(1, "minutes"),
    },
  );
}

export async function getBotGuilds() {
  return memoize(
    `discord.bot.guilds`,
    async () => {
      let foundAll = false;
      let after;
      const guilds: APIGuild[] = [];

      // Iterate over all pages of guilds because bot can join more than the default 200 servers limit
      while (!foundAll) {
        const res = await discordApiClient.get<APIGuild[]>("/users/@me/guilds", {
          headers: {
            Authorization: `Bot ${DISCORD_TOKEN}`,
          },
          params: { limit: 200, after },
        });
        guilds.push(...res.data);

        after = guilds[guilds.length - 1].id;
        if (res.data.length < 200) foundAll = true;
        else await sleep(2000);
      }

      return guilds.map(transformGuild);
    },
    {
      refresh: getMilliseconds(10, "minutes"),
    },
  );
}

async function getGuild(guildId: string, { authorization = `Bot ${DISCORD_TOKEN}` }: DiscordServiceOptions = {}) {
  return memoize<APIGuild>(
    `discord.guilds.${guildId}`,
    async () => {
      const res = await discordApiClient.get<APIGuild>(`/guilds/${guildId}`, {
        headers: {
          Authorization: authorization,
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
}

export async function getGuildChannels(guildId: string) {
  return memoize(
    `discord.guilds.${guildId}.channels`,
    async () => {
      const res = await discordApiClient.get<APIGuildChannel<ChannelType.GuildText>[]>(`/guilds/${guildId}/channels`, {
        headers: {
          Authorization: `Bot ${DISCORD_TOKEN}`,
        },
      });
      return res.data.map(transformChannel);
    },
    {
      timeout: getMilliseconds(30, "seconds"),
    },
  );
}

export async function leaveGuild(guildId: string) {
  const res = await discordApiClient.delete(`/users/@me/guilds/${guildId}`, {
    headers: {
      Authorization: `Bot ${DISCORD_TOKEN}`,
    },
  });
  return res.data;
}

export const addMemberRole = async (guildId: string, memberId: string, roleId: string, reason: string) => {
  const res = await discordApiClient.put(`/guilds/${guildId}/members/${memberId}/roles/${roleId}`, null, {
    headers: {
      Authorization: `Bot ${DISCORD_TOKEN}`,
      "X-Audit-Log-Reason": reason,
    },
  });
  return res.data;
};

export const removeMemberRole = async (guildId: string, memberId: string, roleId: string, reason: string) => {
  const res = await discordApiClient.delete(`/guilds/${guildId}/members/${memberId}/roles/${roleId}`, {
    headers: {
      Authorization: `Bot ${DISCORD_TOKEN}`,
      "X-Audit-Log-Reason": reason,
    },
  });
  return res.data;
};

type File = {
  id: number;
  name: string;
  description: string;
  image: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sendMessage = async (channelId: string, payload: any) => {
  if (!payload) throw new Error("Empty message");

  // If we have files (generated by embeds helper), transform them to attachments
  const files: File[] = [];
  if (payload.files && payload.files.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload.files.forEach((file: any, i: number) => {
      files.push({
        id: i,
        description: file.description,
        name: file.name,
        image: file.attachment,
      });
    });
    delete payload.files;
    payload.attachments = files.map((file) => ({
      id: file.id,
      description: file.description,
      name: file.name,
    }));
  }

  const form = new FormData();
  form.append("payload_json", JSON.stringify(payload));
  files.forEach((file) => {
    form.append(`files[${file.id}]`, new Blob([file.image]), file.name);
  });

  const res = await discordApiClient.postForm<APIMessage>(`/channels/${channelId}/messages`, form, {
    headers: {
      Authorization: `Bot ${DISCORD_TOKEN}`,
    },
  });
  return res.data;
};

function getMember(
  guildId: string,
  userId: string,
  { authorization = `Bot ${DISCORD_TOKEN}` }: DiscordServiceOptions = {},
) {
  return memoize<APIGuildMember>(
    `discord.guilds.${guildId}.members.${userId}`,
    async () => {
      const res = await discordApiClient.get<APIGuildMember>(`/guilds/${guildId}/members/${userId}`, {
        headers: {
          Authorization: authorization,
        },
      });
      return res.data;
    },
    {
      timeout: getMilliseconds(30, "seconds"),
    },
  );
}

function getMembers(guildId: string) {
  return memoize<APIGuildMember[]>(
    `discord.guilds.${guildId}.members`,
    async () => {
      const res = await discordApiClient.get<APIGuildMember[]>(`/guilds/${guildId}/members`, {
        headers: {
          Authorization: `Bot ${DISCORD_TOKEN}`,
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

export const discordService = {
  auth: {
    exchangeCode,
    refreshToken,
  },
  users: {
    getCurrentUser,
    getUser,
  },
  guilds: {
    getUserGuilds,
    getBotGuilds,
    getGuild,
    getMember,
    getMembers,
  },
};
