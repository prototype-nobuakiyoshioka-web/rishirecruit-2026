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
      // 未マッピングの旧slugは新サイトで404だが、Googleは掲載終了と判断してくれる。
      { source: "/spots/甘露泉水", destination: "/spots/kanrosensui", permanent: true },
      { source: "/spots/南浜湿原", destination: "/spots/minamihama-wetland", permanent: true },
      { source: "/spots/姫沼", destination: "/spots/himenuma", permanent: true },
      { source: "/spots/利尻山", destination: "/spots/mount-rishiri", permanent: true },
      { source: "/spots/利尻山神社", destination: "/spots/rishirizan-shrine", permanent: true },
      { source: "/spots/泉の袋澗", destination: "/spots/izumi-no-fukuroma", permanent: true },
      { source: "/spots/ペシ岬展望台", destination: "/spots/peshi-misaki-observatory", permanent: true },
      { source: "/spots/オタトマリ沼", destination: "/spots/otatomari-numa", permanent: true },
      { source: "/spots/白い恋人の丘", destination: "/spots/numaura-observatory", permanent: true },
      { source: "/spots/沼浦展望台", destination: "/spots/numaura-observatory", permanent: true },
      { source: "/spots/野塚展望台", destination: "/spots/nozuka-observatory", permanent: true },
      { source: "/spots/富士野園地", destination: "/spots/fujino-garden", permanent: true },
      { source: "/spots/夕日ヶ丘展望台", destination: "/spots/yuhigaoka-observatory", permanent: true },
      { source: "/spots/高山植物展示園", destination: "/spots/alpine-plant-garden", permanent: true },
      { source: "/spots/りしりアート・ビジターセンター", destination: "/spots/rishiri-art-visitor-center", permanent: true },
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
