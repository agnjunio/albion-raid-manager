import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Outlet, useLocation } from "react-router-dom";

import { SettingsPageHeader } from "./components/settings-page-header";
import { SettingsSidebar } from "./components/settings-sidebar";
import { SettingsStickyFooter } from "./components/settings-sticky-footer";
import { ServerSettingsProvider, useServerSettings } from "./contexts/server-settings-context";
import { settingsPageInfo } from "./utils/page-info";

function SettingsLayoutContent() {
  const location = useLocation();
  const { formData, saveServerSettings, resetForm } = useServerSettings();

  // Get current page from pathname
  const currentPage = location.pathname.split("/").pop() || "administration";
  const pageInfo = settingsPageInfo[currentPage as keyof typeof settingsPageInfo] || settingsPageInfo.administration;

  const handleSave = async () => {
    if (formData) {
      await saveServerSettings(formData);
    }
  };

  const handleDiscard = () => {
    resetForm();
  };

  return (
    <div className="from-background via-background to-muted/10 flex h-full w-full flex-col bg-gradient-to-br">
      {/* Header */}
      <SettingsPageHeader
        title={pageInfo.title}
        description={pageInfo.description}
        icon={<FontAwesomeIcon icon={pageInfo.icon} className="text-primary h-6 w-6" />}
      />

      {/* Mobile Navigation */}
      <div className="border-border/50 bg-muted/5 block border-b lg:hidden">
        <SettingsSidebar />
      </div>

      {/* 2-Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column - Navigation */}
        <div className="border-border/50 bg-muted/5 hidden w-64 border-r lg:block xl:w-72">
          <SettingsSidebar />
        </div>

        {/* Right Column - Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <div className="mx-auto mb-4 w-full max-w-4xl p-4 lg:p-8">
              <Outlet />
            </div>
          </div>

          {/* Conditional Sticky Footer */}
          <SettingsStickyFooter onSave={handleSave} onDiscard={handleDiscard} />
        </div>
      </div>
    </div>
  );
}

export function ServerSettingsLayout() {
  return (
    <ServerSettingsProvider>
      <SettingsLayoutContent />
    </ServerSettingsProvider>
  );
}
