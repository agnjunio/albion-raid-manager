import { Server } from "@albion-raid-manager/types";
import { ServerMember } from "@albion-raid-manager/types/entities";

declare global {
  namespace Express {
    interface Request {
      context: {
        server?: Server;
        member?: ServerMember;
      };
    }
  }
}
