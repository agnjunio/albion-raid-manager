import { addMonths, startOfDay } from "date-fns";
import { z } from "zod";

const today = startOfDay(Date.now());
const maxDate = addMonths(today, 2);

export const raidFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title should contain at least 3 characters" })
    .max(100, { message: "Title should not exceed 100 characters." }),
  contentType: z.enum([
    "SOLO_DUNGEON",
    "OPEN_WORLD_FARMING", 
    "GROUP_DUNGEON",
    "AVALONIAN_DUNGEON_FULL_CLEAR",
    "AVALONIAN_DUNGEON_BUFF_ONLY",
    "ROADS_OF_AVALON_PVE",
    "ROADS_OF_AVALON_PVP",
    "DEPTHS_DUO",
    "DEPTHS_TRIO",
    "GANKING_SQUAD",
    "FIGHTING_SQUAD",
    "ZVZ_CALL_TO_ARMS",
    "HELLGATE_2V2",
    "HELLGATE_5V5",
    "HELLGATE_10V10",
    "MISTS_SOLO",
    "MISTS_DUO",
    "OTHER"
  ], {
    required_error: "Please select a content type",
  }),
  description: z
    .string()
    .min(10, { message: "Description should contain at least 10 characters" })
    .max(500, { message: "Description should not exceed 500 characters." }),
  date: z.date().max(maxDate, { message: "Start date cannot be more than 2 months ahead." }),
  location: z
    .string()
    .min(3, { message: "Location should contain at least 3 characters" })
    .max(100, { message: "Location should not exceed 100 characters." })
    .optional(),
  maxParticipants: z
    .number()
    .min(1, { message: "Maximum participants must be at least 1" })
    .max(50, { message: "Maximum participants cannot exceed 50" })
    .optional(),
});
