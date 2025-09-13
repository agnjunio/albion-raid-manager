import { useState } from "react";

import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";

import { Input } from "@/components/ui/input";

import { useRaidContext } from "../contexts/raid-context";

import { InlineEditCard } from "./inline-edit-card";

export function RaidStatsLocation() {
  const { raid, handleUpdateRaid, canManageRaid } = useRaidContext();
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
      placeholder="e.g., Black Zone, Royal City..."
      className="focus:border-primary/50 h-10 border-2 text-base transition-colors"
    />
  );

  return (
    <InlineEditCard
      title="Location"
      icon={faMapMarkerAlt}
      canEdit={canManageRaid}
      onSave={handleSave}
      onCancel={handleCancel}
      isLoading={isLoading}
      editContent={editContent}
    >
      <div className="truncate text-lg font-semibold">{location || "No location set"}</div>
      <p className="text-muted-foreground mt-1 text-xs">Meeting point</p>
    </InlineEditCard>
  );
}
