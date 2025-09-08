import { Server, ServerMember } from "@albion-raid-manager/types";

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
