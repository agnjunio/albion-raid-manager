"use client";

import { MemberBadge } from "@/components/guildMembers/member-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMembersContext } from "./context";

export function MembersList() {
  const { guildMembers } = useMembersContext();

  return (
    <div className="bg-card border-border rounded-lg border p-4">
      <h1 className="text-card-foreground font-title mb-4 px-2 text-xl font-semibold">List of Members</h1>
      <ul className="space-y-2">
        {guildMembers.map((member) => (
          <li
            key={member.userId}
            className="hover:bg-muted/50 flex cursor-pointer items-center rounded-md px-3 py-2 transition-colors duration-150"
          >
            <Avatar className="mr-3 h-8 w-8">
              {member.user.avatar && <AvatarImage src={member.user.avatar} />}
              <AvatarFallback>{member.user.username.substring(0, 1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex gap-2">
              <span className="text-card-foreground font-medium">{member.user.username}</span>
              {member.role !== "PLAYER" && <MemberBadge member={member} />}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
