import { z } from "zod";

export const addServerSchema = z.object({
  serverId: z.string(),
});

export const verifyServerSchema = z.object({
  serverId: z.string(),
});
