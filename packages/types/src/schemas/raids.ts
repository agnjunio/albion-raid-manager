import { z } from "zod";

import { CONTENT_TYPE_VALUES } from "@albion-raid-manager/types/entities";
import { validateItemPatternBoolean } from "@albion-raid-manager/types/validators";

export const createRaidBodySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  contentType: z.enum(CONTENT_TYPE_VALUES).optional(),
  description: z.string().optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
  location: z.string().optional(),
  maxPlayers: z.number().int().min(0).optional(),
});

// Unified raid slot schema - used for create, update, and form validation
export const raidSlotSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  role: z.enum(["TANK", "SUPPORT", "HEALER", "RANGED_DPS", "MELEE_DPS", "BATTLEMOUNT"] as const).optional(),
  comment: z
    .string()
    .nullable()
    .optional()
    .transform((comment) => {
      if (!comment || comment.trim() === "") return null;
      return comment.trim();
    }),
  userId: z
    .string()
    .nullable()
    .optional()
    .transform((userId) => {
      if (!userId || userId.trim() === "") return null;
      return userId.trim();
    }),
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

export const raidConfigurationSchema = z.object({
  version: z.string().min(1, "Version is required"),
  exportedAt: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid exportedAt format"),
  contentType: z.enum(CONTENT_TYPE_VALUES),
  raidData: z.object({
    description: z.string().optional(),
    note: z.string().optional(),
    location: z.string().optional(),
  }),
  composition: z.object({
    slots: z
      .array(
        z.object({
          name: z.string().min(1, "Slot name is required"),
          role: z.enum(["TANK", "SUPPORT", "HEALER", "RANGED_DPS", "MELEE_DPS", "BATTLEMOUNT"] as const).optional(),
          weapon: z.string().optional(),
          comment: z.string().optional(),
          order: z.number().int().min(0).optional(),
        }),
      )
      .refine(
        (slots) => {
          // Get all orders that are defined (not undefined)
          const orders = slots.map((slot) => slot.order) as number[];
          if (orders.some((order) => order === undefined)) return false;

          // Check for duplicates
          const uniqueOrders = new Set(orders);
          if (orders.length !== uniqueOrders.size) {
            return false;
          }

          // Check if orders are sequential starting from 0
          if (orders.length > 0) {
            const sortedOrders = [...orders].sort((a, b) => a - b);
            return sortedOrders.every((order, index) => order === index);
          }

          return true;
        },
        {
          message: "Slot orders must be unique and sequential starting from 0 (0, 1, 2, ...)",
        },
      ),
  }),
});
