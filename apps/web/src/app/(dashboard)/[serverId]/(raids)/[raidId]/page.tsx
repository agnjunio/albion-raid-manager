import { useEffect, useState } from "react";

import { faCopy, faDownload, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "sonner";

import { RaidStatusBadge } from "@/components/raids/raid-badge";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Loading from "@/components/ui/loading";
import { Page, PageError } from "@/components/ui/page";
import { isAPIError } from "@/lib/api";

import { InlineEditField } from "./components/inline-edit-field";
import { RaidActions } from "./components/raid-actions";
import { RaidComposition } from "./components/raid-composition";
import { RaidNotes } from "./components/raid-notes";
import { RaidStats } from "./components/raid-stats";
import { useRaidContext } from "./contexts/raid-context";
import { downloadRaidConfiguration, exportRaidConfiguration } from "./utils/raid-export-import";

export function RaidPage() {
  const { raid, isLoading, error, handleCopyRaidLink, handleDeleteRaid, handleUpdateRaid, canManageRaid } =
    useRaidContext();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (raid) {
      setTitle(raid.title);
      setDescription(raid.description || "");
    }
  }, [raid]);

  // Handle loading state
  if (isLoading) {
    return <Loading />;
  }

  // Handle error state
  if (error || !raid) {
    return <PageError variant="error" error={isAPIError(error) ? error.data : "Failed to get raid"} />;
  }

  const handleExport = () => {
    try {
      const configuration = exportRaidConfiguration(raid);
      downloadRaidConfiguration(configuration, raid.title);
      toast.success("Raid configuration exported successfully", {
        description: "The raid configuration has been downloaded as a JSON file.",
      });
    } catch (error) {
      toast.error("Failed to export raid configuration", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };

  return (
    <Page className="items-center pb-20">
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
                  onClick={handleExport}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <FontAwesomeIcon icon={faDownload} className="mr-2 h-4 w-4" />
                  Export Config
                </Button>
                {canManageRaid && (
                  <Button
                    onClick={handleDeleteRaid}
                    variant="destructive"
                    size="sm"
                    className="bg-red-800 text-white hover:bg-red-900"
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
            </div>

            {/* Main content */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-4">
                  <InlineEditField
                    value={title}
                    onChange={setTitle}
                    onSave={async (newTitle) => {
                      await handleUpdateRaid({ title: newTitle });
                    }}
                    onCancel={() => setTitle(raid.title)}
                    canEdit={canManageRaid}
                    className="text-3xl font-bold"
                    displayClassName="text-3xl font-bold"
                  />
                  <RaidStatusBadge status={raid.status} />
                </div>
                <div className="text-muted-foreground font-mono text-sm">Raid ID: {raid.id}</div>
              </div>

              <InlineEditField
                value={description}
                onChange={setDescription}
                onSave={async (newDescription) => {
                  await handleUpdateRaid({ description: newDescription });
                }}
                onCancel={() => setDescription(raid.description || "")}
                canEdit={canManageRaid}
                multiline
                placeholder="Enter raid description..."
                className="text-muted-foreground text-lg leading-relaxed"
                displayClassName="text-muted-foreground text-lg leading-relaxed"
                emptyText="No description provided - click to add"
              />
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
