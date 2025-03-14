import CreateComposition from "@/components/compositions/CreateComposition";
import { Card } from "@/components/ui/card";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { CompositionPageProps } from "../types";

export default async function CreateCompositionPage({ params }: CompositionPageProps) {
  const { guildId } = await params;

  return (
    <div className="flex flex-col items-center space-y-2 p-4">
      <div className="self-start">
        <Link tabIndex={-1} href={`/guilds/${guildId}/compositions`}>
          <button role="icon-button">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        </Link>
      </div>

      <h2 className="py-4 text-center text-2xl font-semibold">Create Composition</h2>

      <Card className="w-full max-w-lg">
        <CreateComposition guildId={guildId} />
      </Card>
    </div>
  );
}
