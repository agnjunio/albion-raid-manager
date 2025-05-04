import { GuildMemberWithUser } from "@/types/database";
import { cn } from "@albion-raid-manager/common/helpers/classNames";
import { GuildMemberRole } from "@albion-raid-manager/database/models";

const roleClassName: Record<GuildMemberRole, string> = {
  LEADER: "bg-primary/20 text-primary",
  OFFICER: "bg-secondary/20 text-secondary",
  PLAYER: "bg-muted/20 text-muted-foreground",
};

export function MemberBadge({ member }: { member: GuildMemberWithUser }) {
  return (
    <div className={cn("flex items-center justify-center rounded-full px-2 py-0.5", roleClassName[member.role])}>
      <span className={cn("text-xs uppercase")}>{member.role}</span>
    </div>
  );
}
