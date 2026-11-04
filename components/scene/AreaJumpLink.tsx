"use client";

import { useEffect, useRef } from "react";
import { AREA_INFO } from "@/lib/constants/areas";
import styles from "./AreaJumpLink.module.css";
import { goToArea } from "./go-to-area";

// カードはエリアごとに作り直されるので、押した後のフォーカスを次のボタンへ引き継ぐ
let pendingFocusSlug: string | null = null;

// もう一方のエリアへ移動するボタン。島の上に要素を足さず、カードの中に置く。
export function AreaJumpLink({ areaSlug }: { areaSlug: string }) {
  const nextSlug = areaSlug === "oshidomari" ? "oniwaki" : "oshidomari";
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (pendingFocusSlug !== areaSlug) return;
    pendingFocusSlug = null;
    buttonRef.current?.focus({ preventScroll: true });
  }, [areaSlug]);

  return (
    <button
      ref={buttonRef}
      type="button"
      className={styles.jump}
      onClick={() => {
        pendingFocusSlug = nextSlug;
        goToArea(nextSlug);
      }}
    >
      {AREA_INFO[nextSlug].name}へ
      <span className={styles.tile} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" focusable="false">
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
      </span>
    </button>
  );
}
