import { useState } from "react";

import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";

import { useRaidContext } from "../contexts/raid-context";

import { InlineEditCard } from "./inline-edit-card";

export function RaidStatsLocation() {
  const { raid, handleUpdateRaid, canManageRaid } = useRaidContext();
  const { t } = useTranslation();
  const [location, setLocation] = useState(raid?.location || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (location === raid?.location) {
      return;
    }

    setIsLoading(true);
    try {
      await handleUpdateRaid({ location });
    } catch {
      setLocation(raid?.location || "");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setLocation(raid?.location || "");
  };

  const editContent = (
    <Input
      value={location}
      onChange={(e) => setLocation(e.target.value)}
      placeholder={t("raids.stats.locationPlaceholder")}
      className="focus:border-primary/50 h-10 border-2 text-base transition-colors"
    />
  );

  return (
    <InlineEditCard
      title={t("raids.stats.location")}
      icon={faMapMarkerAlt}
      canEdit={canManageRaid}
      onSave={handleSave}
      onCancel={handleCancel}
      isLoading={isLoading}
      editContent={editContent}
    >
      <div className="truncate text-lg font-semibold">{location || t("raids.stats.noLocationSet")}</div>
      <p className="text-muted-foreground mt-1 text-xs">{t("raids.stats.meetingPoint")}</p>
    </InlineEditCard>
  );
}
