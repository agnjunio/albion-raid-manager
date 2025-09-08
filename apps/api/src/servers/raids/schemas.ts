import { ContentType } from "@albion-raid-manager/types";
import { z } from "zod";

export const createGuildRaidSchema = z.object({
  title: z.string().min(3),
  contentType: z.custom<ContentType>(),
  date: z.string().datetime(),
  location: z.string().optional(),
  description: z.string().optional(),
});
