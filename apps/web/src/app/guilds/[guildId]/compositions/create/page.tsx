import Card from "@/components/Card";
import { CompositionPageProps } from "../types";
import CreateComposition from "./CreateComposition";

export default async function CreateCompositionPage({ params }: CompositionPageProps) {
  const { guildId } = await params;

  return (
    <div className="p-4 space-y-2 flex flex-col items-center">
      <h1 className="text-2xl font-semibold text-center">Create Composition</h1>

      <Card className="w-full max-w-lg">
        <CreateComposition guildId={guildId} />
      </Card>
    </div>
  );
}
