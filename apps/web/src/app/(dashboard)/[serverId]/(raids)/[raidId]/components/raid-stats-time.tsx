import { useMemo, useState } from "react";

import { faClock } from "@fortawesome/free-solid-svg-icons";
import { differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { DateTimePicker } from "@/components/ui/datetime-picker";

import { useRaidContext } from "../contexts/raid-context";

import { InlineEditCard } from "./inline-edit-card";

export function RaidStatsTime() {
  const { raid, handleUpdateRaid, canManageRaid } = useRaidContext();
  const [value, setValue] = useState(new Date(raid.date));
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSave = async () => {
    const originalDate = new Date(raid.date);
    if (value.getTime() === originalDate.getTime()) {
      return;
    }

    setIsLoading(true);
    try {
      await handleUpdateRaid({ date: value });
    } catch {
      setValue(originalDate); // Reset to original value on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setValue(new Date(raid.date));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString(navigator.language, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const displayContent = (
    <>
      <div className="flex items-center gap-2">
        <Badge className={`${timeStatus.color} text-white`}>{timeStatus.text}</Badge>
      </div>
      <p className="text-muted-foreground mt-1 text-xs">{formatDate(new Date(raid.date))}</p>
    </>
  );

  const editContent = (
    <DateTimePicker
      value={value}
      onChange={(date) => date && setValue(date)}
      hourCycle={24}
      granularity="minute"
      minuteIncrement={30}
      displayFormat={{ hour24: "dd/MM/yyyy HH:mm" }}
      className="w-full"
      disabled={isLoading}
    />
  );

  return (
    <InlineEditCard
      title="Time Status"
      icon={faClock}
      canEdit={canManageRaid}
      onSave={handleSave}
      onCancel={handleCancel}
      isLoading={isLoading}
      editContent={editContent}
    >
      {displayContent}
    </InlineEditCard>
  );
}
