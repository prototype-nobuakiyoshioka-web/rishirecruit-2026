"use client";

import Image from "next/image";
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

  // 島の代わりに、メッセージページと同じ「北海道の中の利尻島」の地図を置き、
  // 上半分が空いたまま求人ボタンだけが浮いて見えないようにする。
  // SP は下部カードとコラム看板(高さ約 270px)の上の空きに収める。
  return (
    <div
      className="relative flex h-dvh flex-col items-center gap-[var(--space-4)] px-[var(--space-6)] pb-[calc(var(--sp-area-panel-h)+6rem)] pt-24 md:items-start md:justify-end md:pb-40 md:pl-[var(--space-6)] md:pt-0"
      style={{
        background:
          "radial-gradient(circle at 78% 18%, rgba(201, 226, 240, 0.78), transparent 27%), linear-gradient(160deg, #5BB4E0 0%, #37A9C7 55%, #1A8FA8 100%)",
      }}
    >
      <div className="relative min-h-0 w-full max-w-md flex-1 md:absolute md:left-[var(--space-6)] md:top-28 md:h-[calc(100dvh-7rem-17rem)] md:w-[calc(100vw-34rem-var(--space-6)*3)] md:max-w-[52rem] md:flex-none">
        <Image
          src="/images/message/rishirifuji-hokkaidou.png"
          alt="北海道に対する利尻島の位置を示した図"
          fill
          sizes="(max-width: 767px) calc(100vw - 48px), 52rem"
          className="object-contain object-center md:object-left"
        />
      </div>
      <div className="w-60 shrink-0">
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
