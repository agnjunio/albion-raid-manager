import { Page, PageTitle } from "@/components/ui/page";
import { DiscordSettings } from "./settings";

export default async function SettingsPage() {
  return (
    <Page>
      <PageTitle>Discord Settings</PageTitle>

      <div className="flex justify-center">
        <div className="w-full max-w-xl">
          <DiscordSettings />
        </div>
      </div>
    </Page>
  );
}
