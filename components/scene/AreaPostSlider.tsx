"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { AreaWithPosts } from "@/lib/wp/queries/areas";
import type { JobPosting, Touristspot, WPEvent } from "@/lib/wp/types";
import { useScrollProgressStore } from "@/store/scroll-progress-store";
import { AreaInfoPanel } from "./AreaInfoPanel";

type TabType = "job" | "event" | "spot";

interface PostInfo {
  title: string;
  catchCopy: string | null;
  imageUrl: string | null;
  href: string;
}

const TABS: { key: TabType; label: string }[] = [
  { key: "job", label: "Job" },
  { key: "event", label: "Event" },
  { key: "spot", label: "Spot" },
];

function ChevronLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 3.5L5.5 8L10 12.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
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

interface AreaPostSliderProps {
  areaData: Record<string, AreaWithPosts | null>;
  isMobile?: boolean;
}

interface AreaPostSliderContentProps extends AreaPostSliderProps {
  areaSlug: string;
}

function getJobInfo(post: JobPosting): PostInfo {
  return {
    title: post.title,
    catchCopy: post.jobPostingFields?.catchCopy ?? null,
    imageUrl: post.jobPostingFields?.thumbnailImage?.node?.sourceUrl ?? null,
    href: `/jobs/${post.slug}`,
  };
}

function getEventInfo(post: WPEvent): PostInfo {
  return {
    title: post.title,
    catchCopy: post.eventFields?.catchCopy ?? null,
    imageUrl: post.eventFields?.thumbnailImage?.node?.sourceUrl ?? null,
    href: `/events/${post.slug}`,
  };
}

function getSpotInfo(post: Touristspot): PostInfo {
  return {
    title: post.title,
    catchCopy: post.touristspotFields?.catchCopy ?? null,
    imageUrl: post.touristspotFields?.thumbnailImage?.node?.sourceUrl ?? null,
    href: `/spots/${post.slug}`,
  };
}

export function AreaPostSlider({
  areaData,
  isMobile = false,
}: AreaPostSliderProps) {
  const areaSlug = useScrollProgressStore((state) => state.activeAreaSlug);

  return (
    <AreaPostSliderContent
      key={areaSlug}
      areaSlug={areaSlug}
      areaData={areaData}
      isMobile={isMobile}
    />
  );
}

