"use client";

import { MemberBadge } from "@/components/guildMembers/member-badge";
import Alert from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardTitle } from "@/components/ui/card";
import { getUserPictureUrl } from "@albion-raid-manager/discord/helpers";
import { useMembersContext } from "./context";

export function MembersList() {
  const { guildMembers } = useMembersContext();

  return (
    <Card variant="outline" className="p-4">
      <div className="flex items-center justify-between px-2">
        <CardTitle size="small">List of Members</CardTitle>
      </div>

      <Alert variant="info">This list contains only members that have participated in raids.</Alert>

      <ul className="space-y-2">
        {guildMembers.map((member) => (
          <li
            key={member.userId}
            className="hover:bg-muted/50 flex cursor-pointer items-center rounded-md px-3 py-2 transition-colors duration-150"
          >
            <Avatar className="mr-3 h-8 w-8">
              <AvatarImage src={getUserPictureUrl(member.user.id, member.user.avatar)} className="z-0" />
              <AvatarFallback>{member.user.username.substring(0, 1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex gap-2">
              <span className="text-card-foreground font-medium">{member.nickname ?? member.user.username}</span>
              {member.role !== "PLAYER" && <MemberBadge member={member} />}
            </div>
          </li>
        ))}
      </ul>

      <div className="px-2">
        <p>Members: {guildMembers.length}</p>
      </div>
    </Card>
  );
}
