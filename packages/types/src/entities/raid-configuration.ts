import { z } from "zod";

import { raidConfigurationSchema } from "../schemas/raids";

export type RaidConfiguration = z.infer<typeof raidConfigurationSchema>;
