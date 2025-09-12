import { ContentType, RaidRole, RaidStatus, RaidType } from "../../generated/index";

// Service-specific interfaces that extend or compose the generated types
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

export interface RaidWithSlots extends RaidData {
  slots: RaidSlotData[];
}

export interface RaidSlotData {
  id: string;
  name: string;
  comment?: string;
  role?: RaidRole;
  userId?: string;
  raidId?: string;
  weapon?: string; // Albion item pattern: T6_2H_HOLYSTAFF@0
  buildId?: string;
  createdAt: Date;
  joinedAt?: Date;
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
  description?: string | null;
  note?: string | null;
  date?: Date;
  type?: RaidType;
  contentType?: ContentType | null;
  location?: string | null;
  status?: RaidStatus;
  announcementMessageId?: string | null;
}

export interface CreateRaidSlotInput {
  name: string;
  comment?: string;
  role?: RaidRole;
  weapon?: string; // Albion item pattern: T6_2H_HOLYSTAFF@0
  buildId?: string;
  order?: number;
}

export interface UpdateRaidSlotInput {
  name?: string;
  role?: RaidRole;
  comment?: string | null;
  userId?: string | null;
  weapon?: string | null; // Albion item pattern: T6_2H_HOLYSTAFF@0
  buildId?: string;
  order?: number;
}

export interface RaidFilters {
  serverId?: string;
  status?: RaidStatus;
  type?: RaidType;
  contentType?: ContentType;
  dateFrom?: Date;
  dateTo?: Date;
}
