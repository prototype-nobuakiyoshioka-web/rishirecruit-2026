import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "rishirecruit-2026.local",
      },
      {
        protocol: "https",
        hostname: "rishirecruit.com",
      },
    ],
  },
};

export default nextConfig;
