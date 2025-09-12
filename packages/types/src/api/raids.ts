import z from "zod";

import { Raid, RaidSlot } from "../../generated/index";
import { createRaidBodySchema, createRaidSlotBodySchema, updateRaidSlotBodySchema } from "../schemas/raids";
import { RaidFilters } from "../services";

export namespace CreateRaid {
  export type Params = { serverId: string };
  export type Body = z.infer<typeof createRaidBodySchema>;
  export type Response = { raid: Raid };
}

export namespace GetRaids {
  export type Params = {
    serverId: string;
  };
  export type Query = { filters?: RaidFilters };
  export type Response = { raids: Raid[] };
}

export namespace GetRaid {
  export type Params = { serverId: string; raidId: string };
  export type Query = { slots?: boolean };
  export type Response = { raid: Raid };
}

export namespace UpdateRaid {
  export type Params = { serverId: string; raidId: string };
  export type Body = Partial<Raid>;
  export type Response = { raid: Raid };
}

export namespace DeleteRaid {
  export type Params = { serverId: string; raidId: string };
  export type Response = { message: string };
}

export namespace CreateRaidSlot {
  export type Params = { serverId: string; raidId: string };
  export type Body = z.infer<typeof createRaidSlotBodySchema>;
  export type Response = { raid: Raid };
}

export namespace UpdateRaidSlot {
  export type Params = { raidId: string; slotId: string };
  export type Body = z.infer<typeof updateRaidSlotBodySchema>;
  export type Response = { raidSlot: RaidSlot };
}

export namespace DeleteRaidSlot {
  export type Params = { raidId: string; slotId: string };
  export type Response = { message: string };
}
