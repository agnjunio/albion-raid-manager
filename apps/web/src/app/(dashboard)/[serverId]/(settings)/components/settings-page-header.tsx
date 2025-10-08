import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

import { useServerSettings } from "../contexts/server-settings-context";

interface SettingsPageHeaderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function SettingsPageHeader({ title, description, icon }: SettingsPageHeaderProps) {
  const { t } = useTranslation();
  const { hasUnsavedChanges, isSaving } = useServerSettings();

  return (
    <div className="from-background/95 to-background/80 border-border/50 flex flex-col gap-4 border-b bg-gradient-to-r px-4 py-6 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-8">
      {/* Left side - Title */}
      <div className="flex items-center gap-4 sm:gap-6">
        {icon && (
          <div className="from-primary/20 to-primary/10 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg sm:h-14 sm:w-14">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:mt-2 sm:text-lg">{description}</p>
        </div>
      </div>

      {/* Right side - Status indicators */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        {/* Unsaved Changes Indicator */}
        {hasUnsavedChanges && (
          <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-2 text-orange-700 shadow-lg sm:gap-3 sm:px-4 sm:py-3 dark:from-orange-900/20 dark:to-amber-900/20 dark:text-orange-400">
            <FontAwesomeIcon icon={faCircle} className="h-3 w-3 animate-pulse" />
            <span className="text-xs font-semibold sm:text-sm">{t("common.unsavedChanges")}</span>
          </div>
        )}

        {/* Saving Indicator */}
        {isSaving && (
          <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 text-blue-700 shadow-lg sm:gap-3 sm:px-4 sm:py-3 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-400">
            <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500"></div>
            <span className="text-xs font-semibold sm:text-sm">{t("common.saving")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
