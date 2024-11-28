import type { NextConfig } from "next";
import NodeConfigWebpack from "node-config-webpack";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  webpack: (config) => {
    config.plugins.push(new NodeConfigWebpack());
    return config;
  },
};

export default nextConfig;
