import { faLock, faUnlock, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { raidStatuses } from "@/lib/constants";

import { useRaidContext } from "../contexts/raid-context";

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

  const handleCancelRaid = () => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel the raid "${raid.title}"?\n\nThis action cannot be undone and all participants will be notified.`,
    );

    if (confirmed) {
      handleUpdateRaidStatus("CANCELLED");
    }
  };

  if (!canManageRaid) return null;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <FontAwesomeIcon icon={raidStatuses[raid.status].icon} className="text-primary h-5 w-5" />
          </div>
          Raid Management
        </CardTitle>
      </CardHeader>
      <CardContent>
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
          <div className="space-y-6">
            {/* Primary Actions */}
            <div className="space-y-3">
              <h4 className="text-muted-foreground text-sm font-medium uppercase tracking-wide">Raid Actions</h4>
              <div className="flex flex-wrap gap-3">
                {hasStatus("SCHEDULED", "CLOSED") && (
                  <Button
                    onClick={() => handleUpdateRaidStatus("OPEN")}
                    size="lg"
                    className={`${raidStatuses.OPEN.color} shadow-lg transition-all duration-200 hover:opacity-90 hover:shadow-xl focus:ring-2 focus:ring-green-500/20`}
                  >
                    <FontAwesomeIcon icon={faUnlock} className="mr-2 h-4 w-4" />
                    Open Registration
                  </Button>
                )}
                {hasStatus("OPEN") && (
                  <Button
                    onClick={() => handleUpdateRaidStatus("CLOSED")}
                    size="lg"
                    className={`${raidStatuses.CLOSED.color} shadow-lg transition-all duration-200 hover:opacity-90 hover:shadow-xl focus:ring-2 focus:ring-red-500/20`}
                  >
                    <FontAwesomeIcon icon={faLock} className="mr-2 h-4 w-4" />
                    Close Registration
                  </Button>
                )}
                {hasStatus("OPEN", "CLOSED", "FINISHED") && (
                  <Button
                    onClick={() => handleUpdateRaidStatus("ONGOING")}
                    size="lg"
                    className={`${raidStatuses.ONGOING.color} shadow-lg transition-all duration-200 hover:opacity-90 hover:shadow-xl focus:ring-2 focus:ring-yellow-500/20`}
                  >
                    <FontAwesomeIcon icon={raidStatuses.ONGOING.icon} className="mr-2 h-4 w-4" />
                    Start Raid
                  </Button>
                )}
                {hasStatus("ONGOING") && (
                  <Button
                    onClick={() => handleUpdateRaidStatus("FINISHED")}
                    size="lg"
                    className={`${raidStatuses.FINISHED.color} shadow-lg transition-all duration-200 hover:opacity-90 hover:shadow-xl focus:ring-2 focus:ring-gray-500/20`}
                  >
                    <FontAwesomeIcon icon={raidStatuses.FINISHED.icon} className="mr-2 h-4 w-4" />
                    Finish Raid
                  </Button>
                )}
              </div>
            </div>

            {/* Secondary Actions */}
            {hasStatus("SCHEDULED", "OPEN", "CLOSED", "ONGOING") && (
              <div className="border-border/50 border-t pt-4">
                <h4 className="text-muted-foreground mb-3 text-sm font-medium uppercase tracking-wide">Danger Zone</h4>
                <Button
                  onClick={handleCancelRaid}
                  variant="destructive"
                  size="lg"
                  className={`${raidStatuses.CANCELLED.color} shadow-lg transition-all duration-200 hover:opacity-90 hover:shadow-xl focus:ring-2 focus:ring-red-500/20`}
                >
                  <FontAwesomeIcon icon={raidStatuses.CANCELLED.icon} className="mr-2 h-4 w-4" />
                  Cancel Raid
                </Button>
                <p className="text-muted-foreground mt-2 text-xs">
                  This action cannot be undone. All participants will be notified.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
