import { CONTENT_TYPE_VALUES } from "@albion-raid-manager/types/entities";
import { addMonths, startOfDay } from "date-fns";
import { z } from "zod";

const today = startOfDay(Date.now());
const maxDate = addMonths(today, 2);

export const raidFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title should contain at least 3 characters" })
    .max(100, { message: "Title should not exceed 100 characters." }),
  contentType: z.enum(CONTENT_TYPE_VALUES),
  description: z.string().max(500, { message: "Description should not exceed 500 characters." }),
  date: z.date().max(maxDate, { message: "Start date cannot be more than 2 months ahead." }),
  location: z.string().max(100, { message: "Location should not exceed 100 characters." }).optional(),
  maxPlayers: z.number().int().min(0).optional(),
});
