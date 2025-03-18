import { Composition } from "@albion-raid-manager/database/models";
import { addMonths, startOfDay } from "date-fns";
import { z } from "zod";

const today = startOfDay(Date.now());
const maxDate = addMonths(today, 2);

export const raidFormSchema = z.object({
  description: z
    .string()
    .min(6, { message: "Description should contain at least 6 characters" })
    .max(50, { message: "Description should not exceed 50 characters." }),
  date: z
    .date()
    .min(today, { message: "Start date must be today or later." })
    .max(maxDate, { message: "Start date cannot be more than 2 months ahead." }),
  composition: z.custom<Composition>(),
});
