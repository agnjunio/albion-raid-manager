import config from "@albion-raid-manager/config";
import { prisma } from "@albion-raid-manager/database";
import { refreshToken } from "@albion-raid-manager/discord";
import logger from "@albion-raid-manager/logger";
import NextAuth, { NextAuthOptions } from "next-auth";
import Discord from "next-auth/providers/discord";

if (!config.discord.clientId || !config.discord.clientSecret) {
  logger.warn("Missing Discord client ID or secret");
}

export const nextAuthOptions: NextAuthOptions = {
  providers: [
    Discord({
      clientId: config.discord.clientId ?? "",
      clientSecret: config.discord.clientSecret ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      try {
        await prisma.user.upsert({
          where: { id: user.id },
          create: {
            id: user.id,
            username: user.name || "Usuário Desconhecido",
            avatar: user.image,
          },
          update: {
            username: user.name || "Usuário Desconhecido",
            avatar: user.image,
          },
        });
        return true;
      } catch (error) {
        logger.error(`User failed to sign in: ${error}`, {
          method: "nextAuthOptions.signIn",
          user,
          error,
        });
        return false;
      }
    },
    async jwt({ token, account }) {
      const expiresIn = (token.expiresAt as number) * 1000 - Date.now();
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
        };
      } else if (expiresIn > 0) {
        return token;
      } else {
        if (!token.refreshToken) {
          throw new TypeError("Missing refresh_token");
        }
        try {
          const discordAccessToken = await refreshToken(token.refreshToken);
          if (!discordAccessToken) {
            throw new TypeError("Failed to refresh token");
          }

          return {
            ...token,
            accessToken: discordAccessToken.access_token,
            refreshToken: discordAccessToken.refresh_token,
            expiresAt: discordAccessToken.expires_in,
          };
        } catch (error) {
          if (!(error instanceof Error)) {
            return token;
          }

          logger.verbose(`Failed to refresh token: ${error.message}`, {
            token,
            error,
          });
          return { ...token, error: "RefreshTokenExpired" };
        }
      }
    },
    redirect({ baseUrl }) {
      return `${baseUrl}/dashboard`;
    },
    session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.error = token.error;
      if (token?.sub) {
        session.user = {
          ...session.user,
          id: token.sub,
        };
      }
      return session;
    },
  },
  logger: {
    error(code, metadata) {
      logger.error(code, metadata);
    },
    warn(code) {
      logger.warn(code);
    },
    debug(code, metadata) {
      logger.debug(code, metadata);
    },
  },
  theme: {
    colorScheme: "dark",
  },
};

export const auth = NextAuth(nextAuthOptions);
