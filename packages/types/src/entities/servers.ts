import { APIGuild, APIGuildChannel, APIRole, ChannelType } from "discord-api-types/v10";

import { Server as DBServer } from "@albion-raid-manager/types";

import { hasPermissions, PERMISSIONS } from "../discord";

export type Server = DBServer & {
  owner?: boolean;
  admin?: boolean;
  bot?: boolean;
  channels?: APIGuildChannel<ChannelType>[];
  roles?: APIRole[];
};

export function fromDiscordGuild(guild: APIGuild): Server {
  const server: Server = {
    id: guild.id,
    name: guild.name,
    icon: guild.icon || null,
    owner: guild.owner,
    admin: false,
    active: true,
    adminRoles: [],
    raidRoles: [],
    compositionRoles: [],
  };

  if (guild.permissions) {
    server.admin = hasPermissions(guild.permissions, [PERMISSIONS.ADMINISTRATOR]);
  }

  return server;
}

export type ServerSettings = {
  name: string;
  icon: string;
  adminRoles: string[];
  raidRoles: string[];
  compositionRoles: string[];
  raidAnnouncementChannelId: string;
  serverGuildId: string;
  memberRoleId: string;
  friendRoleId: string;
  auditChannelId: string;
  language: string;
};

export function createServerSettings(server: Server): ServerSettings {
  return {
    name: server.name,
    icon: server.icon || "",
    adminRoles: server.adminRoles || [],
    raidRoles: server.raidRoles || [],
    compositionRoles: server.compositionRoles || [],
    raidAnnouncementChannelId: server.raidAnnouncementChannelId || "",
    serverGuildId: server.serverGuildId || "",
    memberRoleId: server.memberRoleId || "",
    friendRoleId: server.friendRoleId || "",
    auditChannelId: server.auditChannelId || "",
    language: server.language || "en",
  };
}
