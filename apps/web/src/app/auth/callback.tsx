import { useApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const AUTH_FLAG_KEY = "auth_authenticated";

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const processedRef = useRef(false);
  const { checkSession } = useAuth();
  const authCallback = useApi<{ success: boolean }>({
    method: "POST",
    url: "/auth/callback",
  });

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
        await authCallback.execute({ data: { code, redirectUri } });
        localStorage.setItem(AUTH_FLAG_KEY, "true");
        const redirectPath = localStorage.getItem("auth_redirect") || "/";
        localStorage.removeItem("auth_redirect");
        navigate(redirectPath);
        checkSession();
      } catch (error) {
        console.error("Auth callback failed:", error);
        localStorage.removeItem(AUTH_FLAG_KEY);
        window.location.href = "/";
      }
    };

    handleCallback();
  }, [searchParams, navigate, authCallback, checkSession]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Authenticating...</h1>
        <p className="text-muted-foreground">Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
}
