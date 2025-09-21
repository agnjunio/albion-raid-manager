import { faExclamationTriangle, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "@/components/ui/button";

import { useServerSettings } from "../contexts/server-settings-context";

interface SettingsStickyFooterProps {
  onSave: () => void;
  onDiscard: () => void;
}

export function SettingsStickyFooter({ onSave, onDiscard }: SettingsStickyFooterProps) {
  const { hasUnsavedChanges, isSaving } = useServerSettings();

  // Only render when there are unsaved changes
  if (!hasUnsavedChanges && !isSaving) {
    return null;
  }

  return (
    <div className="border-border/50 bg-muted/30 animate-in slide-in-from-bottom-4 sticky bottom-0 border-t px-6 py-4 shadow-lg backdrop-blur-sm duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="text-muted-foreground text-sm">
            {hasUnsavedChanges ? (
              <span className="animate-in fade-in-0 flex items-center gap-2 duration-200">
                <FontAwesomeIcon icon={faExclamationTriangle} className="h-3 w-3 animate-pulse text-amber-500" />
                You have unsaved changes
              </span>
            ) : (
              <span className="animate-in fade-in-0 flex items-center gap-2 duration-200">
                <FontAwesomeIcon icon={faSave} className="h-3 w-3 text-green-500" />
                All changes saved
              </span>
            )}
          </div>
          <p className="text-muted-foreground animate-in fade-in-0 text-xs delay-100 duration-300">
            Changes are automatically saved when you submit the form
          </p>
        </div>
        <div className="animate-in fade-in-0 flex flex-col gap-3 delay-200 duration-300 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="hover:bg-muted transition-all duration-200 hover:scale-105 sm:min-w-[140px] sm:flex-none"
            onClick={onDiscard}
            disabled={isSaving}
          >
            <FontAwesomeIcon icon={faTimes} className="mr-2 h-4 w-4" />
            Discard Changes
          </Button>
          <Button
            type="button"
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105 sm:min-w-[160px] sm:flex-none"
            onClick={onSave}
            disabled={isSaving || !hasUnsavedChanges}
          >
            <FontAwesomeIcon icon={faSave} className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
