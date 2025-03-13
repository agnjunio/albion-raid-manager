import { Page, PageTitle } from "@/components/ui/page";
import { DashboardPageProps } from "../../types";

export default async function SettingsPage({ params }: DashboardPageProps) {
  return (
    <Page>
      <PageTitle>Guild Settings</PageTitle>
    </Page>
  );
}
