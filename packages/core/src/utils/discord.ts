import { User } from "@albion-raid-manager/types";
import { APIGuildChannel, APIUser, ChannelType } from "discord-api-types/v10";

export const DISCORD_CDN_URL = `https://cdn.discordapp.com`;

export const getDiscordOAuthUrl = (clientId: string, redirectUri: string) =>
  `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds`;

export const getUserPictureUrl = (id: string, avatar?: string | null) => {
  if (avatar) return `${DISCORD_CDN_URL}/avatars/${id}/${avatar}.png`;
  return `${DISCORD_CDN_URL}/embed/avatars/${Number(id) % 5}.png`;
};

export const getServerPictureUrl = (
  id: string,
  icon?: string | null,
  { animated = false }: { animated?: boolean } = {},
) => {
  if (icon) {
    const ext = animated && icon.startsWith("a_") ? "gif" : "png";
    return `${DISCORD_CDN_URL}/icons/${id}/${icon}.${ext}`;
  }
  return `${DISCORD_CDN_URL}/embed/avatars/${Number(id) % 5}.png`;
};

export const getServerInviteUrl = (clientId: string, serverId?: string) => {
  const serverParam = serverId ? `&guild_id=${serverId}` : ``;
  return `https://discord.com/oauth2/authorize?client_id=${clientId}&scope=bot&permissions=8${serverParam}`;
};

export function transformUser(user: APIUser): User {
  return {
    id: user.id,
    username: user.username,
    nickname: user.global_name,
    avatar: user.avatar ?? null,
    defaultServerId: null,
  };
}

export function transformChannel(channel: APIGuildChannel<ChannelType>) {
  return {
    id: channel.id,
    name: channel.name,
    type: channel.type,
    parentId: channel.parent_id,
  };
}

export function getAuthorization(type: "user" | "bot", token?: string) {
  if (!token) throw new Error("Token is required for authorization");
  return type === "user" ? `Bearer ${token}` : `Bot ${token}`;
}

export function createDiscordTimestamp(date: Date): string {
  const timestamp = Math.floor(date.getTime() / 1000);
  return `<t:${timestamp}:R>`;
}

export function createDiscordTimestampWithFormat(
  date: Date,
  format: "t" | "T" | "d" | "D" | "f" | "F" | "R" = "R",
): string {
  const timestamp = Math.floor(date.getTime() / 1000);
  return `<t:${timestamp}:${format}>`;
}
