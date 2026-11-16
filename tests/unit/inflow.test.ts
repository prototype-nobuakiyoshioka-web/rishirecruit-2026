import { describe, expect, it } from "vitest";
import {
  DIRECT_LABEL,
  FIRST_TOUCH_TTL_MS,
  INFLOW_FIELD_NAMES,
  SESSION_TIMEOUT_MS,
  classifyChannel,
  detectTouch,
  formatJst,
  sanitizeInflowFields,
  sanitizeInflowValue,
  stateToFields,
  touchSession,
  updateOnPageLoad,
  type InflowState,
} from "@/lib/forms/inflow";

const SITE = ["www.rishirecruit.com", "rishirecruit.com", "localhost"];
const T0 = Date.UTC(2026, 10, 16, 3, 0); // 2026-11-16 12:00 JST
const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;

function visit(state: InflowState, entry: { search?: string; referrer?: string; pathname?: string }, now: number) {
  const pathname = entry.pathname ?? "/";
  const detected = detectTouch({
    search: entry.search ?? "",
    referrer: entry.referrer ?? "",
    pathname,
    siteHosts: SITE,
    now,
  });
  return updateOnPageLoad(state, detected, pathname, now);
}

describe("sanitizeInflowValue", () => {
  it("改行・制御文字・山かっこを取り除き、1行にする", () => {
    expect(sanitizeInflowValue("a\r\nBcc: x@example.com\t<b>", 100)).toBe("a Bcc: x@example.com b");
    expect(sanitizeInflowValue("x\u2028y\u0000z", 100)).toBe("x y z");
  });
  it("長さを制限する(日本語も1文字ずつ)", () => {
    expect(sanitizeInflowValue("a".repeat(500), 100)).toHaveLength(100);
    expect(sanitizeInflowValue("利尻".repeat(10), 5)).toBe("利尻利尻利");
  });
  it("文字列以外は空", () => {
    expect(sanitizeInflowValue(123, 10)).toBe("");
    expect(sanitizeInflowValue({ a: 1 }, 10)).toBe("");
  });
});

describe("classifyChannel", () => {
  it("UTM の utm_source を優先", () => {
    expect(classifyChannel("youtube", "www.google.com")).toBe("YouTube");
    expect(classifyChannel("note", "")).toBe("note");
    expect(classifyChannel("town_site", "")).toBe("利尻富士町公式サイト");
    expect(classifyChannel("YouTube", "")).toBe("YouTube");
    expect(classifyChannel("flyer", "")).toBe("その他（flyer）");
  });
  it("UTM がなければ参照元で見分ける", () => {
    expect(classifyChannel("", "m.youtube.com")).toBe("YouTube");
    expect(classifyChannel("", "youtu.be")).toBe("YouTube");
    expect(classifyChannel("", "note.com")).toBe("note");
    expect(classifyChannel("", "www.town.rishirifuji.hokkaido.jp")).toBe("利尻富士町公式サイト");
    expect(classifyChannel("", "www.google.co.jp")).toBe("Google検索");
    expect(classifyChannel("", "search.yahoo.co.jp")).toBe("Yahoo!検索");
    expect(classifyChannel("", "t.co")).toBe("X（旧Twitter）");
    expect(classifyChannel("", "gemini.google.com")).toBe("AI検索");
    expect(classifyChannel("", "chatgpt.com")).toBe("AI検索");
    expect(classifyChannel("", "example.org")).toBe("その他のサイト");
    expect(classifyChannel("", "notyoutube.com")).toBe("その他のサイト");
  });
  it("どちらもなければ直接（不明）", () => {
    expect(classifyChannel("", "")).toBe(DIRECT_LABEL);
  });
});

describe("detectTouch", () => {
  it("UTM 付きの URL", () => {
    const t = detectTouch({
      search: "?utm_source=youtube&utm_medium=video&utm_campaign=spring26&type=fishery",
      referrer: "",
      pathname: "/jobs",
      siteHosts: SITE,
      now: T0,
    });
    expect(t).toMatchObject({
      channel: "YouTube",
      utmSource: "youtube",
      utmMedium: "video",
      utmCampaign: "spring26",
      referrer: "",
      landing: "/jobs",
    });
  });
  it("参照元はホスト名だけを持つ", () => {
    const t = detectTouch({
      search: "",
      referrer: "https://note.com/rishiri/n/abc?x=1",
      pathname: "/jobs/%E6%BC%81%E5%B8%AB",
      siteHosts: SITE,
      now: T0,
    });
    expect(t).toMatchObject({ channel: "note", referrer: "note.com", landing: "/jobs/漁師" });
  });
  it("サイト内から来たら null", () => {
    expect(
      detectTouch({ search: "", referrer: "https://www.rishirecruit.com/jobs", pathname: "/contact", siteHosts: SITE, now: T0 }),
    ).toBeNull();
  });
  it("直接開いたら直接（不明）", () => {
    expect(detectTouch({ search: "", referrer: "", pathname: "/", siteHosts: SITE, now: T0 })).toMatchObject({
      channel: DIRECT_LABEL,
      referrer: "",
      utmSource: "",
    });
  });
});

