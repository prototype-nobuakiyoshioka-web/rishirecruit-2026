"use client";

import { useEffect, type RefObject } from "react";
import { useScrollProgressStore } from "@/store/scroll-progress-store";

// 指を離したあとの慣性。1フレームごとの減衰率と、止めるときの速度(px/ms)。
const MOMENTUM_DECAY = 0.95;
const MOMENTUM_MIN_VELOCITY = 0.02;
// 縦横の判定を始めるまでの移動量(px)
const AXIS_LOCK_THRESHOLD = 8;
// 指を止めてからこの時間(ms)以上たって離したときは、慣性を出さない
const MOMENTUM_MAX_IDLE_MS = 80;

/**
 * カードの上の縦スクロール(タッチ・ホイール)を島のスクロールに渡す。
 * カードはキャンバスの上に重なっており、そのままでは島を回せない。
 */
export function useForwardScrollToIsland(
  ref: RefObject<HTMLElement | null>,
  // 配置(SP / タブレット / PC)が変わるとパネルの要素が替わるので、付け直すために受け取る
  layout: string,
) {
  useEffect(() => {
    const target = ref.current;
    if (!target) return;

    const scrollBy = (delta: number) => {
      const scrollElement = useScrollProgressStore.getState().scrollElement;
      if (scrollElement) scrollElement.scrollTop += delta;
    };

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) scrollBy(event.deltaY);
    };

    let startX = 0;
    let startY = 0;
    let lastY = 0;
    let lastTime = 0;
    let velocity = 0;
    let axis: "x" | "y" | null = null;
    let raf = 0;

    const handleTouchStart = (event: TouchEvent) => {
      cancelAnimationFrame(raf);
      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      lastY = touch.clientY;
      lastTime = event.timeStamp;
      velocity = 0;
      axis = null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      if (axis === null) {
        const dx = Math.abs(touch.clientX - startX);
        const dy = Math.abs(touch.clientY - startY);
        if (Math.max(dx, dy) < AXIS_LOCK_THRESHOLD) return;
        axis = dy > dx ? "y" : "x";
        lastY = touch.clientY;
        lastTime = event.timeStamp;
      }
      if (axis !== "y") return;

      const delta = lastY - touch.clientY;
      const elapsed = event.timeStamp - lastTime;
      if (elapsed > 0) velocity = delta / elapsed;
      lastY = touch.clientY;
      lastTime = event.timeStamp;
      scrollBy(delta);
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (axis !== "y") return;
      if (event.timeStamp - lastTime > MOMENTUM_MAX_IDLE_MS) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      let previous = performance.now();
      const step = (now: number) => {
        const elapsed = now - previous;
        previous = now;
        scrollBy(velocity * elapsed);
        velocity *= MOMENTUM_DECAY;
        if (Math.abs(velocity) > MOMENTUM_MIN_VELOCITY) {
          raf = requestAnimationFrame(step);
        }
      };
      raf = requestAnimationFrame(step);
    };

    target.addEventListener("wheel", handleWheel, { passive: true });
    target.addEventListener("touchstart", handleTouchStart, { passive: true });
    target.addEventListener("touchmove", handleTouchMove, { passive: true });
    target.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      target.removeEventListener("wheel", handleWheel);
      target.removeEventListener("touchstart", handleTouchStart);
      target.removeEventListener("touchmove", handleTouchMove);
      target.removeEventListener("touchend", handleTouchEnd);
    };
  }, [ref, layout]);
}
