import { apiClient } from "@/lib/api";
import { type User } from "@albion-raid-manager/core/types";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user?: User;
  status: "loading" | "authenticated" | "unauthenticated";
  checkSession: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>();
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const navigate = useNavigate();

  const checkSession = async () => {
    try {
      const response = await apiClient.get<User>("/auth/me");
      if (response.status === 200) {
        setUser(response.data);
        setStatus("authenticated");
      } else {
        setUser(undefined);
        setStatus("unauthenticated");
      }
    } catch (error) {
      console.error("Failed to check session:", error);
      setUser(undefined);
      setStatus("unauthenticated");
    }
  };

  useEffect(() => {
    if (window.location.pathname === "/auth/callback") return;
    checkSession();
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
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      setUser(undefined);
      setStatus("unauthenticated");
      navigate("/");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, status, checkSession, signIn, signOut }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
