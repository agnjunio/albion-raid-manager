import { useState } from "react";

import { getServerInviteUrl } from "@albion-raid-manager/discord/helpers";
import { APIServer } from "@albion-raid-manager/types/api";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";

interface DiscordInviteProps {
  server: APIServer;
  onStartVerification: () => void;
}

export function DiscordInvite({ server, onStartVerification }: DiscordInviteProps) {
  const [copied, setCopied] = useState(false);
  const inviteUrl = getServerInviteUrl(import.meta.env.VITE_DISCORD_CLIENT_ID, server.id);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = inviteUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <CardContent className="flex flex-col gap-4">
      <div className="text-center">
        <p className="text-muted-foreground mb-4">
          Click the link below to open Discord and accept the bot invitation to your server.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Button asChild className="h-14 w-full" variant="secondary">
          <Link to={inviteUrl} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faDiscord} size="lg" />
            Open Discord Invitation
          </Link>
        </Button>

        <div className="flex gap-2">
          <input
            type="text"
            value={inviteUrl}
            readOnly
            className="border-input bg-muted flex-1 rounded-md border px-3 py-2 text-sm"
          />
          <Button variant="outline" onClick={handleCopyLink}>
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>

      <Alert variant="info" className="my-2 text-sm">
        <strong>Important:</strong> Make sure you have admin permissions on the server before accepting the invitation.
      </Alert>

      <Button variant="primary" onClick={onStartVerification} className="w-full">
        Continue to verification
      </Button>
    </CardContent>
  );
}
