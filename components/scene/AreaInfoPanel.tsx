"use client";

import { AREA_INFO } from "@/lib/constants/areas";
import { AreaJumpLink } from "./AreaJumpLink";
import { useScrollProgressStore } from "@/store/scroll-progress-store";

interface AreaInfoPanelProps {
  isMobile?: boolean;
  /** タブレットの下部パネル。幅が狭いので、説明の1行が折り返さない大きさにそろえる */
  isTablet?: boolean;
}

export function AreaInfoPanel({
  isMobile = false,
  isTablet = false,
}: AreaInfoPanelProps) {
  const areaSlug = useScrollProgressStore((state) => state.activeAreaSlug);
  const info = AREA_INFO[areaSlug];
  if (!info) return null;

  return (
    <div
      key={areaSlug}
      className="area-panel-enter"
      data-pin-connector-target="area-info"
      style={{
        position: "relative",
        width: isMobile ? "82vw" : "100%",
        // SP はタブカードと高さを揃えるため 100%。内容がはみ出す場合はカード内スクロール。
        height: isMobile ? "100%" : undefined,
        overflowY: isMobile ? "auto" : undefined,
        boxSizing: isMobile ? "border-box" : undefined,
        // SP は固定高のカードなので、見出し=上・本文=下に余白を振り分ける
        display: isMobile ? "flex" : undefined,
        flexDirection: isMobile ? "column" : undefined,
        background: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(8px)",
        borderRadius: "var(--radius-lg)",
        padding: isMobile
          ? "var(--space-2)"
          : isTablet
            ? "clamp(var(--space-4), 2.5dvh, var(--space-6)) var(--space-5)"
            : "clamp(var(--space-4), 2.5dvh, var(--space-6))",
        boxShadow: "var(--shadow-md)",
        willChange: "transform, opacity",
      }}
    >
      <AreaJumpLink areaSlug={areaSlug} />
      <p
        style={{
          fontSize: isMobile ? "0.7rem" : "0.75rem",
          fontWeight: 700,
          color: "var(--c-accent-text)",
          letterSpacing: "0.05em",
          marginBottom: isMobile
            ? "2px"
            : "clamp(var(--space-1), 1dvh, var(--space-2))",
          lineHeight: isMobile ? 1.1 : undefined,
        }}
      >
        Area
      </p>

      <h2
        style={{
          fontSize: isMobile
            ? "1.5rem"
            : "clamp(1.35rem, 3.2dvh, 1.75rem)",
          fontWeight: 700,
          color: "var(--c-deep-ocean)",
          marginBottom: isMobile
            ? "4px"
            : "clamp(var(--space-2), 2dvh, var(--space-4))",
          lineHeight: isMobile ? 1.2 : undefined,
        }}
      >
        {info.name}
        <span
          style={{
            fontSize: isMobile ? "0.8rem" : "1rem",
            marginLeft: "var(--space-2)",
            fontWeight: 600,
          }}
        >
          - {info.nameEn}
        </span>
      </h2>

      {isMobile ? (
        <div style={{ marginTop: "auto", marginBottom: "6px" }}>
          {info.catchCopy.map((line) => (
            <p
              key={line}
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "var(--c-deep-ocean)",
                lineHeight: 1.35,
              }}
            >
              {line}
            </p>
          ))}
        </div>
      ) : (
        <div
          style={{
            marginBottom: "clamp(var(--space-2), 2dvh, var(--space-4))",
          }}
        >
          {info.catchCopy.map((line) => (
            <p
              key={line}
              style={{
                fontSize: "clamp(0.95rem, 2.1dvh, 1.05rem)",
                fontWeight: 700,
                color: "var(--c-deep-ocean)",
                lineHeight: 1.5,
              }}
            >
              {line}
            </p>
          ))}
        </div>
      )}

      {isMobile ? (
        <div>
          {info.description.map((line) => (
            <p
              key={line}
              style={{
                fontSize: "0.75rem",
                color: "var(--c-text-secondary)",
                lineHeight: 1.35,
              }}
            >
              {line}
            </p>
          ))}
        </div>
      ) : (
        <div>
          {info.description.map((line) => (
          <p
            key={line}
            style={{
              fontSize: isTablet ? "0.82rem" : "clamp(0.82rem, 1.8dvh, 0.9rem)",
              color: "var(--c-text-secondary)",
              lineHeight: 1.55,
            }}
          >
            {line}
          </p>
          ))}
        </div>
      )}

    </div>
  );
}
