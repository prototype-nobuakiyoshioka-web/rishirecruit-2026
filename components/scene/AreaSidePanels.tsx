"use client";

import { useEffect, useState } from "react";
import type { AreaWithPosts } from "@/lib/wp/queries/areas";
import { AreaInfoPanel } from "./AreaInfoPanel";
import { AreaPostSlider } from "./AreaPostSlider";

interface AreaSidePanelsProps {
  areaData: Record<string, AreaWithPosts | null>;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const updateMatches = () => setMatches(mediaQuery.matches);

    updateMatches();
    mediaQuery.addEventListener("change", updateMatches);

    return () => mediaQuery.removeEventListener("change", updateMatches);
  }, [query]);

  return matches;
}

export function AreaSidePanels({ areaData }: AreaSidePanelsProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (isMobile) {
    return (
      <div
        className="fixed z-40 flex"
        style={{
          top: "70dvh",
          right: 0,
          bottom: "var(--space-4)",
          width: "100vw",
          flexDirection: "column",
          minHeight: 0,
          pointerEvents: "none",
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
    );
  }

  return (
    <div
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
        overflowY: "auto",
        overscrollBehavior: "contain",
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
  );
}
