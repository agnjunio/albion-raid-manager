import { User } from "@albion-raid-manager/types";
import { DiscordServer } from "@albion-raid-manager/types/api";
import { APIGuild, APIGuildChannel, APIUser, ChannelType } from "discord-api-types/v10";

export const DISCORD_CDN_URL = `https://cdn.discordapp.com`;
export const PERMISSIONS: {
  [permission: string]: bigint;
} = {
  ADMINISTRATOR: BigInt(1 << 3), // 0x00000008
  MANAGE_GUILD: BigInt(1 << 5), // 0x00000020
  MANAGE_ROLES: BigInt(1 << 28), // 0x10000000
};

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
  return `https://discord.com/oauth2/authorize?client_id=${clientId}&scope=bot&permissions=2147534848${serverParam}`;
};

export function hasPermissions(permissions: string | bigint = 0n, requiredPermissions: bigint[]): boolean {
  const permissionBits = BigInt(permissions);
  return requiredPermissions.every((perm) => (permissionBits & perm) !== 0n);
}

export function transformUser(user: APIUser): User {
  return {
    id: user.id,
    username: user.username,
    nickname: user.global_name,
    avatar: user.avatar ?? null,
    defaultServerId: null,
  };
}

export function transformGuild(guild: APIGuild): DiscordServer {
  const transformedGuild = {
    id: guild.id,
    name: guild.name,
    icon: guild.icon,
    owner: guild.owner,
    admin: false,
  };

  if (guild.owner) {
    transformedGuild.owner = guild.owner;
  }

  if (guild.permissions) {
    transformedGuild.admin = hasPermissions(guild.permissions, [PERMISSIONS.ADMINISTRATOR]);
  }

  return transformedGuild;
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
