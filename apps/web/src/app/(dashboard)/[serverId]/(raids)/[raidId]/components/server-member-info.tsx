import { useMemo } from "react";

import { getUserPictureUrl } from "@albion-raid-manager/core/utils/discord";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import { useRaidContext } from "../contexts/raid-context";

interface ServerMemberInfoProps {
  userId?: string | null;
  size?: "md" | "sm";
}

export function ServerMemberInfo({ userId, size = "md" }: ServerMemberInfoProps) {
  const { serverMembers } = useRaidContext();
  const serverMember = useMemo(() => serverMembers.find((m) => m.id === userId), [serverMembers, userId]);

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        {
          md: "gap-2",
          sm: "gap-1.5",
        }[size],
      )}
    >
      <Avatar
        className={cn(
          "size-6",
          {
            md: "h-6 w-6",
            sm: "size-5",
          }[size],
        )}
      >
        {userId && <AvatarImage src={getUserPictureUrl(userId, serverMember?.avatar)} />}
        <AvatarFallback className={cn("bg-primary/10")}>
          <FontAwesomeIcon
            icon={faUser}
            className={cn(
              "size-3",
              {
                md: "size-3",
                sm: "size-2.5",
              }[size],
            )}
          />
        </AvatarFallback>
      </Avatar>
      <span
        className={cn(
          "text-muted-foreground text-xs",
          {
            md: "text-xs",
            sm: "text-xs",
          }[size],
        )}
      >
        {userId ? serverMember?.nickname || serverMember?.username || "Unknown Member" : "Available"}
      </span>
    </div>
  );
}
