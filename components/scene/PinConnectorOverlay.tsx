"use client";

import { useEffect, useRef } from "react";
import { useActivePinPositionStore } from "@/store/active-pin-position-store";
import { getSceneLayout } from "./useSceneLayout";

// ピン外周からさらに離す余白（円と点線の間に空ける隙間、px）
// 値を小さくすると dot がピンに近づき、大きくすると離れる
const PIN_EDGE_GAP = 12;

/**
 * 3D 側の活性ピンと DOM 側のエリア情報パネルを、点線（stroke-dasharray でドット）で
 * 視覚的に接続するオーバーレイ。
 *
 * - Fixed 全画面 SVG、pointer-events: none
 * - rAF ループで store 直接読み + パネル DOM の getBoundingClientRect
 * - 描画は React 再レンダを避けて imperative に SVG 属性を書き換える
 * - SP は出さない(カードが横に動くため。選択中のピンは Pin 側で脈打たせる)
 * - PC はパネルの左辺の中央、タブレット(パネルが画面下)は上辺の中央につなぐ
 * - パネルが不在 or ピンが視錐台外なら非表示
 */
export function PinConnectorOverlay() {
  const svgRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    let raf = 0;
    let lastX = -1;
    let lastY = -1;
    let lastTargetX = -1;
    let lastTargetY = -1;
    let lastVisible = false;

    const tick = () => {
      const svg = svgRef.current;
      const line = lineRef.current;
      if (!svg || !line) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const {
        x: pinX,
        y: pinY,
        radius: pinRadius,
        visible,
      } = useActivePinPositionStore.getState().position;
      const target = document.querySelector<HTMLElement>(
        '[data-pin-connector-target="area-info"]',
      );

      const layout = getSceneLayout();
      const shouldShow = layout !== "sp" && visible && target !== null;

      if (!shouldShow) {
        if (svg.style.opacity !== "0") svg.style.opacity = "0";
        lastVisible = false;
        raf = requestAnimationFrame(tick);
        return;
      }

      const rect = target.getBoundingClientRect();
      // PC はパネルが右にあるため左辺中央、タブレットは画面下にあるため上辺中央に終点を置く
      const targetX =
        layout === "tablet" ? rect.left + rect.width / 2 : rect.left;
      const targetY =
        layout === "tablet" ? rect.top : rect.top + rect.height / 2;

      // ピンもパネルも動いていなければ描画スキップ
      // (パネルは切り替え時のアニメーションや画面の回転で動く)
      if (
        lastVisible &&
        Math.abs(pinX - lastX) < 0.5 &&
        Math.abs(pinY - lastY) < 0.5 &&
        Math.abs(targetX - lastTargetX) < 0.5 &&
        Math.abs(targetY - lastTargetY) < 0.5
      ) {
        raf = requestAnimationFrame(tick);
        return;
      }
      lastX = pinX;
      lastY = pinY;
      lastTargetX = targetX;
      lastTargetY = targetY;
      lastVisible = true;

      // ピン中心 → パネルへの単位ベクトル
      const dx = targetX - pinX;
      const dy = targetY - pinY;
      const dist = Math.hypot(dx, dy) || 1;
      const ux = dx / dist;
      const uy = dy / dist;

      // 線の始点をピン外周＋余白ぶん外側へずらす
      const offset = pinRadius + PIN_EDGE_GAP;
      const startX = pinX + ux * offset;
      const startY = pinY + uy * offset;

      line.setAttribute("x1", startX.toString());
      line.setAttribute("y1", startY.toString());
      line.setAttribute("x2", targetX.toString());
      line.setAttribute("y2", targetY.toString());

      if (svg.style.opacity !== "1") svg.style.opacity = "1";

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      data-intro-ui="line"
      className="pin-connector-overlay"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity: 0,
        transition: "opacity 240ms ease",
        zIndex: 30,
      }}
    >
      <line
        ref={lineRef}
        x1="0"
        y1="0"
        x2="0"
        y2="0"
        stroke="#FFFFFF"
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray="0 8"
        opacity={0.95}
      />
    </svg>
  );
}
