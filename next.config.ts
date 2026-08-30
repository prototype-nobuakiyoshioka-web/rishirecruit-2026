import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // ローカル開発 (Local by Flywheel の .local ドメインなど) からの画像取得を許可
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      // ローカル開発 (Local by Flywheel)
      {
        protocol: "http",
        hostname: "rishirecruit-2026.local",
      },
      // 本番: 現行 rishirecruit.com（切替時に旧サーバの画像を参照している間の保険）
      {
        protocol: "https",
        hostname: "rishirecruit.com",
      },
      // 本番: 新サブドメインの WP（wp.rishirecruit.com）
      {
        protocol: "https",
        hostname: "wp.rishirecruit.com",
      },
      // Vercel Preview / Production 環境からアクセスする WP のサブドメインを許可
      // ステージングを追加する場合はここに `staging-wp.rishirecruit.com` などを追記
    ],
  },
};

export default nextConfig;
