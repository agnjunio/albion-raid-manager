import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
import type { NextConfig } from "next";
import NodeConfigWebpack from "node-config-webpack";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
    turbo: {
      rules: {},
    },
  },
  serverExternalPackages: ["winston"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
    ],
  },
  output: "standalone",
  webpack: (config, { isServer }) => {
    // Since winston depends on fs, we need to explicitly tell Webpack not to bundle winston on the client.
    if (!isServer) {
      config.resolve.fallback = { fs: false };
    }

    // See more: https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-monorepo
    if (isServer && process.env.NODE_ENV === "production") {
      config.plugins.push(new PrismaPlugin());
    }

    config.plugins.push(new NodeConfigWebpack());
    return config;
  },
};

export default nextConfig;
