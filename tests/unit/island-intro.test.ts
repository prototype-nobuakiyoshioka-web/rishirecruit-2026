import { describe, expect, it } from "vitest";
import { getIntroEase, INTRO_DURATION_S } from "@/lib/three/island-intro";

describe("getIntroEase", () => {
  it("開始は 0、終了以降は 1", () => {
    expect(getIntroEase(0)).toBe(0);
    expect(getIntroEase(INTRO_DURATION_S)).toBe(1);
    expect(getIntroEase(INTRO_DURATION_S * 2)).toBe(1);
  });

  it("負の経過時間でも 0 より小さくならない", () => {
    expect(getIntroEase(-1)).toBe(0);
  });

  it("前半で大きく進み、後半はゆっくりになる", () => {
    expect(getIntroEase(INTRO_DURATION_S / 2)).toBeGreaterThan(0.8);
  });
});
