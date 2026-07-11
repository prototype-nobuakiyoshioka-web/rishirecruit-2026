import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "rishirecruit-2026.local",
      },
      {
        protocol: "https",
        hostname: "rishirecruit-2026.local",
      },
    ],
  },
};

export default nextConfig;
