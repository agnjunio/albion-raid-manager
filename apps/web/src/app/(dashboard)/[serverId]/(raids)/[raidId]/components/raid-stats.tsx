import { useMemo } from "react";

import { getContentTypeInfo } from "@albion-raid-manager/types/entities";
import { faGamepad, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { useRaidContext } from "../contexts/raid-context";

import { RaidStatsLocation } from "./raid-stats-location";
import { RaidStatsTime } from "./raid-stats-time";

export function RaidStats() {
  const { raid } = useRaidContext();

  const stats = useMemo(() => {
    const totalSlots = raid.slots?.length || 0;
    const filledSlots = raid.slots?.filter((slot) => slot.userId).length || 0;
    const fillPercentage = totalSlots > 0 ? (filledSlots / totalSlots) * 100 : 0;

    return { totalSlots, filledSlots, fillPercentage };
  }, [raid.slots]);

  const contentTypeInfo = useMemo(() => {
    return getContentTypeInfo(raid.contentType ?? undefined);
  }, [raid.contentType]);

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
            {stats.filledSlots} / {stats.totalSlots}
          </div>
          <Progress value={stats.fillPercentage} className="mt-2 h-2" />
          <p className="text-muted-foreground mt-1 text-right text-xs">{stats.fillPercentage.toFixed(0)}% filled</p>
        </CardContent>
      </Card>

      {/* Time Status */}
      <RaidStatsTime />

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
      <RaidStatsLocation />
    </div>
  );
}
