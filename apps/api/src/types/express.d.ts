import { Guild, GuildMember } from "@albion-raid-manager/core/types";

declare global {
  namespace Express {
    interface Request {
      context: {
        guild?: Guild;
        member?: GuildMember;
      };
    }
  }
}
