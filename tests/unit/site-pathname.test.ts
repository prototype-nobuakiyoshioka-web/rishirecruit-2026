import { describe, expect, it } from "vitest";
import { normalizeSitePathname } from "@/lib/utils/site-pathname";

describe("normalizeSitePathname", () => {
  it("ISR で作り直したトップの /index を / として扱う", () => {
    expect(normalizeSitePathname("/index")).toBe("/");
  });

  it("ほかのパスはそのまま", () => {
    expect(normalizeSitePathname("/")).toBe("/");
    expect(normalizeSitePathname("/jobs/index")).toBe("/jobs/index");
    expect(normalizeSitePathname("/voices")).toBe("/voices");
  });
});
