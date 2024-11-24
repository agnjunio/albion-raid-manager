import { redirect } from "next/navigation";

type GuildPageParams = {
  params: {
    id: string;
  };
};

export default function ParentRedirect({ params }: GuildPageParams) {
  const { id } = params;
  redirect(`${id}/raids`);
}
