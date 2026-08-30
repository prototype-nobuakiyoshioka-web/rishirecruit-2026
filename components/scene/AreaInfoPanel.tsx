"use client";

import { AREA_INFO } from "@/lib/constants/areas";
import { useScrollProgressStore } from "@/store/scroll-progress-store";

interface AreaInfoPanelProps {
  isMobile?: boolean;
}

export function AreaInfoPanel({ isMobile = false }: AreaInfoPanelProps) {
  const areaSlug = useScrollProgressStore((state) => state.activeAreaSlug);
  const info = AREA_INFO[areaSlug];
  if (!info) return null;

  return (
    <div
      key={areaSlug}
      className="area-panel-enter"
      data-pin-connector-target={isMobile ? undefined : "area-info"}
      style={{
        width: isMobile ? "82vw" : "100%",
        height: isMobile ? "100%" : undefined,
        boxSizing: isMobile ? "border-box" : undefined,
        background: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(8px)",
        borderRadius: "var(--radius-lg)",
        padding: isMobile
          ? "var(--space-3)"
          : "clamp(var(--space-4), 2.5dvh, var(--space-6))",
        boxShadow: "var(--shadow-md)",
        willChange: "transform, opacity",
      }}
    >
      <p
        style={{
          fontSize: isMobile
            ? "clamp(0.875rem, 2dvh, 0.95rem)"
            : "0.75rem",
          fontWeight: 700,
          color: "var(--c-pin-spot)",
          letterSpacing: "0.05em",
          marginBottom: isMobile
            ? "var(--space-1)"
            : "clamp(var(--space-1), 1dvh, var(--space-2))",
        }}
      >
        Area
      </p>

      <h2
        style={{
          fontSize: isMobile
            ? "clamp(1.25rem, 3.2dvh, 1.5rem)"
            : "clamp(1.35rem, 3.2dvh, 1.75rem)",
          fontWeight: 700,
          color: "var(--c-deep-ocean)",
          marginBottom: isMobile
            ? "var(--space-1)"
            : "clamp(var(--space-2), 2dvh, var(--space-4))",
        }}
      >
        {info.name}
        <span
          style={{
            fontSize: isMobile ? "0.875rem" : "1rem",
            marginLeft: "var(--space-2)",
            fontWeight: 600,
          }}
        >
          - {info.nameEn}
        </span>
      </h2>

      {isMobile ? (
        <p
          style={{
            marginBottom: "var(--space-1)",
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "var(--c-deep-ocean)",
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 1,
            overflow: "hidden",
          }}
        >
          {info.catchCopy.join(" ")}
        </p>
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
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--c-text-secondary)",
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 1,
            overflow: "hidden",
          }}
        >
          {info.description.join(" ")}
        </p>
      ) : (
        <div>
          {info.description.map((line) => (
          <p
            key={line}
            style={{
              fontSize: "clamp(0.82rem, 1.8dvh, 0.9rem)",
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
