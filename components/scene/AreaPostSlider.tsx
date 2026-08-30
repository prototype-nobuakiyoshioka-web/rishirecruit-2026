"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useRef,
  useState,
  type AnimationEvent,
  type ReactNode,
} from "react";
import type { AreaWithPosts } from "@/lib/wp/queries/areas";
import type { JobPosting, Touristspot, WPEvent } from "@/lib/wp/types";
import { selectFirst } from "@/lib/wp/format";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/wp/labels";
import { formatEventPeriod } from "@/lib/utils/format-date";
import { useScrollProgressStore } from "@/store/scroll-progress-store";
import { AreaInfoPanel } from "./AreaInfoPanel";

type TabType = "job" | "event" | "spot";

interface PostInfo {
  title: string;
  catchCopy: string | null;
  imageUrl: string | null;
  href: string;
  /** job タブ専用の追加メタ。他のタブでは undefined。 */
  jobMeta?: {
    employmentType: string | null;
    salary: string | null;
  };
  /** event タブ専用の追加メタ。他のタブでは undefined。 */
  eventMeta?: {
    period: string | null;
    venueName: string | null;
  };
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
  const employmentTypeSlug = selectFirst(post.jobPostingFields?.employmentType);
  const employmentTypeLabel = employmentTypeSlug
    ? EMPLOYMENT_TYPE_LABELS[employmentTypeSlug] ?? employmentTypeSlug
    : null;

  return {
    title: post.title,
    catchCopy: post.jobPostingFields?.catchCopy ?? null,
    imageUrl: post.jobPostingFields?.thumbnailImage?.node?.sourceUrl ?? null,
    href: `/jobs/${post.slug}`,
    jobMeta: {
      employmentType: employmentTypeLabel,
      salary: post.jobPostingFields?.salary ?? null,
    },
  };
}

