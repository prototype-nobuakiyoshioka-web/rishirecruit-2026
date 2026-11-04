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
  const now = new Date("2026-11-04T12:00:00+09:00");

  it("開始前は予定", () => {
    expect(eventStatus("2026-11-05T00:00:00+00:00", "2026-11-05T00:00:00+00:00", now)).toBe("予定");
  });

  it("開催期間中は開催中(開始日・終了日の当日を含む)", () => {
    expect(eventStatus("2026-11-04T00:00:00+00:00", "2026-11-04T00:00:00+00:00", now)).toBe("開催中");
    expect(eventStatus("2026-11-01T00:00:00+00:00", "2026-11-10T00:00:00+00:00", now)).toBe("開催中");
  });

  it("終了日を過ぎたら終了", () => {
    expect(eventStatus("2026-08-11T00:00:00+00:00", "2026-08-11T00:00:00+00:00", now)).toBe("終了");
  });

  it("終了日がなければ開始日の1日だけのイベントとして扱う", () => {
    expect(eventStatus("2026-11-04T00:00:00+00:00", null, now)).toBe("開催中");
    expect(eventStatus("2026-11-03T00:00:00+00:00", null, now)).toBe("終了");
  });

  it("開始日がなければ状態を出さない", () => {
    expect(eventStatus(null, null, now)).toBeNull();
  });

  it("日本時間の日付の変わり目で判定する", () => {
    const justAfterMidnight = new Date("2026-11-05T00:10:00+09:00");
    expect(eventStatus("2026-11-04T00:00:00+00:00", null, justAfterMidnight)).toBe("終了");
  });
});
