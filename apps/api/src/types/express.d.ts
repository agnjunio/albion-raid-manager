import type { Cache } from "@albion-raid-manager/core/redis";

import { Server, ServerMember } from "@albion-raid-manager/types/entities";

declare global {
  namespace Express {
    interface Request {
      context: {
        server?: Server;
        member?: ServerMember;
        cache?: Cache;
      };
    }
  }
}
