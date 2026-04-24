import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    typedEnv: true,
  },

  logging: {
    browserToTerminal: true,
    serverFunctions: true,
  },
  images: {
    remotePatterns: [{ hostname: "randomuser.me", protocol: "https" }],
  },
};

export default nextConfig;
