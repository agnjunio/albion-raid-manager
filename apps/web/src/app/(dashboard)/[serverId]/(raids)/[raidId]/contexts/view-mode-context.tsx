import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ViewMode = "list" | "grid";

interface ViewModeContextValue {
  viewMode: ViewMode;
  setViewMode: (viewMode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextValue | undefined>(undefined);

interface ViewModeProviderProps {
  children: ReactNode;
  storageKey?: string;
  defaultViewMode?: ViewMode;
}

export function ViewModeProvider({
  children,
  storageKey = "raid-composition-view-mode",
  defaultViewMode = "grid",
}: ViewModeProviderProps) {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    // Load saved view preference from localStorage
    if (typeof window !== "undefined") {
      const savedView = localStorage.getItem(storageKey);
      return (savedView as ViewMode) || defaultViewMode;
    }
    return defaultViewMode;
  });

  // Save to localStorage whenever viewMode changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, viewMode);
    }
  }, [viewMode, storageKey]);

  const setViewMode = (newViewMode: ViewMode) => {
    setViewModeState(newViewMode);
  };

  const value: ViewModeContextValue = {
    viewMode,
    setViewMode,
  };

  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>;
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error("useViewMode must be used within a ViewModeProvider");
  }
  return context;
}
