"use client";

import { AREA_INFO } from "@/lib/constants/areas";
import { useScrollProgressStore } from "@/store/scroll-progress-store";

export interface AreaShortcut {
  key: string;
  label: string;
  count: number;
  color: string;
}

interface AreaInfoPanelProps {
  isMobile?: boolean;
  // SP のみ:カード下部に出す「求人 12」などの件数ボタン。0件のものは呼び出し側で除外する
  shortcuts?: AreaShortcut[];
  onShortcutSelect?: (key: string) => void;
}

function ArrowRightIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M6 3.5L10.5 8L6 12.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AreaInfoPanel({
  isMobile = false,
  shortcuts = [],
  onShortcutSelect,
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
        width: isMobile ? "82vw" : "100%",
        // SP はタブカードと高さを揃えるため 100%。内容がはみ出す場合はカード内スクロール。
        height: isMobile ? "100%" : undefined,
        overflowY: isMobile ? "auto" : undefined,
        boxSizing: isMobile ? "border-box" : undefined,
        // SP は固定高のカードなので、見出し=上・本文=中央・件数ボタン=下に余白を振り分ける
        display: isMobile ? "flex" : undefined,
        flexDirection: isMobile ? "column" : undefined,
        background: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(8px)",
        borderRadius: "var(--radius-lg)",
        padding: isMobile
          ? "var(--space-2)"
          : "clamp(var(--space-4), 2.5dvh, var(--space-6))",
        boxShadow: "var(--shadow-md)",
        willChange: "transform, opacity",
      }}
    >
      <p
        style={{
          fontSize: isMobile ? "0.7rem" : "0.75rem",
          fontWeight: 700,
          color: "var(--c-pin-spot)",
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

      {isMobile && shortcuts.length > 0 && (
        <div
          style={{
            marginTop: "auto",
            paddingTop: "var(--space-2)",
            borderTop: "1px solid rgba(10, 46, 78, 0.08)",
            display: "flex",
            gap: "var(--space-1)",
          }}
        >
          {shortcuts.map((shortcut) => (
            <button
              key={shortcut.key}
              type="button"
              onClick={() => onShortcutSelect?.(shortcut.key)}
              aria-label={`${info.name}の${shortcut.label} ${shortcut.count}件を見る`}
              style={{
                // 文字数の多いボタン(スポット 11 など)が詰まらないよう、幅は中身に応じて配分
                flex: "1 1 auto",
                minHeight: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "3px",
                padding: "0 8px",
                borderRadius: "var(--radius-full)",
                border: "none",
                background: "rgba(10, 46, 78, 0.06)",
                color: "var(--c-deep-ocean)",
                fontSize: "0.75rem",
                fontWeight: 700,
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "var(--radius-full)",
                  background: shortcut.color,
                  flexShrink: 0,
                }}
              />
              {shortcut.label}
              <span style={{ fontSize: "0.875rem" }}>{shortcut.count}</span>
              <ArrowRightIcon />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
