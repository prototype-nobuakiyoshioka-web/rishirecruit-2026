import { describe, expect, it } from "vitest";
import { copyForPath, crossesSection, sectionForPath } from "@/lib/utils/page-section";

describe("sectionForPath", () => {
  it("一覧と詳細は同じセクション", () => {
    expect(sectionForPath("/jobs")).toBe("/jobs");
    expect(sectionForPath("/jobs/airport-staff")).toBe("/jobs");
    expect(sectionForPath("/jobs/")).toBe("/jobs");
  });

  it("トップは / (ISR の /index も)", () => {
    expect(sectionForPath("/")).toBe("/");
    expect(sectionForPath("/index")).toBe("/");
  });

  it("前方一致だけで決めない(/jobsx は求人ではない)", () => {
    expect(sectionForPath("/jobsx")).toBe("/jobsx");
  });
});

describe("crossesSection", () => {
  it("同じセクションの中は幕を出さない", () => {
    expect(crossesSection("/jobs", "/jobs/a")).toBe(false);
    expect(crossesSection("/jobs/a", "/jobs/b")).toBe(false);
    expect(crossesSection("/spots/a/", "/spots")).toBe(false);
  });

  it("セクションが変わると幕を出す", () => {
    expect(crossesSection("/", "/jobs")).toBe(true);
    expect(crossesSection("/jobs/a", "/spots")).toBe(true);
    expect(crossesSection("/jobs", "/no-such-page")).toBe(true);
  });
});

describe("copyForPath", () => {
  it("区分にない URL は既定の一文", () => {
    expect(copyForPath("/jobs/a").eyebrow).toBe("Jobs");
    expect(copyForPath("/no-such-page").eyebrow).toBe("Rishirecruit");
  });
});
