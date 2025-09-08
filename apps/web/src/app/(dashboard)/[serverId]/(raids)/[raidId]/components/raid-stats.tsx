import type { Raid, RaidSlot } from "@albion-raid-manager/types";

import { faUsers, faClock, faMapMarkerAlt, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface RaidStatsProps {
  raid: Raid;
}

export function RaidStats({ raid }: RaidStatsProps) {
  const totalSlots = raid.slots?.length || 0;
  const filledSlots = raid.slots?.filter((slot) => slot.user).length || 0;
  const fillPercentage = totalSlots > 0 ? (filledSlots / totalSlots) * 100 : 0;

  // Calculate role distribution
  const roleDistribution =
    raid.slots?.reduce(
      (acc, slot) => {
        const role = slot.role || "UNASSIGNED";
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ) || {};

  // Calculate time until raid
  const now = new Date();
  const raidDate = new Date(raid.date);
  const timeUntilRaid = raidDate.getTime() - now.getTime();
  const daysUntilRaid = Math.ceil(timeUntilRaid / (1000 * 60 * 60 * 24));
  const hoursUntilRaid = Math.ceil(timeUntilRaid / (1000 * 60 * 60));

  const getTimeStatus = () => {
    if (timeUntilRaid < 0) return { text: "Past", color: "bg-gray-500" };
    if (daysUntilRaid > 7) return { text: `${daysUntilRaid} days`, color: "bg-blue-500" };
    if (daysUntilRaid > 1) return { text: `${daysUntilRaid} days`, color: "bg-yellow-500" };
    if (hoursUntilRaid > 1) return { text: `${hoursUntilRaid} hours`, color: "bg-orange-500" };
    return { text: "Starting soon", color: "bg-red-500" };
  };

  const timeStatus = getTimeStatus();

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
