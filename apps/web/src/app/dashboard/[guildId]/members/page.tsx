import { getGuildMembers } from "@/actions/guildMembers";
import { Page, PageError, PageTitle } from "@/components/ui/page";
import { MembersProvider } from "./context";
import { MembersList } from "./list";
import { MembersPageProps } from "./types";

export default async function MembersPage({ params }: MembersPageProps) {
  const { guildId } = await params;
  const guildMembersResponse = await getGuildMembers(guildId);

  if (!guildMembersResponse.success) {
    return <PageError error="Failed to fetch guild members" />;
  }

  const { guildMembers } = guildMembersResponse.data;

  return (
    <MembersProvider guildMembers={guildMembers}>
      <Page>
        <PageTitle>Members</PageTitle>

        <MembersList />
      </Page>
    </MembersProvider>
  );
}
