import config from "@albion-raid-manager/config";
import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

if (!config.discord.clientId || !config.discord.clientSecret) {
  throw new Error("Missing Discord client ID or secret");
}

const handler = NextAuth({
  providers: [
    Discord({
      clientId: config.discord.clientId,
      clientSecret: config.discord.clientSecret,
    }),
  ],
});

export { handler as GET, handler as POST };
