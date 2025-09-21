import type { User } from "@albion-raid-manager/types";

import { useGetMeQuery, useLogoutMutation } from "@/store/auth";

import { getDiscordOAuthUrl } from "./discord-utils";

export const AUTH_FLAG_KEY = "auth_logged_in";
export const AUTH_REDIRECT_KEY = "auth_redirect";

interface Auth {
  user: User | null;
  status: "loading" | "unauthenticated" | "authenticated";
  signIn: () => void;
  signOut: () => Promise<void>;
}

export function useAuth(): Auth {
  const { data, isLoading, isError } = useGetMeQuery(undefined, {
    skip: localStorage.getItem(AUTH_FLAG_KEY) !== "true",
    refetchOnMountOrArgChange: true,
  });
  const [logout] = useLogoutMutation();

  const signIn = () => {
    const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
    const scope = "identify guilds";
    localStorage.setItem(AUTH_REDIRECT_KEY, window.location.pathname);
    window.location.href = getDiscordOAuthUrl(clientId, redirectUri, scope);
  };

  const signOut = async () => {
    await logout();
    localStorage.removeItem(AUTH_FLAG_KEY);
    // Redirect to home page after logout
    window.location.href = "/";
  };

  return {
    user: data?.user ?? null,
    status: isLoading ? "loading" : isError ? "unauthenticated" : "authenticated",
    signIn,
    signOut,
  };
}
