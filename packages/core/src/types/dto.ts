import { GuildMemberRole, RaidStatus, Role } from "@albion-raid-manager/database/models";
import { User } from "./user";

// Guild Member DTOs
export interface GuildMemberDto {
  guildId: string;
  userId: string;
  nickname?: string;
  role: GuildMemberRole;
  user: User;
}

export interface CreateGuildMemberDto {
  guildId: string;
  userId: string;
  nickname?: string;
  role: GuildMemberRole;
}

export interface UpdateGuildMemberDto {
  nickname?: string;
  role?: GuildMemberRole;
}

// Guild DTOs
export interface GuildDto {
  id: string;
  name: string;
  icon?: string;
  discordId: string;
  adminRoles: string[];
  raidRoles: string[];
  compositionRoles: string[];
  raidAnnouncementChannelId?: string;
  members?: GuildMemberDto[];
}

export interface CreateGuildDto {
  name: string;
  icon?: string;
  discordId: string;
  adminRoles?: string[];
  raidRoles?: string[];
  compositionRoles?: string[];
  raidAnnouncementChannelId?: string;
}

export interface UpdateGuildDto {
  name?: string;
  icon?: string;
  adminRoles?: string[];
  raidRoles?: string[];
  compositionRoles?: string[];
  raidAnnouncementChannelId?: string;
}

// Settings DTOs
export interface GuildSettingsDto {
  adminRoles: string[];
  raidRoles: string[];
  compositionRoles: string[];
  raidAnnouncementChannelId?: string;
}

export interface UpdateGuildSettingsDto {
  adminRoles?: string[];
  raidRoles?: string[];
  compositionRoles?: string[];
  raidAnnouncementChannelId?: string;
}

// Server DTOs
export interface ServerDto {
  id: string;
  name: string;
  icon?: string;
  discordId: string;
  memberCount: number;
}

export interface ServerDetailsDto extends ServerDto {
  members: GuildMemberDto[];
}

// Raid DTOs
export interface RaidDto {
  id: string;
  guildId: string;
  description: string;
  date: Date;
  allowLateJoin: boolean;
  status: RaidStatus;
  announcementMessageId?: string;
  slots: RaidSlotDto[];
}

export interface CreateRaidDto {
  guildId: string;
  description: string;
  date: Date;
  allowLateJoin?: boolean;
  status?: RaidStatus;
}

export interface UpdateRaidDto {
  description?: string;
  date?: Date;
  allowLateJoin?: boolean;
  status?: RaidStatus;
}

// Build DTOs
export interface BuildDto {
  id: string;
  compositionId: string;
  name: string;
  role: Role;
  comment?: string;
  count: number;
}

// Raid Slot DTOs
export interface RaidSlotDto {
  id: string;
  name: string;
  comment?: string;
  userId?: string;
  buildId?: string;
  user?: User;
  build?: BuildDto;
  joinedAt?: Date;
}
