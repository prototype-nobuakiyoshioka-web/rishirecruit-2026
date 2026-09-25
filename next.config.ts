import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 旧サイトの WordPress URL 構造からのリダイレクト (301 永続)。
  // Googleに残っている旧URLインデックスを新URLへ移し、404を防ぐ。
  // slug が一致する場合は詳細ページへ、不一致(旧サイト限定投稿)は一覧へフォールバック(new Next.jsが自動で404)。
  async redirects() {
    return [
      { source: "/job_posting", destination: "/jobs", permanent: true },
      { source: "/job_posting/:slug", destination: "/jobs/:slug", permanent: true },
      { source: "/touristspot", destination: "/spots", permanent: true },
      { source: "/touristspot/:slug", destination: "/spots/:slug", permanent: true },
      { source: "/event", destination: "/events", permanent: true },
      { source: "/event/:slug", destination: "/events/:slug", permanent: true },
      { source: "/testimonial", destination: "/voices", permanent: true },
      { source: "/testimonial/:slug", destination: "/voices/:slug", permanent: true },
    ];
  },
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
