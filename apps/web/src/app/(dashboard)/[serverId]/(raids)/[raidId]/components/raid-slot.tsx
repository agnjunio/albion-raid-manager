import type { RaidSlot } from "@albion-raid-manager/types";

import { getUserPictureUrl } from "@albion-raid-manager/core/utils/discord";
import { faComment, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  slot: RaidSlot;
}

const roleColors: Record<string, string> = {
  TANK: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  CALLER:
    "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
  SUPPORT:
    "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
  HEALER: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
  RANGED_DPS: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
  MELEE_DPS:
    "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
  BATTLEMOUNT:
    "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800",
  UNASSIGNED: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800",
};

const roleIcons: Record<string, string> = {
  TANK: "🛡️",
  CALLER: "📢",
  SUPPORT: "⚡",
  HEALER: "💚",
  RANGED_DPS: "🏹",
  MELEE_DPS: "⚔️",
  BATTLEMOUNT: "🐎",
  UNASSIGNED: "❓",
};

export function RaidSlotCard({ slot }: Props) {
  const role = slot.role || "UNASSIGNED";
  const isFilled = !!slot.user;
  const roleColor = roleColors[role] || roleColors.UNASSIGNED;
  const roleIcon = roleIcons[role] || roleIcons.UNASSIGNED;

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        isFilled ? "border-green-200 dark:border-green-800" : "border-dashed",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Role Icon */}
            <div className="text-2xl">{roleIcon}</div>

            {/* Slot Info */}
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h4 className="text-sm font-semibold">{slot.name}</h4>
                <Badge variant="outline" className={cn("text-xs", roleColor)}>
                  {role.replace("_", " ")}
                </Badge>
              </div>

              {slot.comment && (
                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                  <FontAwesomeIcon icon={faComment} className="h-3 w-3" />
                  <span className="truncate">{slot.comment}</span>
                </div>
              )}
            </div>
          </div>

          {/* User Info or Empty State */}
          <div className="flex items-center gap-2">
            {isFilled ? (
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-medium">{slot.user!.username}</p>
                  {slot.joinedAt && (
                    <p className="text-muted-foreground text-xs">
                      Joined {new Date(slot.joinedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getUserPictureUrl(slot.user!.id, slot.user!.avatar)} alt={slot.user!.username} />
                  <AvatarFallback className="text-xs">{slot.user!.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
            ) : (
              <div className="text-muted-foreground flex items-center gap-2">
                <FontAwesomeIcon icon={faUserPlus} className="h-4 w-4" />
                <span className="text-sm">Available</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
