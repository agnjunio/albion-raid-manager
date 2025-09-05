import { z } from "zod";

export const createGuildRaidSchema = z.object({
  title: z.string().min(1),
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
  ]).optional(),
  description: z.string().min(1),
  date: z.string().datetime(),
  location: z.string().optional(),
  composition: z
    .object({
      id: z.string(),
    })
    .optional(),
});
