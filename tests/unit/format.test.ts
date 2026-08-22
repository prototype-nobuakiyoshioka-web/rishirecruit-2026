import { describe, expect, it } from "vitest";
import {
  eventStatus,
  htmlToText,
  imageFromField,
  selectFirst,
} from "@/lib/wp/format";

describe("selectFirst", () => {
  it("先頭要素を返す", () => {
    expect(selectFirst(["a", "b"])).toBe("a");
  });
  it("空配列・null は null", () => {
    expect(selectFirst([])).toBeNull();
    expect(selectFirst(null)).toBeNull();
    expect(selectFirst(undefined)).toBeNull();
  });
});

describe("imageFromField", () => {
  it("画像が無ければフォールバックを返す", () => {
    expect(imageFromField(null, "/fallback.svg", "代替")).toEqual({
      sourceUrl: "/fallback.svg",
      altText: "代替",
      mediaDetails: undefined,
    });
  });
  it("node があればその値を使う", () => {
    const image = {
      node: {
        sourceUrl: "http://x/y.jpg",
        altText: "写真",
        mediaDetails: { width: 1200, height: 630 },
      },
    };
    expect(imageFromField(image, "/fallback.svg")).toEqual({
      sourceUrl: "http://x/y.jpg",
      altText: "写真",
      mediaDetails: { width: 1200, height: 630 },
    });
  });
});

describe("htmlToText", () => {
  it("タグを除去して trim する", () => {
    expect(htmlToText("<p>hi <b>there</b></p>")).toBe("hi there");
  });
  it("null は空文字", () => {
    expect(htmlToText(null)).toBe("");
  });
});

describe("eventStatus", () => {
  it("開始日時が無ければ予定", () => {
    expect(eventStatus(null)).toBe("予定");
  });
  it("過去なら開催中", () => {
    expect(eventStatus("2000-01-01T00:00:00")).toBe("開催中");
  });
  it("未来なら予定", () => {
    expect(eventStatus("2999-01-01T00:00:00")).toBe("予定");
  });
});
