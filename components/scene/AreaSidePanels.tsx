"use client";

import { useRef, type CSSProperties } from "react";
import type { AreaWithPosts } from "@/lib/wp/queries/areas";
import { AREA_INFO } from "@/lib/constants/areas";
import { useScrollProgressStore } from "@/store/scroll-progress-store";
import { AreaInfoPanel } from "./AreaInfoPanel";
import { AreaPostSlider } from "./AreaPostSlider";
import { useForwardScrollToIsland } from "./useForwardScrollToIsland";
import { useSceneLayout } from "./useSceneLayout";

interface AreaSidePanelsProps {
  areaData: Record<string, AreaWithPosts | null>;
}

// 見えているエリアが変わったことをスクリーンリーダーに伝える
function AreaLiveStatus() {
  const areaSlug = useScrollProgressStore((state) => state.activeAreaSlug);
  return (
    <p className="sr-only" aria-live="polite">
      {AREA_INFO[areaSlug]?.name}エリアを表示しています
    </p>
  );
}

export function AreaSidePanels({ areaData }: AreaSidePanelsProps) {
  // マウント前は PC の配置で描く(従来どおり)
  const layout = useSceneLayout() ?? "pc";
  const isMobile = layout === "sp";
  const panelRef = useRef<HTMLDivElement>(null);
  useForwardScrollToIsland(panelRef, layout);

  if (isMobile) {
    return (
      <>
      <AreaLiveStatus />
      <div
        ref={panelRef}
        data-intro-ui="panel"
        className="fixed z-40 flex"
        style={{
          // 画面高の割合だと縦長端末で空白が増えるため、中身に合わせた固定高にする。
          // ColumnBoard(コラム看板)も同じ変数で位置を合わせる。
          height: "var(--sp-area-panel-h)",
          right: 0,
          bottom: "var(--space-4)",
          width: "100vw",
          flexDirection: "column",
          minHeight: 0,
          pointerEvents: "none",
          // 横はカルーセルに任せ、縦はフックで受けて島を回す
          touchAction: "pan-x",
        }}
      >
        <div
          style={{
            width: "100vw",
            minHeight: 0,
            flex: 1,
            pointerEvents: "auto",
          }}
        >
          <AreaPostSlider areaData={areaData} isMobile />
        </div>
      </div>
      </>
    );
  }

  if (layout === "tablet") {
    return (
      <>
      <AreaLiveStatus />
      {/* タブレット:エリアと投稿のパネルを画面の下に左右で並べ、上に島とピンを見せる。
          部品と動き(線・タブ・ページ送り)は PC と同じ */}
      <div
        ref={panelRef}
        data-intro-ui="panel"
        className="fixed z-40 grid"
        style={{
          // エリアのパネルは説明の最長行(23字)が1行に収まる幅、投稿のパネルは PC と同じ幅。
          // 768px では残りの幅を投稿のパネルに使う
          "--tablet-area-panel-w": "22rem",
          "--tablet-post-panel-w": "34rem",
          // コラム看板(ColumnBoard: 下から 24+44px、高さ 64px)の上にエリアのパネルを置くための余白
          // (並びの下端 24px からの距離)
          "--tablet-board-clearance": "calc(44px + 64px + var(--space-4))",
          left: "var(--space-6)",
          right: "var(--space-6)",
          bottom: "var(--space-6)",
          gridTemplateColumns:
            "minmax(0, var(--tablet-area-panel-w)) minmax(0, var(--tablet-post-panel-w))",
          justifyContent: "space-between",
          alignItems: "end",
          columnGap: "var(--space-4)",
          pointerEvents: "none",
        } as CSSProperties}
      >
        {/* 左下のコラム看板(ColumnBoard)に重ならないよう、エリアのパネルはその上に置く */}
        <div
          style={{
            minWidth: 0,
            marginBottom: "var(--tablet-board-clearance)",
            pointerEvents: "auto",
          }}
        >
          <AreaInfoPanel isTablet />
        </div>
        <div style={{ minWidth: 0, pointerEvents: "auto" }}>
          <AreaPostSlider areaData={areaData} isTablet />
        </div>
      </div>
      </>
    );
  }

  return (
    <>
    <AreaLiveStatus />
    <div
      ref={panelRef}
      data-intro-ui="panel"
      className="fixed z-40 hidden md:flex"
      style={{
        top: "calc(var(--space-6) + 6rem)",
        right: "var(--space-6)",
        height:
          "calc(100dvh - (var(--space-6) + 6rem) - var(--space-6))",
        width: "34rem",
        flexDirection: "column",
        gap: "clamp(var(--space-4), 3dvh, calc(var(--space-6) + var(--space-2)))",
        justifyContent: "flex-start",
        minHeight: 0,
        // overflowY: auto はホイールイベントを吸収して 3D シーンのスクロール回転を
        // 阻害するため使わない。パネル全体が viewport に収まる想定。
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      <div style={{ minHeight: 0, flexShrink: 0, pointerEvents: "auto" }}>
        <AreaInfoPanel />
      </div>
      <div style={{ minHeight: 0, flexShrink: 0, pointerEvents: "auto" }}>
        <AreaPostSlider areaData={areaData} />
      </div>
    </div>
    </>
  );
}
