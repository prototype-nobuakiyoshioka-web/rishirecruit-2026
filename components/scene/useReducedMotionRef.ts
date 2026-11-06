"use client";

import { useEffect, useRef } from "react";

/**
 * 「動きを減らす」設定を ref で返す。useFrame の中で毎フレーム読むため state にしない。
 * 設定の切り替えにも追従する。
 */
export function useReducedMotionRef() {
  const reduced = useRef(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reduced.current = query.matches;
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}
