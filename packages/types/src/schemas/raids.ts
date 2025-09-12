import { z } from "zod";

import { ContentType, RaidRole } from "@albion-raid-manager/types";

// Simple weapon pattern validation for API schemas
const weaponPattern = /^T[1-8]_[A-Z0-9_]+@[0-3]$/;

export const createRaidBodySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  contentType: z.custom<ContentType>().optional(),
  description: z.string().optional(),
  date: z.string().datetime("Invalid date format"),
  location: z.string().optional(),
  maxPlayers: z.number().int().min(0).optional(),
});

export const createRaidSlotBodySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  role: z.custom<RaidRole>().optional(),
  comment: z.string().optional(),
  weapon: z.string().regex(weaponPattern, "Invalid weapon format. Use Albion pattern: T6_2H_HOLYSTAFF@0").optional(),
  order: z.number().int().min(0).optional(),
});

export const updateRaidSlotBodySchema = z.object({
  name: z.string().min(3).optional(),
  role: z.custom<RaidRole>().optional(),
  comment: z.string().optional(),
  userId: z.string().nullable().optional(),
  weapon: z.string().regex(weaponPattern, "Invalid weapon format. Use Albion pattern: T6_2H_HOLYSTAFF@0").optional(),
  order: z.number().int().min(0).optional(),
});
