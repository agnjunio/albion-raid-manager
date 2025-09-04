import { useEffect, useRef } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import { AUTH_FLAG_KEY } from "@/lib/auth";
import { useDiscordCallbackMutation } from "@/store/auth";

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const processedRef = useRef(false);
  const [discordCallback] = useDiscordCallbackMutation();

  useEffect(() => {
    if (processedRef.current) return;

    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const redirectUri = window.location.origin + "/auth/callback";

      if (!code) {
        window.location.href = "/";
        return;
      }

      try {
        processedRef.current = true;
        const result = await discordCallback({ code, redirectUri });
        if (result.error) throw result.error;
        localStorage.setItem(AUTH_FLAG_KEY, "true");
        window.location.href = "/dashboard";
      } catch (error) {
        console.error("Auth callback failed:", error);
        localStorage.removeItem(AUTH_FLAG_KEY);
        navigate("/");
      }
    };

    handleCallback();
  }, [searchParams, discordCallback, navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Authenticating...</h1>
        <p className="text-muted-foreground">Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
}
