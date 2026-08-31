"use client";

import { useEffect, useRef } from "react";
import { useActivePinPositionStore } from "@/store/active-pin-position-store";

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
 * - パネルが不在(SP等) or ピンが視錐台外なら非表示
 */
export function PinConnectorOverlay() {
  const svgRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    let raf = 0;
    let lastX = -1;
    let lastY = -1;
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

      const shouldShow = visible && target !== null;

      if (!shouldShow) {
        if (svg.style.opacity !== "0") svg.style.opacity = "0";
        raf = requestAnimationFrame(tick);
        return;
      }

      // 何も変化していなければ描画スキップ
      if (Math.abs(pinX - lastX) < 0.5 && Math.abs(pinY - lastY) < 0.5 && lastVisible) {
        raf = requestAnimationFrame(tick);
        return;
      }
      lastX = pinX;
      lastY = pinY;
      lastVisible = true;

      const rect = target.getBoundingClientRect();
      // ピンから見てパネルのどの辺が最も近いかで終点を決める。
      // 画面幅が狭い（SP）とパネルは下にあるため上辺中央、
      // 広い（PC）とパネルは右にあるため左辺中央に終点を置く。
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      const targetX = isMobile ? rect.left + rect.width / 2 : rect.left;
      const targetY = isMobile ? rect.top : rect.top + rect.height / 2;

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
      className="pin-connector-overlay"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
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
