import { ContentType, RaidRole, RaidStatus, RaidType } from "../../generated/index";

// Base raid data structure
export interface RaidData {
  id: string;
  title: string;
  description?: string;
  note?: string;
  date: Date;
  type: RaidType;
  contentType?: ContentType;
  location?: string;
  serverId: string;
  status: RaidStatus;
  announcementMessageId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Raid slot data structure
export interface RaidSlotData {
  id: string;
  name: string;
  comment?: string;
  role: RaidRole;
  userId?: string;
  raidId?: string;
  createdAt: Date;
  joinedAt?: Date;
}

// Raid with slots included
export interface RaidWithSlots extends RaidData {
  slots: RaidSlotData[];
}

// Create raid input
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
}

// Update raid input
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

// Raid query filters
export interface RaidFilters {
  serverId?: string;
  status?: RaidStatus;
  type?: RaidType;
  contentType?: ContentType;
  dateFrom?: Date;
  dateTo?: Date;
}
