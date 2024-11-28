import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
import type { NextConfig } from "next";
import NodeConfigWebpack from "node-config-webpack";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  webpack: (config, { isServer }) => {
    // See more: https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-monorepo
    if (isServer && process.env.NODE_ENV === "production") {
      config.plugins.push(new PrismaPlugin());
    }

    config.plugins.push(new NodeConfigWebpack());
    return config;
  },
};

export default nextConfig;
