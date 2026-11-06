"use client";

import { useLayoutEffect } from "react";
import { restoreIntroAttribute } from "@/lib/three/island-intro";

// ハイドレーションに失敗して <html> の属性が付け直されても、描画前に data-intro を戻す
export function IntroPhaseSync() {
  useLayoutEffect(restoreIntroAttribute, []);
  return null;
}
