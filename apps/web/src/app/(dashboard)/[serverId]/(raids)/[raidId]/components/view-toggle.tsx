import { faList, faTh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "@/components/ui/button";

export type ViewMode = "list" | "grid";

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ currentView, onViewChange, className }: ViewToggleProps) {
  return (
    <div className={`bg-muted flex gap-2 rounded-lg p-1 ${className}`}>
      <Button
        variant={currentView === "list" ? "primary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("list")}
        className={`flex-1 transition-all duration-200 ${
          currentView === "list"
            ? "bg-primary text-primary-foreground scale-105 shadow-sm"
            : "hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground hover:scale-105"
        }`}
      >
        <FontAwesomeIcon
          icon={faList}
          className={`mr-2 h-4 w-4 transition-all duration-200 ${
            currentView === "list" ? "text-primary-foreground scale-110" : "text-muted-foreground"
          }`}
        />
        <span
          className={`pr-2 transition-all duration-200 ${currentView === "list" ? "font-semibold" : "font-normal"}`}
        >
          List
        </span>
      </Button>
      <Button
        variant={currentView === "grid" ? "primary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("grid")}
        className={`flex-1 transition-all duration-200 ${
          currentView === "grid"
            ? "bg-primary text-primary-foreground scale-105 shadow-sm"
            : "hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground hover:scale-105"
        }`}
      >
        <FontAwesomeIcon
          icon={faTh}
          className={`mr-2 h-4 w-4 transition-all duration-200 ${
            currentView === "grid" ? "text-primary-foreground scale-110" : "text-muted-foreground"
          }`}
        />
        <span className={`transition-all duration-200 ${currentView === "grid" ? "font-semibold" : "font-normal"}`}>
          Grid
        </span>
      </Button>
    </div>
  );
}
