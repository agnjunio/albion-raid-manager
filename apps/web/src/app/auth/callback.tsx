import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const processedRef = useRef(false);
  const { checkSession } = useAuth();

  useEffect(() => {
    if (processedRef.current) return;
    const code = searchParams.get("code");

    if (!code) {
      navigate("/");
      return;
    }

    const handleCallback = async () => {
      try {
        processedRef.current = true;
        const redirectUri = `${window.location.origin}/auth/callback`;
        const response = await apiClient.post("/auth/callback", { code, redirectUri });

        if (response.status !== 200) {
          throw new Error("Failed to authenticate");
        }
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        const redirectPath = localStorage.getItem("auth_redirect") || "/";
        localStorage.removeItem("auth_redirect");
        navigate(redirectPath);
        checkSession();
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Authenticating...</h1>
        <p className="text-muted-foreground">Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
}
