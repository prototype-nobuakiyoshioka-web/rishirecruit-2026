"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

const BOARD_LINK_STYLE: CSSProperties = {
  bottom: "calc(var(--space-6) + 44px)",
  left: "var(--space-6)",
};

const BOARD_STYLE: CSSProperties = {
  // 木専用トークンは未定義のため、昆布の金(--c-pin-spot)をベースに茶系グラデーションで木目感を作る。
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.24), rgba(31,27,22,0.10)), repeating-linear-gradient(90deg, #B87832 0 18px, #C98C42 18px 34px, var(--c-pin-spot) 34px 52px)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--shadow-pop-gold), var(--shadow-md)",
  color: "var(--c-text-primary)",
};

const BOARD_RAIL_STYLE: CSSProperties = {
  backgroundColor: "rgba(31, 27, 22, 0.18)",
};

const POST_STYLE: CSSProperties = {
  background:
    "linear-gradient(90deg, #7A451E 0%, #B87832 45%, #6A3A19 100%)",
  boxShadow: "var(--shadow-md)",
};

export function ColumnBoard() {
  return (
    <Link
      href="/columns"
      aria-label="コラム一覧を見る"
      className="group fixed z-40 block min-h-24 min-w-36 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--c-paper)]"
      style={BOARD_LINK_STYLE}
    >
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-[var(--space-4)] h-16 w-4 rounded-b-[var(--radius-md)]"
        style={POST_STYLE}
      />
      <span
        aria-hidden="true"
        className="absolute bottom-0 right-[var(--space-4)] h-16 w-4 rounded-b-[var(--radius-md)]"
        style={POST_STYLE}
      />

      <span
        className="relative flex min-h-20 min-w-40 flex-col items-center justify-center overflow-hidden border-2 border-[rgba(31,27,22,0.22)] px-[var(--space-5)] py-[var(--space-3)] text-center transition-transform duration-200 group-hover:-translate-y-1 group-hover:scale-[1.03]"
        style={BOARD_STYLE}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 top-[var(--space-2)] h-0.5"
          style={BOARD_RAIL_STYLE}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 bottom-[var(--space-2)] h-0.5"
          style={BOARD_RAIL_STYLE}
        />
        <span className="text-xl font-black leading-none tracking-normal">
          コラム
        </span>
        <span className="mt-[var(--space-1)] text-xs font-black leading-none tracking-normal text-[color:var(--c-deep-ocean)]">
          NOTE
        </span>
      </span>
    </Link>
  );
}
