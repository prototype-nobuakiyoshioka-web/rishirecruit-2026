import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/turnstile", () => ({ verifyTurnstile: vi.fn().mockResolvedValue(true) }));

import { POST } from "@/app/api/form/route";

// CF7 へは実際に送らない。fetch を差し替えて、渡した FormData を見る。
let sent: FormData | undefined;
let sentUrl = "";

beforeEach(() => {
  sent = undefined;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit) => {
      sentUrl = url;
      sent = init.body as FormData;
      return { json: async () => ({ status: "mail_sent", message: "ok" }) };
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function request(body: unknown) {
  return new Request("http://localhost/api/form", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const APPLY_FIELDS = { full_name: "利尻 太郎", email: "taro@example.com", job_slug: "a", privacy: "1" };

describe("/api/form の流入元", () => {
  it("流入元を CF7 へ渡すデータに添える(応募 177)", async () => {
    const res = await POST(
      request({
        formId: "177",
        fields: APPLY_FIELDS,
        turnstileToken: "t",
        inflow: {
          inflow_first_channel: "YouTube",
          inflow_first_utm_source: "youtube",
          inflow_first_utm_medium: "video",
          inflow_first_utm_campaign: "spring26",
          inflow_first_referrer: "",
          inflow_first_landing: "/",
          inflow_first_date: "2026-11-01 10:00",
          inflow_this_channel: "Google検索",
          inflow_this_referrer: "www.google.co.jp",
          inflow_this_landing: "/jobs/a",
          inflow_this_date: "2026-11-16 12:00",
        },
      }),
    );
    expect(await res.json()).toMatchObject({ status: "mail_sent" });
    expect(sentUrl).toContain("/contact-forms/177/feedback");
    expect(sent?.get("full_name")).toBe("利尻 太郎");
    expect(sent?.get("_wpcf7")).toBe("177");
    expect(sent?.get("inflow_first_channel")).toBe("YouTube");
    expect(sent?.get("inflow_first_utm_campaign")).toBe("spring26");
    expect(sent?.get("inflow_first_referrer")).toBe("なし");
    expect(sent?.get("inflow_this_channel")).toBe("Google検索");
    expect(sent?.get("inflow_this_referrer")).toBe("www.google.co.jp");
    expect(sent?.get("inflow_this_utm_source")).toBe("なし");
  });

  it("流入元がない古い画面からの送信でも失敗せず「記録なし」(お問い合わせ 176)", async () => {
    const res = await POST(
      request({ formId: "176", fields: { name: "a", email: "a@example.com" }, turnstileToken: "t" }),
    );
    expect(await res.json()).toMatchObject({ status: "mail_sent" });
    expect(sent?.get("inflow_first_channel")).toBe("記録なし");
    expect(sent?.get("inflow_this_landing")).toBe("記録なし");
  });

  it("画面の項目に紛れた inflow_* は捨て、改行は取り除く", async () => {
    await POST(
      request({
        formId: "176",
        fields: { name: "a", email: "a@example.com", inflow_first_channel: "偽装" },
        turnstileToken: "t",
        inflow: { inflow_first_channel: "note\r\nBcc: x@example.com" },
      }),
    );
    expect(sent?.get("inflow_first_channel")).toBe("note Bcc: x@example.com");
  });

  it("ハニーポットに値があれば CF7 へは送らない(今まで通り)", async () => {
    await POST(request({ formId: "176", fields: { email: "a@example.com" }, honeypot: "x", inflow: {} }));
    expect(sent).toBeUndefined();
  });
});