describe("最初と今回の扱い", () => {
  it("最初の流入元は、サイト内を移動しても変わらない", () => {
    let s = visit({}, { referrer: "https://www.youtube.com/", pathname: "/" }, T0);
    s = touchSession(s, T0 + 2 * MIN);
    s = visit(s, { referrer: "https://www.rishirecruit.com/", pathname: "/jobs/a" }, T0 + 5 * MIN); // 再読み込み相当
    expect(s.first).toMatchObject({ channel: "YouTube", landing: "/" });
    expect(s.current).toMatchObject({ channel: "YouTube", landing: "/" });
  });

  it("リロードしても今回の入口は変わらない", () => {
    let s = visit({}, { referrer: "https://note.com/", pathname: "/" }, T0);
    s = visit(s, { referrer: "https://note.com/", pathname: "/jobs" }, T0 + MIN);
    expect(s.current?.landing).toBe("/");
  });

  it("30分以内に直接開き直しても今回は置き換えない", () => {
    let s = visit({}, { search: "?utm_source=note&utm_medium=article", pathname: "/" }, T0);
    s = visit(s, { pathname: "/contact" }, T0 + 10 * MIN);
    expect(s.current?.channel).toBe("note");
  });

  it("訪問の途中で別の外部経路から入り直したら今回を置き換える", () => {
    let s = visit({}, { referrer: "https://www.google.co.jp/", pathname: "/" }, T0);
    s = visit(s, { referrer: "https://www.youtube.com/", pathname: "/jobs" }, T0 + 10 * MIN);
    expect(s.first?.channel).toBe("Google検索");
    expect(s.current).toMatchObject({ channel: "YouTube", landing: "/jobs" });
  });

  it("別の日にもう一度来たら、最初はそのまま、今回は新しい入り方", () => {
    let s = visit({}, { search: "?utm_source=youtube&utm_medium=video&utm_campaign=a1", pathname: "/" }, T0);
    s = visit(s, { pathname: "/contact" }, T0 + 3 * DAY);
    expect(s.first).toMatchObject({ channel: "YouTube", utmCampaign: "a1" });
    expect(s.current).toMatchObject({ channel: DIRECT_LABEL, landing: "/contact" });
  });

  it("30分あいたら別の訪問になる", () => {
    let s = visit({}, { referrer: "https://note.com/", pathname: "/" }, T0);
    s = visit(s, { pathname: "/jobs" }, T0 + SESSION_TIMEOUT_MS + MIN);
    expect(s.current?.channel).toBe(DIRECT_LABEL);
  });

  it("90日を過ぎたら最初を置き直す", () => {
    let s = visit({}, { referrer: "https://note.com/", pathname: "/" }, T0);
    s = visit(s, { referrer: "https://www.youtube.com/", pathname: "/jobs" }, T0 + FIRST_TOUCH_TTL_MS + DAY);
    expect(s.first).toMatchObject({ channel: "YouTube", landing: "/jobs" });
  });

  it("壊れた保存内容でも動く", () => {
    const s = visit({ first: { at: "x" } as never, lastSeen: Number.NaN }, { pathname: "/" }, T0);
    expect(s.first?.channel).toBe(DIRECT_LABEL);
    expect(() => stateToFields(s)).not.toThrow();
  });
});

describe("stateToFields / sanitizeInflowFields", () => {
  it("日本時間の日時", () => {
    expect(formatJst(T0)).toBe("2026-11-16 12:00");
  });

  it("保存内容から14項目を作り、空の項目は「なし」になる", () => {
    const s = visit({}, { search: "?utm_source=youtube&utm_medium=video&utm_campaign=a1", pathname: "/" }, T0);
    const fields = sanitizeInflowFields(stateToFields(s));
    expect(Object.keys(fields).sort()).toEqual([...INFLOW_FIELD_NAMES].sort());
    expect(fields).toMatchObject({
      inflow_first_channel: "YouTube",
      inflow_first_utm_source: "youtube",
      inflow_first_utm_medium: "video",
      inflow_first_utm_campaign: "a1",
      inflow_first_referrer: "なし",
      inflow_first_landing: "/",
      inflow_first_date: "2026-11-16 12:00",
      inflow_this_channel: "YouTube",
    });
  });

  it("記録がなければ「記録なし」", () => {
    const fields = sanitizeInflowFields(undefined);
    for (const name of INFLOW_FIELD_NAMES) expect(fields[name]).toBe("記録なし");
  });

  it("知らない項目は通さず、値は1行・長さ制限", () => {
    const fields = sanitizeInflowFields({
      inflow_first_channel: "YouTube\r\nX-Injected: 1",
      inflow_first_landing: "/" + "a".repeat(1000),
      your_email: "x@example.com",
    }) as Record<string, string>;
    expect(fields.inflow_first_channel).toBe("YouTube X-Injected: 1".slice(0, 60));
    expect(fields.inflow_first_landing.length).toBe(200);
    expect(fields.your_email).toBeUndefined();
  });
});
