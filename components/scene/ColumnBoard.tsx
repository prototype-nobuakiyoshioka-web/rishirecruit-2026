"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

const BOARD_LINK_STYLE: CSSProperties = {
  bottom: "calc(var(--space-6) + 44px)",
  left: "var(--space-6)",
  backgroundColor:
    "color-mix(in srgb, var(--c-snow) 88%, transparent)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--shadow-md)",
  color: "var(--c-text-primary)",
};

export function ColumnBoard() {
  return (
    <Link
      href="/columns"
      aria-label="コラム一覧を見る"
      className="group fixed z-40 flex h-16 w-32 items-center gap-[var(--space-3)] overflow-hidden border border-[color:var(--c-border-subtle)] px-[var(--space-3)] transition-[transform,border-color,background-color] duration-200 hover:-translate-y-1 hover:scale-[1.03] hover:border-[color:var(--c-deep-ocean)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--c-paper)] max-md:z-50 max-md:!bottom-[calc(30dvh+var(--space-2))] max-md:!left-[4vw] max-md:h-14 max-md:w-28 max-md:gap-[var(--space-2)] max-md:px-[var(--space-2)]"
      style={BOARD_LINK_STYLE}
    >
      <span
        aria-hidden="true"
        className="absolute right-[var(--space-2)] top-[var(--space-2)] size-1.5 rounded-[var(--radius-full)] bg-[color:var(--c-pin-spot)] ring-2 ring-[color:var(--c-snow)]"
      />
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[color:var(--c-border-subtle)] bg-[color:var(--c-paper)] text-[color:var(--c-deep-ocean)] transition-colors duration-200 group-hover:border-[color:var(--c-deep-ocean)] max-md:size-7"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-5 max-md:size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6.5 3.5h9l2 2v15h-11z" />
          <path d="M15.5 3.5v3h3M9.5 10h5M9.5 14h5M9.5 18h3" />
        </svg>
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[0.625rem] font-bold leading-none tracking-[0.14em] text-[color:var(--c-text-secondary)] max-md:text-[0.5625rem]">
          NOTE
        </span>
        <span className="mt-[var(--space-1)] whitespace-nowrap text-base font-black leading-none tracking-normal text-[color:var(--c-deep-ocean)] max-md:text-sm">
          コラム
        </span>
      </span>
    </Link>
  );
}
