import { Server } from "@albion-raid-manager/core/types/discord";
import { z } from "zod";

export const createGuildSchema = z.object({
  server: z.custom<Server>(),
});
