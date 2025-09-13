import { useState } from "react";

import {
  faChevronDown,
  faChevronUp,
  faGear,
  faLock,
  faPlay,
  faUnlock,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { raidStatuses } from "@/lib/constants";

import { useRaidContext } from "../contexts/raid-context";

import { RaidImportDragDrop } from "./raid-import-drag-drop";

interface RaidStatusMessageProps {
  icon: IconDefinition;
  title: string;
  description: string;
  note: string;
  iconColor: string;
  bgColor: string;
}

function RaidStatusMessage({ icon, title, description, note, iconColor, bgColor }: RaidStatusMessageProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className={`mx-auto flex size-14 items-center justify-center rounded-full ${bgColor}`}>
        <FontAwesomeIcon icon={icon} className={`text-2xl ${iconColor}`} />
      </div>
      <h3 className="text-foreground text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground max-w-md text-center text-sm leading-relaxed">{description}</p>
      <div className="text-muted-foreground bg-muted/50 rounded-lg px-4 py-2 text-xs">{note}</div>
    </div>
  );
}

export function RaidActions() {
  const { raid, canManageRaid, handleUpdateRaidStatus, hasStatus } = useRaidContext();
  const [expandedSections, setExpandedSections] = useState({
    actions: false,
    configuration: false,
    danger: false,
  });

  const handleCancelRaid = () => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel the raid "${raid.title}"?\n\nThis action cannot be undone and all participants will be notified.`,
    );

    if (confirmed) {
      handleUpdateRaidStatus("CANCELLED");
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!canManageRaid) return null;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <FontAwesomeIcon icon={faGear} className="text-primary h-5 w-5" />
          </div>
          Raid Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {hasStatus("CANCELLED") ? (
          <RaidStatusMessage
            icon={raidStatuses.CANCELLED.icon}
            title="Raid Cancelled"
            description="This raid has been cancelled and is no longer available for management."
            note="Cancelled raids cannot be reopened or modified"
            iconColor="text-red-500 dark:text-red-400"
            bgColor="bg-red-50 dark:bg-red-950/30"
          />
        ) : hasStatus("FINISHED") ? (
          <RaidStatusMessage
            icon={raidStatuses.FINISHED.icon}
            title="Raid Completed"
            description="This raid has been finished successfully."
            note="Completed raids are read-only and cannot be modified"
            iconColor="text-gray-500 dark:text-gray-400"
            bgColor="bg-gray-50 dark:bg-gray-950/30"
          />
        ) : (
          <>
            {/* Raid Actions Section */}
            <div className="border-border/50 rounded-lg border">
              <button
                onClick={() => toggleSection("actions")}
                className="hover:bg-muted/50 flex w-full items-center justify-between p-3 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                    <FontAwesomeIcon icon={faPlay} className="text-primary h-4 w-4" />
                  </div>
                  <span className="font-medium">Raid Actions</span>
                </div>
                <FontAwesomeIcon
                  icon={expandedSections.actions ? faChevronUp : faChevronDown}
                  className="text-muted-foreground h-4 w-4"
                />
              </button>
              {expandedSections.actions && (
                <div className="border-border/50 border-t p-3">
                  <div className="space-y-3">
                    {hasStatus("SCHEDULED", "CLOSED") && (
                      <div className="space-y-1">
                        <Button
                          onClick={() => handleUpdateRaidStatus("OPEN")}
                          size="sm"
                          className={`${raidStatuses.OPEN.color} shadow-sm transition-all duration-200 hover:opacity-90`}
                        >
                          <FontAwesomeIcon icon={faUnlock} className="mr-2 h-3 w-3" />
                          Open Registration
                        </Button>
                        <p className="text-muted-foreground text-xs">
                          Allow players to join the raid and fill available slots.
                        </p>
                      </div>
                    )}
                    {hasStatus("OPEN") && (
                      <div className="space-y-1">
                        <Button
                          onClick={() => handleUpdateRaidStatus("CLOSED")}
                          size="sm"
                          className={`${raidStatuses.CLOSED.color} shadow-sm transition-all duration-200 hover:opacity-90`}
                        >
                          <FontAwesomeIcon icon={faLock} className="mr-2 h-3 w-3" />
                          Close Registration
                        </Button>
                        <p className="text-muted-foreground text-xs">
                          Stop new players from joining while keeping current participants.
                        </p>
                      </div>
                    )}
                    {hasStatus("OPEN", "CLOSED", "FINISHED") && (
                      <div className="space-y-1">
                        <Button
                          onClick={() => handleUpdateRaidStatus("ONGOING")}
                          size="sm"
                          className={`${raidStatuses.ONGOING.color} shadow-sm transition-all duration-200 hover:opacity-90`}
                        >
                          <FontAwesomeIcon icon={raidStatuses.ONGOING.icon} className="mr-2 h-3 w-3" />
                          Start Raid
                        </Button>
                        <p className="text-muted-foreground text-xs">
                          Mark the raid as currently in progress and notify all participants.
                        </p>
                      </div>
                    )}
                    {hasStatus("ONGOING") && (
                      <div className="space-y-1">
                        <Button
                          onClick={() => handleUpdateRaidStatus("FINISHED")}
                          size="sm"
                          className={`${raidStatuses.FINISHED.color} shadow-sm transition-all duration-200 hover:opacity-90`}
                        >
                          <FontAwesomeIcon icon={raidStatuses.FINISHED.icon} className="mr-2 h-3 w-3" />
                          Finish Raid
                        </Button>
                        <p className="text-muted-foreground text-xs">
                          Complete the raid and mark it as finished for all participants.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Configuration Section */}
            <div className="border-border/50 rounded-lg border">
              <button
                onClick={() => toggleSection("configuration")}
                className="hover:bg-muted/50 flex w-full items-center justify-between p-3 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                    <FontAwesomeIcon icon={faUnlock} className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="font-medium">Configuration</span>
                </div>
                <FontAwesomeIcon
                  icon={expandedSections.configuration ? faChevronUp : faChevronDown}
                  className="text-muted-foreground h-4 w-4"
                />
              </button>
              {expandedSections.configuration && (
                <div className="border-border/50 border-t p-3">
                  <div className="space-y-3">
                    <div>
                      <p className="text-muted-foreground mb-3 text-xs">
                        Import a raid configuration from another raid of the same content type. This will replace the
                        current raid&apos;s description, notes, location, and slot composition.
                      </p>
                      <RaidImportDragDrop disabled={!hasStatus("SCHEDULED", "OPEN", "CLOSED", "ONGOING")} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Danger Zone Section */}
            {hasStatus("SCHEDULED", "OPEN", "CLOSED", "ONGOING") && (
              <div className="rounded-lg border border-red-500/20">
                <button
                  onClick={() => toggleSection("danger")}
                  className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-red-500/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                      <FontAwesomeIcon icon={raidStatuses.CANCELLED.icon} className="h-4 w-4 text-red-500" />
                    </div>
                    <span className="font-medium text-red-600 dark:text-red-400">Danger Zone</span>
                  </div>
                  <FontAwesomeIcon
                    icon={expandedSections.danger ? faChevronUp : faChevronDown}
                    className="text-muted-foreground h-4 w-4"
                  />
                </button>
                {expandedSections.danger && (
                  <div className="border-t border-red-500/20 p-3">
                    <div className="space-y-3">
                      <p className="text-muted-foreground text-xs">
                        Permanently cancel this raid and notify all participants. This action cannot be undone and will
                        remove the raid from all participants&apos; views.
                      </p>
                      <Button
                        onClick={handleCancelRaid}
                        variant="destructive"
                        size="sm"
                        className="shadow-sm transition-all duration-200 hover:opacity-90"
                      >
                        <FontAwesomeIcon icon={raidStatuses.CANCELLED.icon} className="mr-2 h-3 w-3" />
                        Cancel Raid
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
