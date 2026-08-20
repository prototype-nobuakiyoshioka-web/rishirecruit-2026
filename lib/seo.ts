import type { Metadata } from "next";
import type { WPImageNode } from "./wp/types";

// 本番ドメイン。next.config の remotePatterns と一致(https://rishirecruit.com)。
// 環境ごとに NEXT_PUBLIC_SITE_URL で上書きできる。末尾スラッシュは正規化する。
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://rishirecruit.com"
).replace(/\/+$/, "");

export const SITE_NAME = "Rishiri Recruit 2026";

export const SITE_DESCRIPTION =
  "利尻島の求人・イベント・観光・コラムを3Dマップから探せるインタラクティブサイト。";

// 相対パスをサイトの絶対URLへ変換する(OGP/canonical/sitemap用)。
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// WPの画像フィールド(thumbnailImage / photo 等)をOGP画像オブジェクトへ変換する。
// 実画像が無ければ undefined を返し、og:image を出さない(プレースホルダは載せない)。
export function ogImageFromField(
  field: WPImageNode | null | undefined,
  alt?: string,
): { url: string; width?: number; height?: number; alt?: string } | undefined {
  const node = field?.node;
  if (!node?.sourceUrl) return undefined;

  return {
    url: node.sourceUrl,
    width: node.mediaDetails?.width,
    height: node.mediaDetails?.height,
    alt,
  };
}

type PageMetaInput = {
  title: string;
  description?: string;
  /** サイトルートからのパス(例: "/jobs/foo")。canonical と og:url に使う。 */
  path: string;
  /** OGP画像(WPサムネイル等)。無ければ og:image を出さない。 */
  image?: { url: string; width?: number; height?: number; alt?: string };
  /** 記事系(og:type=article)にする場合。 */
  article?: boolean;
};

// 各ページ共通の Metadata(canonical + OGP + Twitter)を組み立てるヘルパー。
// title は layout の template により自動で "…｜Rishiri Recruit 2026" になる。
export function buildMetadata({
  title,
  description,
  path,
  image,
  article,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: article ? "article" : "website",
      images: image
        ? [{ url: image.url, width: image.width, height: image.height, alt: image.alt ?? title }]
        : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image.url] : undefined,
    },
  };
}
