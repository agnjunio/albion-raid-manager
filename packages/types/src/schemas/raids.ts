import { z } from "zod";

import { ContentType, RaidRole } from "@albion-raid-manager/types";

// Enhanced weapon validation function
function validateWeaponPattern(weapon: string): boolean {
  if (!weapon || weapon.trim() === "") return true; // Empty is valid
  const pattern = /^T([1-8])_([A-Z0-9_]+)@([0-3])$/;
  const match = weapon.trim().match(pattern);
  if (!match) return false;

  const [, tierStr, itemName, enchantmentStr] = match;
  const tier = parseInt(tierStr, 10);
  const enchantment = parseInt(enchantmentStr, 10);

  // Additional validation
  return tier >= 1 && tier <= 8 && enchantment >= 0 && enchantment <= 3 && itemName.length >= 3;
}

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
    .refine(validateWeaponPattern, {
      message: "Invalid weapon format. Use Albion pattern: T[1-8]_[ITEM_NAME]@[0-3] (e.g., T6_2H_HOLYSTAFF@0)",
    })
    .nullable()
    .optional()
    .transform((weapon) => {
      if (!weapon || weapon.trim() === "") return null;
      return weapon.trim();
    }),
  order: z.number().int().min(0).optional(),
});
