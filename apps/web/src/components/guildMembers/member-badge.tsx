import { cn } from "@albion-raid-manager/core/helpers";
import { type GuildMember, type GuildMemberRole } from "@albion-raid-manager/core/types";

const roleClassName: Record<GuildMemberRole, string> = {
  LEADER: "bg-primary/20 text-primary",
  OFFICER: "bg-secondary/20 text-secondary",
  PLAYER: "bg-muted/20 text-muted-foreground",
};

export function MemberBadge({ member }: { member: GuildMember }) {
  return (
    <div className={cn("flex items-center justify-center rounded-full px-2 py-0.5", roleClassName[member.role])}>
      <span className={cn("text-xs uppercase")}>{member.role}</span>
    </div>
  );
}
