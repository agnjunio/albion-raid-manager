import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@headlessui/react";

export default async function Home() {
  return (
    <div className="h-full flex items-center justify-center">
      <Button>
        <FontAwesomeIcon icon={faDiscord} />
        Login
      </Button>
    </div>
  );
}
