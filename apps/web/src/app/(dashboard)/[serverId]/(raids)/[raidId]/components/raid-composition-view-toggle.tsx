import { faList, faTh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { useViewMode, ViewMode } from "../contexts/view-mode-context";

export function RaidCompositionViewToggle() {
  const { viewMode, setViewMode } = useViewMode();

  return (
    <ToggleGroup
      type="single"
      value={viewMode}
      onValueChange={(value: ViewMode) => {
        if (value) setViewMode(value);
      }}
    >
      <ToggleGroupItem value="list" variant="outline">
        <FontAwesomeIcon icon={faList} />
      </ToggleGroupItem>
      <ToggleGroupItem value="grid" variant="outline">
        <FontAwesomeIcon icon={faTh} />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
