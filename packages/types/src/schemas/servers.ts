import { z } from "zod";

export const addServerSchema = z.object({
  serverId: z.string(),
});

export const getServerSchema = z.object({
  serverId: z.string(),
});
