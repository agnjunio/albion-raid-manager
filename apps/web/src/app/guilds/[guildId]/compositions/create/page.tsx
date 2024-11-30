import Card from "@/components/Card";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { CompositionPageProps } from "../types";
import CreateComposition from "./CreateComposition";

export default async function CreateCompositionPage({ params }: CompositionPageProps) {
  const { guildId } = await params;

  return (
    <div className="p-4 space-y-2 flex flex-col items-center">
      <div className="self-start">
        <Link tabIndex={-1} href={`/guilds/${guildId}/compositions`}>
          <button role="icon-button">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        </Link>
      </div>

      <h2 className="text-2xl font-semibold text-center py-4">Create Composition</h2>

      <Card className="w-full max-w-lg">
        <CreateComposition guildId={guildId} />
      </Card>
    </div>
  );
}
