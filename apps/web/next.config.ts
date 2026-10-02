import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  experimental: {
    typedEnv: true,
  },

  // the three ledger pages became one; keep old bookmarks working
  async redirects() {
    return [
      {
        source: "/admin/cash-ledger",
        destination: "/admin/ledgers?type=cash",
        permanent: false,
      },
      {
        source: "/admin/banks/ledger",
        destination: "/admin/ledgers?type=bank",
        permanent: false,
      },
      {
        source: "/admin/suppliers/ledger",
        destination: "/admin/ledgers?type=supplier",
        permanent: false,
      },
    ];
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
