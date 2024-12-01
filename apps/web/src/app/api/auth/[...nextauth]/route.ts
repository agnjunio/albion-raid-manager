import config from "@albion-raid-manager/config";
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
};

const handler = NextAuth(nextAuthOptions);

export { handler as GET, handler as POST };
