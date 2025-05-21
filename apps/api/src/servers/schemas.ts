import { z } from "zod";

export const addServerSchema = z.object({
  serverId: z.string(),
});
