import { Build, BuildPiece, ContentType, GearSlot, RaidRole } from "../../generated/index";

// Service-specific interfaces that extend or compose the generated types
export interface BuildWithPieces extends Build {
  pieces: BuildPiece[];
}

export interface CreateBuildInput {
  name: string;
  description?: string;
  role: RaidRole;
  serverId: string;
  pieces?: CreateBuildPieceInput[];
}

export interface CreateBuildPieceInput {
  gearSlot: GearSlot;
  itemName: string; // Albion item pattern: T6_2H_HOLYSTAFF@0
  quantity?: number;
  description?: string;
  order?: number;
}

export interface UpdateBuildInput {
  name?: string;
  description?: string;
  role?: RaidRole;
}

export interface UpdateBuildPieceInput {
  gearSlot?: GearSlot;
  itemName?: string;
  quantity?: number;
  description?: string;
  order?: number;
}

export interface BuildFilters {
  serverId?: string;
  contentType?: ContentType;
  role?: RaidRole;
  name?: string;
}
