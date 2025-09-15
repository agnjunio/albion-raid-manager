import { useMemo, useState } from "react";

import { faClock } from "@fortawesome/free-solid-svg-icons";
import { differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { getCurrentLanguage, getDateFnsLocale } from "@/lib/locale";

import { useRaidContext } from "../contexts/raid-context";

import { InlineEditCard } from "./inline-edit-card";

export function RaidStatsTime() {
  const { raid, handleUpdateRaid, canManageRaid } = useRaidContext();
  const { t } = useTranslation();
  const [value, setValue] = useState(raid ? new Date(raid.date) : new Date());
  const [isLoading, setIsLoading] = useState(false);

  const timeStatus = useMemo(() => {
    if (!raid) return { text: t("raids.stats.timeStatuses.loading"), color: "bg-gray-500" };

    const now = new Date();
    const raidDate = new Date(raid.date);
    const daysUntilRaid = differenceInDays(raidDate, now);
    const hoursUntilRaid = differenceInHours(raidDate, now);
    const minutesUntilRaid = differenceInMinutes(raidDate, now);

    if (minutesUntilRaid < -30) return { text: t("raids.stats.timeStatuses.past"), color: "bg-gray-500" };
    if (minutesUntilRaid <= 0) return { text: t("raids.stats.timeStatuses.startingSoon"), color: "bg-green-500" };
    if (minutesUntilRaid <= 30)
      return {
        text: t("raids.stats.timeStatuses.startingInMinutes", { count: minutesUntilRaid }),
        color: "bg-green-600",
      };
    if (daysUntilRaid > 7)
      return { text: t("raids.stats.timeStatuses.days", { count: daysUntilRaid }), color: "bg-blue-500" };
    if (daysUntilRaid > 1)
      return { text: t("raids.stats.timeStatuses.days", { count: daysUntilRaid }), color: "bg-yellow-500" };
    if (hoursUntilRaid > 1)
      return { text: t("raids.stats.timeStatuses.hours", { count: hoursUntilRaid }), color: "bg-orange-500" };
    return { text: t("raids.stats.timeStatuses.startingSoon"), color: "bg-red-500" };
  }, [raid, t]);

  const handleSave = async () => {
    if (!raid) return;

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
    if (raid) {
      setValue(new Date(raid.date));
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString(getCurrentLanguage(), {
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
      <p className="text-muted-foreground mt-1 text-xs">
        {raid ? formatDate(new Date(raid.date)) : t("raids.stats.timeStatuses.loading")}
      </p>
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
      locale={getDateFnsLocale()}
    />
  );

  return (
    <InlineEditCard
      title={t("raids.stats.timeStatus")}
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
