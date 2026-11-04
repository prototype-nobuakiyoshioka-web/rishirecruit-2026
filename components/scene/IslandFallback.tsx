"use client";

import { useEffect } from "react";
import { FooterLegalLinks } from "@/components/layout/FooterInfo";
import { Button } from "@/components/ui/Button";
import { setIntroPhase } from "@/lib/three/island-intro";

/**
 * 3D を表示できないとき(WebGL 非対応、モデルの取得失敗)の代替表示。
 * 求人への導線を出す。カード(AreaSidePanels)とエリア移動はそのまま使える。
 * 島を回して出す PC のフッターは出せないので、規約へのリンクをここに置く。
 */
export function IslandFallback() {
  // オープニングは島がないと再生できないので、隠していた UI をすぐ出す
  useEffect(() => setIntroPhase(null), []);

  return (
    <div
      className="flex h-dvh flex-col items-center gap-[var(--space-4)] pt-28 md:items-start md:justify-end md:pb-40 md:pl-[var(--space-6)] md:pt-0"
      style={{
        background:
          "radial-gradient(circle at 78% 18%, rgba(201, 226, 240, 0.78), transparent 27%), linear-gradient(160deg, #5BB4E0 0%, #37A9C7 55%, #1A8FA8 100%)",
      }}
    >
      <div className="w-60">
        <Button href="/jobs" variant="aqua" fullWidth>
          求人一覧を見る
        </Button>
      </div>
      <div className="hidden text-sm font-bold text-[color:var(--c-deep-ocean)] md:block">
        <FooterLegalLinks />
      </div>
    </div>
  );
}
