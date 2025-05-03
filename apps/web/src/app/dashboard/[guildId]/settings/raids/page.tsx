import { Page, PageTitle } from "@/components/ui/page";
import { RaidSettings } from "./settings";

export default async function SettingsPage() {
  return (
    <Page>
      <PageTitle>Raid Settings</PageTitle>

      <div className="flex justify-center">
        <div className="w-full max-w-xl">
          <RaidSettings />
        </div>
      </div>
    </Page>
  );
}
