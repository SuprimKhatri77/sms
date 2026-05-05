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
    remotePatterns: [
      { hostname: "randomuser.me", protocol: "https" },
      { hostname: "picsum.photos", protocol: "https" },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
