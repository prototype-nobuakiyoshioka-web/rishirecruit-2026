import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 旧サイトの WordPress URL 構造からのリダイレクト (301 永続)。
  // Googleに残っている旧URLインデックスを新URLへ移し、404を防ぐ。
  async redirects() {
    return [
      // 旧CPTのアーカイブ/詳細 → 新カテゴリへ
      { source: "/job_posting", destination: "/jobs", permanent: true },
      { source: "/job_posting/:slug", destination: "/jobs/:slug", permanent: true },
      { source: "/touristspot", destination: "/spots", permanent: true },
      { source: "/touristspot/:slug", destination: "/spots/:slug", permanent: true },
      { source: "/event", destination: "/events", permanent: true },
      { source: "/event/:slug", destination: "/events/:slug", permanent: true },
      { source: "/testimonial", destination: "/voices", permanent: true },
      { source: "/testimonial/:slug", destination: "/voices/:slug", permanent: true },

      // 旧サイトのイベント area 別タクソノミー → 新イベント一覧へ
      { source: "/event-cat", destination: "/events", permanent: true },
      { source: "/event-cat/:slug", destination: "/events", permanent: true },

      // 旧サイトの観光地(日本語slug) → 新英語slugへ個別マッピング。
      // sourceは Next.js が受け取るURLエンコード形式で指定する必要あり(日本語直書きだと match しない)。
      // 未マッピングの旧slugは新サイトで404だが、Googleは掲載終了と判断してくれる。
      { source: "/spots/%E7%94%98%E9%9C%B2%E6%B3%89%E6%B0%B4", destination: "/spots/kanrosensui", permanent: true },
      { source: "/spots/%E5%8D%97%E6%B5%9C%E6%B9%BF%E5%8E%9F", destination: "/spots/minamihama-wetland", permanent: true },
      { source: "/spots/%E5%A7%AB%E6%B2%BC", destination: "/spots/himenuma", permanent: true },
      { source: "/spots/%E5%88%A9%E5%B0%BB%E5%B1%B1", destination: "/spots/mount-rishiri", permanent: true },
      { source: "/spots/%E5%88%A9%E5%B0%BB%E5%B1%B1%E7%A5%9E%E7%A4%BE", destination: "/spots/rishirizan-shrine", permanent: true },
      { source: "/spots/%E6%B3%89%E3%81%AE%E8%A2%8B%E6%BE%97", destination: "/spots/izumi-no-fukuroma", permanent: true },
      { source: "/spots/%E3%83%9A%E3%82%B7%E5%B2%AC%E5%B1%95%E6%9C%9B%E5%8F%B0", destination: "/spots/peshi-misaki-observatory", permanent: true },
      { source: "/spots/%E3%82%AA%E3%82%BF%E3%83%88%E3%83%9E%E3%83%AA%E6%B2%BC", destination: "/spots/otatomari-numa", permanent: true },
      { source: "/spots/%E7%99%BD%E3%81%84%E6%81%8B%E4%BA%BA%E3%81%AE%E4%B8%98", destination: "/spots/numaura-observatory", permanent: true },
      { source: "/spots/%E6%B2%BC%E6%B5%A6%E5%B1%95%E6%9C%9B%E5%8F%B0", destination: "/spots/numaura-observatory", permanent: true },
      { source: "/spots/%E9%87%8E%E5%A1%9A%E5%B1%95%E6%9C%9B%E5%8F%B0", destination: "/spots/nozuka-observatory", permanent: true },
      { source: "/spots/%E5%AF%8C%E5%A3%AB%E9%87%8E%E5%9C%92%E5%9C%B0", destination: "/spots/fujino-garden", permanent: true },
      { source: "/spots/%E5%A4%95%E6%97%A5%E3%83%B6%E4%B8%98%E5%B1%95%E6%9C%9B%E5%8F%B0", destination: "/spots/yuhigaoka-observatory", permanent: true },
      { source: "/spots/%E9%AB%98%E5%B1%B1%E6%A4%8D%E7%89%A9%E5%B1%95%E7%A4%BA%E5%9C%92", destination: "/spots/alpine-plant-garden", permanent: true },
      { source: "/spots/%E3%82%8A%E3%81%97%E3%82%8A%E3%82%A2%E3%83%BC%E3%83%88%E3%83%BB%E3%83%93%E3%82%B8%E3%82%BF%E3%83%BC%E3%82%BB%E3%83%B3%E3%82%BF%E3%83%BC", destination: "/spots/rishiri-art-visitor-center", permanent: true },
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
