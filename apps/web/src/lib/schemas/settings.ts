import { Channel } from "@/types/discord";
import { z } from "zod";

export const raidSettingsFormSchema = z.object({
  pingChannel: z.custom<Channel>().optional(),
});