function getEventInfo(post: WPEvent): PostInfo {
  const period = formatEventPeriod(
    post.eventFields?.dateDisplayType?.[0] ?? null,
    post.eventFields?.startDatetime ?? null,
    post.eventFields?.endDatetime ?? null,
    post.eventFields?.periodMonth?.[0] ?? null,
    post.eventFields?.periodRange?.[0] ?? null,
  );

  return {
    title: post.title,
    catchCopy: post.eventFields?.catchCopy ?? null,
    imageUrl: post.eventFields?.thumbnailImage?.node?.sourceUrl ?? null,
    href: `/events/${post.slug}`,
    eventMeta: {
      // "日程未定" は表示しない
      period: period && period !== "日程未定" ? period : null,
      venueName: post.eventFields?.venueName ?? null,
    },
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
  // ページャー操作の方向。スライド遷移時のアニメーション方向決定に使う。
  const [direction, setDirection] = useState<"next" | "prev">("next");
  // 遷移中のみセットされる直前スライドの index。遷移完了で null に戻す。
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);

  const trackAnimClass =
    direction === "prev" ? "slide-track-prev" : "slide-track-next";

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

  const getInfoAt = (index: number): PostInfo | null => {
    if (activeTab === "job") {
      const post = jobPostings[index];
      return post ? getJobInfo(post) : null;
    }
    if (activeTab === "event") {
      const post = events[index];
      return post ? getEventInfo(post) : null;
    }
    const post = touristspots[index];
    return post ? getSpotInfo(post) : null;
  };

  const info = getInfoAt(currentIndex);
  const previousInfo = previousIndex !== null ? getInfoAt(previousIndex) : null;

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSlideIndex(0);
    setPreviousIndex(null);
    setDirection("next");
  };

  // ページャーの前後/ドットジャンプに応じて previousIndex と direction をセットしてから index を更新
  const goPrev = () => {
    if (postsLength < 2) return;
    setDirection("prev");
    setPreviousIndex(currentIndex);
    setSlideIndex((index) => (index - 1 + postsLength) % postsLength);
  };
  const goNext = () => {
    if (postsLength < 2) return;
    setDirection("next");
    setPreviousIndex(currentIndex);
    setSlideIndex((index) => (index + 1) % postsLength);
  };
  const goTo = (index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? "next" : "prev");
    setPreviousIndex(currentIndex);
    setSlideIndex(index);
  };

  // トラックの animation が終わったら previousIndex を消して通常表示に戻す。
  // 子要素発の animationend は無視する。
  const handleTrackAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (
      event.animationName !== "slide-track-next" &&
      event.animationName !== "slide-track-prev"
    ) {
      return;
    }
    setPreviousIndex(null);
  };

  // モバイル1スライド分のコンテンツ
  const renderMobileSlide = (slideInfo: PostInfo | null) =>
    slideInfo ? (
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
            {slideInfo.title}
          </h3>
          {slideInfo.catchCopy && (
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
              {slideInfo.catchCopy}
            </p>
          )}
          {(() => {
            // タイトル・キャッチと詳細リンクの間に極小 chip でメタ情報を差し込む。
            // SP の card 幅は狭いので、chip は最大 2 個までを想定し、はみ出しは省略する。
            const chips: string[] = [];
            if (slideInfo.jobMeta) {
              if (slideInfo.jobMeta.employmentType) chips.push(slideInfo.jobMeta.employmentType);
              if (slideInfo.jobMeta.salary) chips.push(slideInfo.jobMeta.salary);
            }
            if (slideInfo.eventMeta) {
              if (slideInfo.eventMeta.period) chips.push(slideInfo.eventMeta.period);
              if (slideInfo.eventMeta.venueName) chips.push(slideInfo.eventMeta.venueName);
            }
            if (chips.length === 0) return null;
            return (
              <div
                style={{
                  display: "flex",
                  flexWrap: "nowrap",
                  gap: "0.35rem",
                  marginBottom: "var(--space-1)",
                  overflow: "hidden",
                }}
              >
                {chips.slice(0, 2).map((chip) => (
                  <span
                    key={chip}
                    style={{
                      display: "inline-block",
                      padding: "0.15rem 0.55rem",
                      borderRadius: "9999px",
                      background: "rgba(10, 46, 78, 0.08)",
                      color: "var(--c-deep-ocean)",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      lineHeight: 1.4,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "48%",
                    }}
                  >
                    {chip}
                  </span>
                ))}
              </div>
            );
          })()}
          <Link
            href={slideInfo.href}
            style={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "var(--c-deep-ocean)",
            }}
          >
            詳細を見る →
          </Link>
        </div>

        {slideInfo.imageUrl && (
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
            <Image
              src={slideInfo.imageUrl}
              alt={slideInfo.title}
              fill
              sizes="28vw"
              style={{ objectFit: "cover" }}
            />
          </div>
        )}
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
    );

  // PC 1スライド分のコンテンツ
  const renderDesktopSlide = (slideInfo: PostInfo | null) =>
    slideInfo ? (
      <div
        style={{
          display: "flex",
          gap: "clamp(var(--space-4), 2vw, var(--space-6))",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignSelf: "stretch",
            minHeight: "clamp(9rem, 20dvh, 12rem)",
          }}
        >
          <h3
            style={{
              fontSize: "clamp(1rem, 2.2dvh, 1.15rem)",
              fontWeight: 700,
              color: "var(--c-deep-ocean)",
              marginBottom: "clamp(var(--space-1), 1dvh, var(--space-2))",
            }}
          >
            {slideInfo.title}
          </h3>
          {slideInfo.catchCopy && (
            <p
              style={{
                fontSize: "clamp(0.82rem, 1.8dvh, 0.9rem)",
                color: "var(--c-text-secondary)",
                lineHeight: 1.55,
                marginBottom: "clamp(var(--space-2), 2dvh, var(--space-4))",
              }}
            >
              {slideInfo.catchCopy}
            </p>
          )}
          {(slideInfo.jobMeta || slideInfo.eventMeta) && (
            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "5rem 1fr",
                rowGap: "clamp(var(--space-1), 0.8dvh, var(--space-2))",
                columnGap: "var(--space-3)",
                fontSize: "clamp(0.78rem, 1.7dvh, 0.85rem)",
                marginBottom: "clamp(var(--space-2), 2dvh, var(--space-3))",
              }}
            >
              {[
                ...(slideInfo.jobMeta
                  ? [
                      { label: "雇用形態", value: slideInfo.jobMeta.employmentType },
                      { label: "給与", value: slideInfo.jobMeta.salary },
                    ]
                  : []),
                ...(slideInfo.eventMeta
                  ? [
                      { label: "開催時期", value: slideInfo.eventMeta.period },
                      { label: "会場", value: slideInfo.eventMeta.venueName },
                    ]
                  : []),
              ]
                .filter((row) => row.value)
                .map((row) => (
                  <div key={row.label} style={{ display: "contents" }}>
                    <dt
                      style={{
                        color: "var(--c-text-secondary)",
                        fontWeight: 500,
                      }}
                    >
                      {row.label}
                    </dt>
                    <dd
                      style={{
                        color: "var(--c-deep-ocean)",
                        fontWeight: 700,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.value}
                    </dd>
                  </div>
                ))}
            </dl>
          )}
          <Link
            href={slideInfo.href}
            style={{
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "var(--c-deep-ocean)",
              marginTop: "auto",
              paddingTop: "clamp(var(--space-2), 1.5dvh, var(--space-3))",
              alignSelf: "flex-start",
            }}
          >
            詳細を見る →
          </Link>
        </div>

        {slideInfo.imageUrl && (
          <div
            style={{
              width: "clamp(9rem, 13.5vw, 12rem)",
              height: "clamp(6rem, 15dvh, 8rem)",
              position: "relative",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              background: "#E5E5E5",
              flexShrink: 0,
            }}
          >
            <Image
              src={slideInfo.imageUrl}
              alt={slideInfo.title}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        )}
      </div>
    ) : (
      <p style={{ color: "var(--c-text-secondary)" }}>
        このエリアには該当する情報がありません。
      </p>
    );

  // 遷移中は 2スライドが横並びのトラックとして描画、通常時は1スライドを直接。
  const renderSlideArea = (renderSlide: (i: PostInfo | null) => ReactNode) => {
    if (previousInfo === null) return renderSlide(info);

    const first = direction === "next" ? previousInfo : info;
    const second = direction === "next" ? info : previousInfo;

    return (
      <div
        className={trackAnimClass}
        style={{
          display: "flex",
          width: "200%",
          willChange: "transform",
        }}
        onAnimationEnd={handleTrackAnimationEnd}
      >
        <div style={{ width: "50%", flexShrink: 0, minWidth: 0 }}>
          {renderSlide(first)}
        </div>
        <div style={{ width: "50%", flexShrink: 0, minWidth: 0 }}>
          {renderSlide(second)}
        </div>
      </div>
    );
  };

  if (isMobile) {
    return (
      <div
        className="area-panel-enter"
        style={{
          width: "100vw",
          height: "100%",
          willChange: "transform, opacity",
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
                    transition: "background 220ms ease",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <article
              key={activeTab}
              className="tab-content-enter"
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
                willChange: "transform, opacity",
              }}
            >
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  flex: 1,
                  minHeight: 0,
                }}
              >
                {renderSlideArea(renderMobileSlide)}
              </div>

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
                    onClick={goPrev}
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
                        onClick={() => goTo(index)}
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
                    onClick={goNext}
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
      className="area-panel-enter"
      style={{
        width: isMobile ? "92vw" : "100%",
        willChange: "transform, opacity",
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
              transition: "background 220ms ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        key={activeTab}
        className="tab-content-enter"
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
          // 方向スライドアニメが端から入ってくるのでクリップ必須
          overflow: "hidden",
          willChange: "transform, opacity",
        }}
      >
        <div style={{ position: "relative", overflow: "hidden" }}>
          {renderSlideArea(renderDesktopSlide)}
        </div>

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
              onClick={goPrev}
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
                  onClick={() => goTo(index)}
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
              onClick={goNext}
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
