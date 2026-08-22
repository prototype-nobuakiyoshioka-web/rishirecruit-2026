import { describe, expect, it } from "vitest";
import { gridSpanClass } from "@/lib/utils/grid-spans";

describe("gridSpanClass", () => {
  it("パターン先頭の span クラスを返す", () => {
    expect(gridSpanClass(0)).toBe("md:col-span-7");
    expect(gridSpanClass(6)).toBe("md:col-span-12");
  });
  it("パターン長(11)で循環する", () => {
    expect(gridSpanClass(11)).toBe(gridSpanClass(0));
  });
  it("常に静的な md:col-span-* を返す(Tailwind purge対策)", () => {
    for (let i = 0; i < 22; i++) {
      expect(gridSpanClass(i)).toMatch(/^md:col-span-\d+$/);
    }
  });
});
