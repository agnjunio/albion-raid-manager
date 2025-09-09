import { faCopy, faShare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { RaidStatusBadge } from "@/components/raids/raid-badge";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Page } from "@/components/ui/page";

import { RaidActions } from "./components/raid-actions";
import { RaidComposition } from "./components/raid-composition";
import { RaidNotes } from "./components/raid-notes";
import { RaidStats } from "./components/raid-stats";
import { useRaidContext } from "./contexts/raid-context";

export function RaidPage() {
  const { raid, handleCopyRaidLink, handleShareRaid, handleDeleteRaid } = useRaidContext();

  return (
    <Page className="items-center">
      <div className="flex max-w-7xl flex-col gap-6">
        {/* Raid Header with integrated back button */}
        <Card>
          <CardHeader className="pb-4">
            {/* Top navigation bar */}
            <div className="border-border/50 mb-6 flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-4">
                <BackButton label="Back to Raids" />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyRaidLink}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <FontAwesomeIcon icon={faCopy} className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareRaid}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <FontAwesomeIcon icon={faShare} className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button
                  onClick={handleDeleteRaid}
                  variant="destructive"
                  size="sm"
                  className="bg-red-800 text-white hover:bg-red-900"
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Main content */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-4">
                  <CardTitle size="large">{raid.title}</CardTitle>
                  <RaidStatusBadge status={raid.status} />
                </div>
                <div className="text-muted-foreground font-mono text-sm">Raid ID: {raid.id}</div>
              </div>

              {raid.description && (
                <p className="text-muted-foreground max-w-4xl text-lg leading-relaxed">{raid.description}</p>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <RaidStats />
          </CardContent>
        </Card>

        <RaidActions />

        {raid.note && <RaidNotes />}

        <RaidComposition />
      </div>
    </Page>
  );
}
