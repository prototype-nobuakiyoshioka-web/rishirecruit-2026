import { describe, expect, it } from "vitest";
import { absoluteUrl, buildMetadata, ogImageFromField } from "@/lib/seo";

// NEXT_PUBLIC_SITE_URL 未設定時の既定ドメインを前提にする。
const BASE = "https://rishirecruit.com";

describe("absoluteUrl", () => {
  it("先頭スラッシュ有無どちらも絶対URLにする", () => {
    expect(absoluteUrl("/jobs")).toBe(`${BASE}/jobs`);
    expect(absoluteUrl("jobs")).toBe(`${BASE}/jobs`);
  });
  it("引数なしはルート", () => {
    expect(absoluteUrl()).toBe(`${BASE}/`);
  });
});

describe("ogImageFromField", () => {
  it("画像が無ければ undefined", () => {
    expect(ogImageFromField(null)).toBeUndefined();
    expect(ogImageFromField({ node: null } as never)).toBeUndefined();
  });
  it("sourceUrl があれば OGP 画像オブジェクトを返す", () => {
    const field = {
      node: {
        sourceUrl: "http://x/y.jpg",
        altText: "",
        mediaDetails: { width: 1200, height: 630 },
      },
    };
    expect(ogImageFromField(field, "代替")).toEqual({
      url: "http://x/y.jpg",
      width: 1200,
      height: 630,
      alt: "代替",
    });
  });
});

describe("buildMetadata", () => {
  it("canonical と og:url を絶対URLで設定する", () => {
    const meta = buildMetadata({ title: "T", description: "D", path: "/jobs" });
    expect(meta.alternates?.canonical).toBe(`${BASE}/jobs`);
    expect((meta.openGraph as { url?: string })?.url).toBe(`${BASE}/jobs`);
    expect((meta.openGraph as { type?: string })?.type).toBe("website");
  });
  it("article=true で og:type=article", () => {
    const meta = buildMetadata({ title: "T", path: "/voices/x", article: true });
    expect((meta.openGraph as { type?: string })?.type).toBe("article");
  });
  it("画像なしは twitter card=summary、画像ありは summary_large_image", () => {
    const noImage = buildMetadata({ title: "T", path: "/jobs" });
    expect((noImage.twitter as { card?: string })?.card).toBe("summary");

    const withImage = buildMetadata({
      title: "T",
      path: "/jobs/x",
      image: { url: "http://x/y.jpg" },
    });
    expect((withImage.twitter as { card?: string })?.card).toBe(
      "summary_large_image",
    );
  });
});
