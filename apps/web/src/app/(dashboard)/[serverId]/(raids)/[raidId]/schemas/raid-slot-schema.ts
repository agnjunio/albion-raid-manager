import { RaidRole } from "@albion-raid-manager/types";
import { RAID_ROLE_INFO } from "@albion-raid-manager/types/entities";
import { z } from "zod";

export const raidSlotSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  role: z
    .custom<RaidRole>((role) => RAID_ROLE_INFO.some((r) => r.role === role), {
      message: "Invalid role",
    })
    .optional(),
  comment: z.string().optional(),
  userId: z.string().optional(),
  order: z.number().int().min(0).optional(),
});
