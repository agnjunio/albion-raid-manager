import { z } from "zod";

import { ItemSlotType } from "../services";

export const searchItemsQuerySchema = z.object({
  q: z.string().min(2, "Search term must be at least 2 characters long"),
  slotType: z.custom<ItemSlotType>().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  language: z.string().optional(),
});
