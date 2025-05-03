import { Card } from "@/components/ui/card";
import { Page, PageTitle } from "@/components/ui/page";
import { RaidSettings } from "./settings";

export default async function SettingsPage() {
  return (
    <Page>
      <div className="flex size-full flex-col items-center justify-center gap-2">
        <PageTitle>Raids</PageTitle>

        <Card className="w-full max-w-xl p-2">
          <RaidSettings />
        </Card>
      </div>
    </Page>
  );
}
