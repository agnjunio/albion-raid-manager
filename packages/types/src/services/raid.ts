import { ContentType, RaidRole, RaidStatus, RaidType } from "../../generated/index";

export interface RaidData {
  id: string;
  title: string;
  description?: string;
  note?: string;
  date: Date;
  type: RaidType;
  contentType?: ContentType;
  maxPlayers?: number;
  location?: string;
  serverId: string;
  status: RaidStatus;
  announcementMessageId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RaidSlotData {
  id: string;
  name: string;
  comment?: string;
  role?: RaidRole;
  userId?: string;
  raidId?: string;
  createdAt: Date;
  joinedAt?: Date;
}

export interface RaidWithSlots extends RaidData {
  slots: RaidSlotData[];
}

export interface CreateRaidInput {
  title: string;
  description?: string;
  note?: string;
  date: Date;
  type?: RaidType;
  contentType?: ContentType;
  location?: string;
  serverId: string;
  slotCount?: number;
  maxPlayers?: number;
}

export interface UpdateRaidInput {
  title?: string;
  description?: string;
  note?: string;
  date?: Date;
  type?: RaidType;
  contentType?: ContentType;
  location?: string;
  status?: RaidStatus;
  announcementMessageId?: string;
}

export interface RaidFilters {
  serverId?: string;
  status?: RaidStatus;
  type?: RaidType;
  contentType?: ContentType;
  dateFrom?: Date;
  dateTo?: Date;
}
