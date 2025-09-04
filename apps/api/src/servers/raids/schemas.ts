import { z } from "zod";

export const createGuildRaidSchema = z.object({
  description: z.string().min(1),
  date: z.string().datetime(),
  location: z.string().optional(),
  composition: z
    .object({
      id: z.string(),
    })
    .optional(),
});
