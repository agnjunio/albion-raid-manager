import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@headlessui/react";

export default function Header() {
  return (
    <header className="bg-primary-gray-900 h-24 flex items-center justify-between p-4 shadow-lg">
      <div>Albion Raid Manager</div>
      <Button className="flex">
        <FontAwesomeIcon icon={faDiscord} />
        <span>Login</span>
      </Button>
    </header>
  );
}
