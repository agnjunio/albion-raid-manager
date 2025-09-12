import { RaidRole } from "@albion-raid-manager/types";
import { RAID_ROLE_INFO } from "@albion-raid-manager/types/entities";
import { z } from "zod";

import { validateItemPattern } from "@/lib/albion/item-validation";

export const raidSlotSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  role: z
    .custom<RaidRole>((role) => RAID_ROLE_INFO.some((r) => r.role === role), {
      message: "Invalid role",
    })
    .optional(),
  comment: z.string().optional(),
  userId: z.string().optional(),
  weapon: z
    .string()
    .refine((weapon: string) => {
      if (!weapon || weapon.trim() === "") return true; // Empty is valid
      const validation = validateItemPattern(weapon);
      return { message: validation.error || "Invalid weapon format" };
    })
    .optional(),
  order: z.number().int().min(0).optional(),
});
