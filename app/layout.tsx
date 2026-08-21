import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageTransition } from "@/components/layout/PageTransition";
import { GA_ID } from "@/lib/analytics";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

const HOME_TITLE = `${SITE_NAME}｜利尻島の求人・移住・観光`;

export const metadata: Metadata = {
  // OGP/canonical の相対URLを絶対URLへ解決する基準。これが無いとOG画像が壊れる。
  metadataBase: new URL(SITE_URL),
  // 各ページの title は template により "…｜Rishiri Recruit 2026" に整形される。
  title: {
    default: HOME_TITLE,
    template: `%s｜${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  // Next.js 側の公開サイトはインデックスさせる(WP側は inc/headless-config.php で noindex)。
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ja_JP",
    url: SITE_URL,
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Header />
        <PageTransition />
        {children}
        <Footer />
        {/* GA_ID 設定時のみ GA4 を読み込む(未設定の環境では一切読み込まない)。 */}
        {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
      </body>
    </html>
  );
}
