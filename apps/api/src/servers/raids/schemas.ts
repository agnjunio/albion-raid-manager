import { ContentType, RaidRole } from "@albion-raid-manager/types";
import { z } from "zod";

export const createRaidSchema = z.object({
  title: z.string().min(3),
  contentType: z.custom<ContentType>(),
  date: z.string().datetime(),
  location: z.string().optional(),
  description: z.string().optional(),
  maxPlayers: z.number().int().min(0).optional(),
});

export const createRaidSlotSchema = z.object({
  name: z.string().min(3),
  role: z.custom<RaidRole>().optional(),
  comment: z.string().optional(),
  order: z.number().int().min(0).optional(),
});
