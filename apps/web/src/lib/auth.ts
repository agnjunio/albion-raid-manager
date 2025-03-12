import config from "@albion-raid-manager/config";
import { prisma } from "@albion-raid-manager/database";
import logger from "@albion-raid-manager/logger";
import { NextAuthOptions } from "next-auth";
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
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    redirect({ baseUrl }) {
      return `${baseUrl}/dashboard`;
    },
    session({ session, token }) {
      session.accessToken = token.accessToken as string;
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
