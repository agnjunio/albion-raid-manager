"use client";

import { detectServerMembers } from "@/actions/guildMembers";
import { MemberBadge } from "@/components/guildMembers/member-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { getUserPictureUrl } from "@albion-raid-manager/discord/helpers";
import { faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useMembersContext } from "./context";
import { MembersPageProps } from "./types";

export function MembersList() {
  const params = useParams<MembersPageProps["params"]>();
  const { guildMembers, setGuildMembers } = useMembersContext();
  const [isSyncing, setIsSyncing] = useState(false);

  const { guildId } = params;

  const handleSyncMembers = async () => {
    setIsSyncing(true);
    const response = await detectServerMembers(guildId);
    if (response.success) {
      setGuildMembers(response.data.guildMembers);
    }
    setIsSyncing(false);
  };

  return (
    <Card variant="outline" className="p-4">
      <div className="flex items-center justify-between px-2">
        <CardTitle size="small">List of Members</CardTitle>
        <Button disabled={isSyncing} onClick={handleSyncMembers}>
          <FontAwesomeIcon icon={faSync} />
          Sync Members
        </Button>
      </div>

      <ul className="space-y-2">
        {guildMembers.map((member) => (
          <li
            key={member.userId}
            className="hover:bg-muted/50 flex cursor-pointer items-center rounded-md px-3 py-2 transition-colors duration-150"
          >
            <Avatar className="mr-3 h-8 w-8">
              <AvatarImage src={getUserPictureUrl(member.user.id, member.user.avatar)} />
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
