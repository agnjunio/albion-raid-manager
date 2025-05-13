import type { User } from "@albion-raid-manager/core/types";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import { useApi } from "@/lib/api";

interface AuthContextType {
  user?: User;
  status: "loading" | "authenticated" | "unauthenticated";
  checkSession: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_FLAG_KEY = "auth_authenticated";
const AUTH_REDIRECT_KEY = "auth_redirect";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useMemo(() => localStorage.getItem(AUTH_FLAG_KEY) === "true", []);

  const [user, setUser] = useState<User>();
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const navigate = useNavigate();
  const fetchMe = useApi<User>({
    method: "GET",
    url: "/auth/me",
  });
  const fetchSignOut = useApi({
    method: "POST",
    url: "/auth/logout",
  });

  const checkSession = useCallback(async () => {
    if (!isAuthenticated) {
      setUser(undefined);
      setStatus("unauthenticated");
      return;
    }

    await fetchMe.execute();
    if (fetchMe.error) {
      console.log("checkSession failed");
      localStorage.removeItem(AUTH_FLAG_KEY);
      setUser(undefined);
      setStatus("unauthenticated");
    } else if (fetchMe.data) {
      setUser(fetchMe.data);
      setStatus("authenticated");
    }
  }, [fetchMe, isAuthenticated]);

  useEffect(() => {
    if (window.location.pathname === "/auth/callback") return;
    checkSession();
  }, [checkSession]);

  const signIn = async () => {
    const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
    const scope = "identify guilds";
    localStorage.setItem(AUTH_REDIRECT_KEY, window.location.pathname);
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  };

  const signOut = async () => {
    try {
      await fetchSignOut.execute();
      localStorage.removeItem(AUTH_FLAG_KEY);
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
