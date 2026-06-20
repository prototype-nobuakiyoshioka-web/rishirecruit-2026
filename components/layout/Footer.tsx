"use client";

import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import {
  FooterCopyright,
  FooterLegalLinks,
  FooterOfficeInfo,
} from "@/components/layout/FooterInfo";
import { useScrollProgressStore } from "@/store/scroll-progress-store";

const HOME_PANEL_STYLE: CSSProperties = {
  // 3D Canvasを覆い隠さないよう、deep-oceanを半透明化した控えめなHUDパネルにする。
  backgroundColor: "rgba(10, 46, 78, 0.64)",
  backdropFilter: "blur(10px)",
  borderColor: "rgba(250, 246, 238, 0.24)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--shadow-md)",
  left: "var(--space-6)",
  // Header(h-16=64px + top padding/余白)の直下に、左HUDとして重ならない位置へ置く。
  top: "7rem",
  // ColumnBoardや島の主表示を圧迫しない、住所情報が折り返しすぎない最小幅。
  width: "17rem",
  zIndex: 30,
};

const STATIC_FOOTER_STYLE: CSSProperties = {
  backgroundColor: "var(--c-deep-ocean)",
  color: "var(--c-text-inverse)",
};

const STATIC_INNER_STYLE: CSSProperties = {
  maxWidth: "var(--container-max)",
  paddingInline: "var(--space-6)",
};

function FooterContent({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "text-xs leading-5" : "text-sm leading-6"}>
      <FooterOfficeInfo />
      <FooterLegalLinks className="mt-[var(--space-4)] text-[color:var(--c-text-inverse)]/85" />
      <FooterCopyright className="mt-[var(--space-4)] text-[color:var(--c-text-inverse)]/75" />
    </div>
  );
}

export function Footer() {
  const pathname = usePathname();
  const isRotationComplete = useScrollProgressStore(
    (state) => state.isRotationComplete
  );
  const isHome = pathname === "/";

  if (isHome) {
    return (
      <footer
        className="fixed hidden border p-[var(--space-4)] text-[color:var(--c-text-inverse)] md:block"
        style={{
          ...HOME_PANEL_STYLE,
          opacity: isRotationComplete ? 1 : 0,
          pointerEvents: isRotationComplete ? "auto" : "none",
          visibility: isRotationComplete ? "visible" : "hidden",
          transition: "opacity 700ms ease, visibility 700ms ease",
        }}
        aria-hidden={isRotationComplete ? undefined : true}
      >
        <FooterContent compact />
      </footer>
    );
  }

  return (
    <footer className="mt-auto hidden md:block" style={STATIC_FOOTER_STYLE}>
      <div
        className="mx-auto py-[calc(var(--space-6)*2)]"
        style={STATIC_INNER_STYLE}
      >
        <FooterContent />
      </div>
    </footer>
  );
}
