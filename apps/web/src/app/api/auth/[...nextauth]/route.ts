import config from "@albion-raid-manager/config";
import logger from "@albion-raid-manager/logger";
import NextAuth, { NextAuthOptions } from "next-auth";
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
    session({ session, user }) {
      console.log(user.id);
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

const handler = NextAuth(nextAuthOptions);

export { handler as GET, handler as POST };