function AreaPostSliderContent({
  areaSlug,
  areaData,
  isMobile = false,
}: AreaPostSliderContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>("job");
  const [slideIndex, setSlideIndex] = useState(0);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);

  const area = areaData[areaSlug];
  const jobPostings = area?.jobPostings.nodes ?? [];
  const events = area?.events.nodes ?? [];
  const touristspots = area?.touristspots.nodes ?? [];

  const postsLength =
    activeTab === "job"
      ? jobPostings.length
      : activeTab === "event"
        ? events.length
        : touristspots.length;

  const currentIndex = postsLength > 0 ? Math.min(slideIndex, postsLength - 1) : 0;
  const info =
    activeTab === "job"
      ? jobPostings[currentIndex]
        ? getJobInfo(jobPostings[currentIndex])
        : null
      : activeTab === "event"
        ? events[currentIndex]
          ? getEventInfo(events[currentIndex])
          : null
        : touristspots[currentIndex]
          ? getSpotInfo(touristspots[currentIndex])
          : null;

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSlideIndex(0);
  };

  if (isMobile) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100%",
        }}
      >
        <div
          ref={mobileCarouselRef}
          aria-label="エリアと投稿のカルーセル"
          style={{
            width: "100vw",
            height: "100%",
            display: "flex",
            gap: "var(--space-4)",
            overflowX: "auto",
            overflowY: "hidden",
            padding: "0 0 0 4vw",
            boxSizing: "border-box",
            scrollSnapType: "x mandatory",
            scrollPaddingInline: "4vw 0",
            overscrollBehaviorX: "contain",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          <div
            data-carousel-card="area"
            style={{
              width: "82vw",
              height: "100%",
              flex: "0 0 82vw",
              scrollSnapAlign: "start",
            }}
          >
            <AreaInfoPanel isMobile />
          </div>

          <div
            data-carousel-card="post"
            style={{
              width: "88vw",
              height: "100%",
              flex: "0 0 88vw",
              display: "flex",
              flexDirection: "column",
              scrollSnapAlign: "end",
              minHeight: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "var(--space-1)",
                height: "44px",
                flexShrink: 0,
              }}
            >
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  style={{
                    minHeight: "44px",
                    padding: "0.35rem clamp(1rem, 5vw, 1.25rem)",
                    borderRadius: "var(--radius-md) var(--radius-md) 0 0",
                    background:
                      activeTab === tab.key
                        ? "rgba(255, 255, 255, 0.95)"
                        : "rgba(255, 255, 255, 0.7)",
                    fontWeight: activeTab === tab.key ? 700 : 500,
                    fontSize: "0.875rem",
                    color: "var(--c-deep-ocean)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <article
              style={{
                minHeight: 0,
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "var(--space-3)",
                boxSizing: "border-box",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(8px)",
                borderRadius: "0 var(--radius-lg) var(--radius-lg) var(--radius-lg)",
                boxShadow: "var(--shadow-md)",
                overflow: "hidden",
              }}
            >
              {info ? (
                <div
                  style={{
                    minHeight: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3
                      style={{
                        fontSize: "clamp(0.875rem, 2dvh, 1rem)",
                        fontWeight: 700,
                        color: "var(--c-deep-ocean)",
                        lineHeight: 1.35,
                        marginBottom: "var(--space-1)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {info.title}
                    </h3>
                    {info.catchCopy && (
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--c-text-secondary)",
                          lineHeight: 1.35,
                          marginBottom: "var(--space-1)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {info.catchCopy}
                      </p>
                    )}
                    <Link
                      href={info.href}
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        color: "var(--c-deep-ocean)",
                      }}
                    >
                      詳細を見る →
                    </Link>
                  </div>

                  <div
                    data-mobile-thumbnail
                    style={{
                      width: "28vw",
                      maxWidth: "7rem",
                      aspectRatio: "4 / 3",
                      position: "relative",
                      flexShrink: 0,
                      overflow: "hidden",
                      borderRadius: "var(--radius-md)",
                      background: "#E5E5E5",
                    }}
                  >
                    {info.imageUrl && (
                      <Image
                        src={info.imageUrl}
                        alt={info.title}
                        fill
                        sizes="28vw"
                        style={{ objectFit: "cover" }}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <p
                  style={{
                    color: "var(--c-text-secondary)",
                    fontSize: "0.875rem",
                  }}
                >
                  このエリアには該当する情報がありません。
                </p>
              )}

              {postsLength > 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "var(--space-3)",
                    marginTop: "var(--space-1)",
                    paddingTop: "var(--space-1)",
                    borderTop: "1px solid rgba(10, 46, 78, 0.08)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setSlideIndex(
                        (index) => (index - 1 + postsLength) % postsLength,
                      )
                    }
                    aria-label="前の投稿"
                    style={{
                      width: "2rem",
                      height: "2rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "9999px",
                      border: "none",
                      background: "rgba(10, 46, 78, 0.06)",
                      color: "var(--c-deep-ocean)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <ChevronLeftIcon />
                  </button>

                  <div style={{ display: "flex", gap: "0.3rem" }}>
                    {Array.from({ length: postsLength }, (_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSlideIndex(index)}
                        aria-label={`スライド ${index + 1}`}
                        style={{
                          width: "0.45rem",
                          height: "0.45rem",
                          borderRadius: "9999px",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          background:
                            index === currentIndex
                              ? "var(--c-deep-ocean)"
                              : "rgba(10, 46, 78, 0.2)",
                        }}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSlideIndex((index) => (index + 1) % postsLength)
                    }
                    aria-label="次の投稿"
                    style={{
                      width: "2rem",
                      height: "2rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "9999px",
                      border: "none",
                      background: "rgba(10, 46, 78, 0.06)",
                      color: "var(--c-deep-ocean)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <ChevronRightIcon />
                  </button>
                </div>
              )}
            </article>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: isMobile ? "92vw" : "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "0.25rem",
          marginLeft: isMobile ? "var(--space-3)" : "1.5rem",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            style={{
              padding:
                isMobile
                  ? "0.35rem clamp(1rem, 5vw, 1.25rem)"
                  : "clamp(0.35rem, 1dvh, 0.5rem) clamp(1rem, 2vw, 1.5rem)",
              minHeight: isMobile ? "44px" : undefined,
              borderRadius: "var(--radius-md) var(--radius-md) 0 0",
              background:
                activeTab === tab.key
                  ? "rgba(255, 255, 255, 0.95)"
                  : "rgba(255, 255, 255, 0.7)",
              fontWeight: activeTab === tab.key ? 700 : 500,
              fontSize: isMobile
                ? "clamp(0.875rem, 1.8dvh, 0.95rem)"
                : "clamp(0.85rem, 1.8dvh, 0.95rem)",
              color: "var(--c-deep-ocean)",
              border: "none",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(8px)",
          borderRadius: "var(--radius-lg)",
          padding: isMobile
            ? "clamp(var(--space-3), 2dvh, var(--space-4))"
            : "clamp(var(--space-4), 2.5dvh, var(--space-6))",
          boxShadow: "var(--shadow-md)",
          minHeight: isMobile
            ? "clamp(7.5rem, 19dvh, 9rem)"
            : "clamp(10rem, 22dvh, 13rem)",
        }}
      >
        {info ? (
          <div
            style={{
              display: "flex",
              gap: isMobile
                ? 0
                : "clamp(var(--space-4), 2vw, var(--space-6))",
            }}
          >
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontSize: "clamp(1rem, 2.2dvh, 1.15rem)",
                  fontWeight: 700,
                  color: "var(--c-deep-ocean)",
                  marginBottom:
                    "clamp(var(--space-1), 1dvh, var(--space-2))",
                }}
              >
                {info.title}
              </h3>
              {info.catchCopy && (
                <p
                  style={{
                    fontSize: "clamp(0.82rem, 1.8dvh, 0.9rem)",
                    color: "var(--c-text-secondary)",
                    lineHeight: 1.55,
                    marginBottom:
                      "clamp(var(--space-2), 2dvh, var(--space-4))",
                    ...(isMobile
                      ? {
                          fontSize: "clamp(0.875rem, 1.8dvh, 0.9rem)",
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical" as const,
                          WebkitLineClamp: 1,
                          overflow: "hidden",
                        }
                      : {}),
                  }}
                >
                  {info.catchCopy}
                </p>
              )}
              <Link
                href={info.href}
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "var(--c-deep-ocean)",
                }}
              >
                詳細を見る →
              </Link>
            </div>

            <div
              style={{
                width: "clamp(9rem, 13.5vw, 12rem)",
                height: "clamp(6rem, 15dvh, 8rem)",
                position: "relative",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                background: "#E5E5E5",
                flexShrink: 0,
                ...(isMobile ? { display: "none" } : {}),
              }}
            >
              {info.imageUrl && (
                <Image
                  src={info.imageUrl}
                  alt={info.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              )}
            </div>
          </div>
        ) : (
          <p style={{ color: "var(--c-text-secondary)" }}>
            このエリアには該当する情報がありません。
          </p>
        )}

        {postsLength > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--space-4)",
              marginTop: isMobile
                ? "clamp(var(--space-1), 1dvh, var(--space-2))"
                : "clamp(var(--space-2), 1.5dvh, var(--space-4))",
              paddingTop: isMobile
                ? "clamp(var(--space-1), 1dvh, var(--space-2))"
                : "clamp(var(--space-2), 1.5dvh, var(--space-4))",
              borderTop: "1px solid rgba(10, 46, 78, 0.08)",
            }}
          >
            <button
              type="button"
              onClick={() =>
                setSlideIndex((index) => (index - 1 + postsLength) % postsLength)
              }
              aria-label="前の投稿"
              style={{
                width: "clamp(2rem, 4dvh, 2.25rem)",
                height: "clamp(2rem, 4dvh, 2.25rem)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "9999px",
                border: "none",
                background: "rgba(10, 46, 78, 0.06)",
                color: "var(--c-deep-ocean)",
                cursor: "pointer",
                padding: 0,
                transition: "background 150ms ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = "rgba(10, 46, 78, 0.14)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = "rgba(10, 46, 78, 0.06)";
              }}
            >
              <ChevronLeftIcon />
            </button>

            <div style={{ display: "flex", gap: "0.4rem" }}>
              {Array.from({ length: postsLength }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSlideIndex(index)}
                  aria-label={`スライド ${index + 1}`}
                  style={{
                    width: "0.5rem",
                    height: "0.5rem",
                    borderRadius: "9999px",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    background:
                      index === currentIndex
                        ? "var(--c-deep-ocean)"
                        : "rgba(10, 46, 78, 0.2)",
                    transition: "background 150ms ease",
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSlideIndex((index) => (index + 1) % postsLength)}
              aria-label="次の投稿"
              style={{
                width: "clamp(2rem, 4dvh, 2.25rem)",
                height: "clamp(2rem, 4dvh, 2.25rem)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "9999px",
                border: "none",
                background: "rgba(10, 46, 78, 0.06)",
                color: "var(--c-deep-ocean)",
                cursor: "pointer",
                padding: 0,
                transition: "background 150ms ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = "rgba(10, 46, 78, 0.14)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = "rgba(10, 46, 78, 0.06)";
              }}
            >
              <ChevronRightIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
