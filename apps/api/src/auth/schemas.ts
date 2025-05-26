import { z } from "zod";

export const discordCallbackSchema = z.object({
  code: z.string(),
  redirectUri: z.string(),
});
