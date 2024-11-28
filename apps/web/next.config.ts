import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
import type { NextConfig } from "next";
import NodeConfigWebpack from "node-config-webpack";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins.push(new PrismaPlugin());
    }

    config.plugins.push(new NodeConfigWebpack());
    return config;
  },
};

export default nextConfig;
