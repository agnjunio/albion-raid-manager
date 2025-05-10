import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      navigate("/");
      return;
    }

    const handleCallback = async () => {
      try {
        const response = await fetch("/api/auth/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error("Failed to authenticate");
        }

        const session = await response.json();
        localStorage.setItem("session", JSON.stringify(session));

        // Redirect back to the original URL or dashboard
        const redirectTo = localStorage.getItem("auth_redirect") || "/dashboard";
        localStorage.removeItem("auth_redirect");
        navigate(redirectTo);
      } catch (error) {
        console.error("Auth error:", error);
        navigate("/");
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
