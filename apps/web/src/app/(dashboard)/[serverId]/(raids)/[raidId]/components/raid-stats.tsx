import { useMemo } from "react";

import { getContentTypeInfo } from "@albion-raid-manager/types/entities";
import { faCalendarAlt, faClock, faGamepad, faMapMarkerAlt, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { useRaidContext } from "../contexts/raid-context";

export function RaidStats() {
  const { raid } = useRaidContext();
  const totalSlots = raid.slots?.length || 0;
  const filledSlots = raid.slots?.filter((slot) => slot.user).length || 0;
  const fillPercentage = totalSlots > 0 ? (filledSlots / totalSlots) * 100 : 0;

  const timeStatus = useMemo(() => {
    const now = new Date();
    const raidDate = new Date(raid.date);
    const daysUntilRaid = differenceInDays(raidDate, now);
    const hoursUntilRaid = differenceInHours(raidDate, now);
    const minutesUntilRaid = differenceInMinutes(raidDate, now);

    if (minutesUntilRaid < -30) return { text: "Past", color: "bg-gray-500" };
    if (minutesUntilRaid <= 0) return { text: "Starting soon", color: "bg-green-500" };
    if (minutesUntilRaid <= 30) return { text: `Starting in ${minutesUntilRaid} minutes`, color: "bg-green-600" };
    if (daysUntilRaid > 7) return { text: `${daysUntilRaid} days`, color: "bg-blue-500" };
    if (daysUntilRaid > 1) return { text: `${daysUntilRaid} days`, color: "bg-yellow-500" };
    if (hoursUntilRaid > 1) return { text: `${hoursUntilRaid} hours`, color: "bg-orange-500" };
    return { text: "Starting soon", color: "bg-red-500" };
  }, [raid.date]);

  const contentTypeInfo = getContentTypeInfo(raid.contentType ?? undefined);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Participants */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <FontAwesomeIcon icon={faUsers} className="h-4 w-4" />
            Participants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {filledSlots} / {totalSlots}
          </div>
          <Progress value={fillPercentage} className="mt-2 h-2" />
          <p className="text-muted-foreground mt-1 text-xs">{fillPercentage.toFixed(0)}% filled</p>
        </CardContent>
      </Card>

      {/* Time Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <FontAwesomeIcon icon={faClock} className="h-4 w-4" />
            Time Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge className={`${timeStatus.color} text-white`}>{timeStatus.text}</Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            {new Date(raid.date).toLocaleString(navigator.language, {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </CardContent>
      </Card>

      {/* Content Type */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <FontAwesomeIcon icon={faGamepad} className="h-4 w-4" />
            Content Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">{contentTypeInfo.displayName}</div>
          <p className="text-muted-foreground mt-1 text-xs">{contentTypeInfo.description}</p>
        </CardContent>
      </Card>

      {/* Location */}
      {raid.location && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="h-4 w-4" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="truncate text-lg font-semibold">{raid.location}</div>
            <p className="text-muted-foreground mt-1 text-xs">Meeting point</p>
          </CardContent>
        </Card>
      )}

      {/* Raid Type */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <FontAwesomeIcon icon={faCalendarAlt} className="h-4 w-4" />
            Raid Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">{raid.type === "FIXED" ? "Fixed" : "Flexible"}</div>
          <p className="text-muted-foreground mt-1 text-xs">
            {raid.type === "FIXED"
              ? "Structured composition"
              : raid.maxPlayers
                ? `Up to ${raid.maxPlayers} players`
                : "Unlimited players"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
