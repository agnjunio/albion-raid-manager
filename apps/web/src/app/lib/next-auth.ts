import config from "@albion-raid-manager/config";
import logger from "@albion-raid-manager/logger";
import { NextAuthOptions } from "next-auth";
import Discord from "next-auth/providers/discord";

if (!config.discord.clientId || !config.discord.clientSecret) {
  throw new Error("Missing Discord client ID or secret");
}

export const nextAuthOptions: NextAuthOptions = {
  providers: [
    Discord({
      clientId: config.discord.clientId,
      clientSecret: config.discord.clientSecret,
    }),
  ],
  callbacks: {
    redirect({ baseUrl }) {
      return `${baseUrl}/guilds`;
    },
    async session({ session, token }) {
      // Expose Discord ID in the session object
      if (token?.sub && session.user) {
        session.user.id = token.sub;
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
