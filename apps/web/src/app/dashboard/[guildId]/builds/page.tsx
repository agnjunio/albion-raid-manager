import { Page, PageTitle } from "@/components/ui/page";
import { DashboardPageProps } from "../../types";

export default async function BuildPage({ params }: DashboardPageProps) {
  return (
    <Page>
      <PageTitle>Builds</PageTitle>

      <p>Welcome to the builds page. Here you can manage and view all your builds.</p>
    </Page>
  );
}
