import type { WPImageNode, WPGalleryNodes } from "./types";

export type DisplayImage = {
  sourceUrl: string;
  altText: string;
  mediaDetails?: {
    width: number;
    height: number;
  };
};

export function selectFirst(value: string[] | null | undefined): string | null {
  return value?.[0] ?? null;
}

export function imageFromField(
  image: WPImageNode | null | undefined,
  fallbackSourceUrl: string,
  fallbackAltText = "",
): DisplayImage {
  const node = image?.node;

  return {
    sourceUrl: node?.sourceUrl ?? fallbackSourceUrl,
    altText: node?.altText ?? fallbackAltText,
    mediaDetails: node?.mediaDetails ?? undefined,
  };
}

export function galleryFromField(gallery: WPGalleryNodes | null | undefined): DisplayImage[] {
  return (
    gallery?.nodes.map((image) => ({
      sourceUrl: image.sourceUrl,
      altText: image.altText ?? "",
      mediaDetails: image.mediaDetails ?? undefined,
    })) ?? []
  );
}

export function htmlToText(value: string | null | undefined): string {
  return value?.replace(/<[^>]*>/g, "").trim() ?? "";
}

/**
 * ACF の textarea (`new_lines: 'br'`) は出力時に改行を `<br />` へ変換する。
 * JSX で表示する際、素朴に埋め込むとタグがエスケープされるため、
 * `<br>` 位置で分割してテキストセグメントの配列を返す。
 * 呼び出し側で <Fragment>{seg}<br/></Fragment> のように結合する想定。
 */
export function splitByBr(value: string | null | undefined): string[] {
  if (!value) return [];
  return value.split(/<br\s*\/?>/gi);
}

// WP の日時は現地の暦をそのまま持つので、日付部分だけを日本時間の今日と比べる。
// 日付が未定のイベント(毎年「7月中旬」など)は状態を出さない。
export function eventStatus(
  startDatetime: string | null | undefined,
  endDatetime: string | null | undefined,
  now: Date = new Date(),
): "開催中" | "予定" | "終了" | null {
  if (!startDatetime) return null;

  const today = now.toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
  const startDate = startDatetime.slice(0, 10);
  const endDate = (endDatetime ?? startDatetime).slice(0, 10);

  if (today < startDate) return "予定";
  return today > endDate ? "終了" : "開催中";
}
