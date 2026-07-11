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

export function eventStatus(startDatetime: string | null | undefined): "開催中" | "予定" {
  if (!startDatetime) return "予定";

  return new Date(startDatetime).getTime() <= Date.now() ? "開催中" : "予定";
}
