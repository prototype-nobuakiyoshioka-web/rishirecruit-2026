import { describe, expect, it } from "vitest";
import { formatEventDate, formatEventPeriod } from "@/lib/utils/format-date";

// タイムゾーン非依存にするため時刻付き(ローカル解釈)の文字列を使う。
describe("formatEventDate", () => {
  it("月日を日本語で整形する", () => {
    expect(formatEventDate("2026-08-21T12:00:00")).toBe("8月21日");
  });
  it("null は空文字", () => {
    expect(formatEventDate(null)).toBe("");
  });
});

describe("formatEventPeriod", () => {
  it("period 指定は 月+旬 を返す", () => {
    expect(formatEventPeriod("period", null, null, "8", "early")).toBe("8月上旬");
    expect(formatEventPeriod("period", null, null, "8", "late")).toBe("8月下旬");
  });
  it("開始・終了が異なれば範囲表示", () => {
    expect(
      formatEventPeriod(null, "2026-08-01T12:00:00", "2026-08-03T12:00:00", null, null),
    ).toBe("8月1日〜8月3日");
  });
  it("開始と終了が同日なら単日表示", () => {
    expect(
      formatEventPeriod(null, "2026-08-01T12:00:00", "2026-08-01T12:00:00", null, null),
    ).toBe("8月1日");
  });
  it("情報が無ければ日程未定", () => {
    expect(formatEventPeriod(null, null, null, null, null)).toBe("日程未定");
  });
});
