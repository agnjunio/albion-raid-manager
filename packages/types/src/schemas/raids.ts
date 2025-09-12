import { z } from "zod";

import { ContentType, RaidRole } from "@albion-raid-manager/types";
import { validateItemPatternBoolean } from "@albion-raid-manager/types/validators";

export const createRaidBodySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  contentType: z.custom<ContentType>().optional(),
  description: z.string().optional(),
  date: z.string().datetime("Invalid date format"),
  location: z.string().optional(),
  maxPlayers: z.number().int().min(0).optional(),
});

// Unified raid slot schema - used for create, update, and form validation
export const raidSlotSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  role: z.custom<RaidRole>().optional(),
  comment: z
    .string()
    .nullable()
    .optional()
    .transform((comment) => {
      if (!comment || comment.trim() === "") return null;
      return comment.trim();
    }),
  userId: z.string().nullable().optional(),
  weapon: z
    .string()
    .refine(validateItemPatternBoolean, {
      message:
        "Invalid weapon format. Use Albion pattern: [TIER]_[PREFIX]_[ITEM_NAME]@[ENCHANTMENT] (e.g., T8_2H_HOLYSTAFF@3)",
    })
    .nullable()
    .optional()
    .transform((weapon) => {
      if (!weapon || weapon.trim() === "") return null;
      return weapon.trim();
    }),
  order: z.number().int().min(0).optional(),
});
