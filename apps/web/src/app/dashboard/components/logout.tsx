import { faSignOut } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function LogoutButton() {
  const { signOut } = useAuth();

  return (
    <Button variant="ghost" onClick={() => signOut()}>
      <FontAwesomeIcon icon={faSignOut} />
    </Button>
  );
}
