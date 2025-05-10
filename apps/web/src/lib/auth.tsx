import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface Session {
  user: User;
  accessToken: string;
  error?: string;
}

interface AuthContextType {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a session in localStorage
    const storedSession = localStorage.getItem("session");
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setSession(parsedSession);
        setStatus("authenticated");
      } catch {
        localStorage.removeItem("session");
        setStatus("unauthenticated");
      }
    } else {
      setStatus("unauthenticated");
    }
  }, []);

  const signIn = async () => {
    const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
    const scope = "identify guilds";

    // Store the current URL to redirect back after auth
    localStorage.setItem("auth_redirect", window.location.pathname);

    // Redirect to Discord OAuth
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  };

  const signOut = async () => {
    localStorage.removeItem("session");
    setSession(null);
    setStatus("unauthenticated");
    navigate("/");
  };

  return <AuthContext.Provider value={{ session, status, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
