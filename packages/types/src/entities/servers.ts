import { Server } from "@albion-raid-manager/types";

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
