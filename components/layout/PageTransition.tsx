"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_COPY, copyForPath, crossesSection } from "@/lib/utils/page-section";

type TransitionPhase = "idle" | "covering" | "revealing";

// 時間は globals.css の .page-transition--* / [data-page-nav] と合わせる
/** 押してから幕を上げ始めるまでの最短。幕が下りきる(480ms)→ 一文が読める時間を確保する */
const MIN_COVER_MS = 880;
/** 幕が上がりきるまで。上がり始めた時点で下のページは操作できる */
const REVEAL_MS = 600;
/** 同じセクションの中の移動で、新しいページがふわっと出る時間 */
const FADE_IN_MS = 220;
/** 着いたことが分からなくても、この時間で必ず元に戻す(移動の失敗など) */
const SAFETY_MS = 8000;
/** URL が変わったかを見る間隔 */
const POLL_MS = 50;

/** <html data-page-nav>。CSS がこれを見て body > main を薄くする・隠す・フェードで出す */
function setNavState(state: "fade-out" | "fade-in" | "cover" | null) {
  const root = document.documentElement;
  if (state) {
    root.dataset.pageNav = state;
  } else {
    delete root.dataset.pageNav;
  }
}

type PendingNavigation = {
  kind: "cover" | "fade";
  fromHref: string;
  startedAt: number;
};

/**
 * ページ移動の演出。押したらすぐ router.push し、演出は読み込みの待ち時間に重ねる。
 * - セクションが変わる移動:幕を下ろし、「着いた」かつ「一文の最短表示が過ぎた」で上げる
 * - 同じセクションの中の移動:前のページを少し薄くし、着いたらフェードで出す
 * 「着いた」は URL の変化で判断する(末尾の /・転送・404・戻るなど、予定とずれても上がる)。
 */
export function PageTransition() {
  const router = useRouter();
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [copy, setCopy] = useState(DEFAULT_COPY);
  const pending = useRef<PendingNavigation | null>(null);

  useEffect(() => {
    let timers: number[] = [];
    let poller: number | null = null;

    const clearTimers = () => {
      timers.forEach(window.clearTimeout);
      timers = [];
      if (poller !== null) {
        window.clearInterval(poller);
        poller = null;
      }
    };

    const later = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(fn, ms));
    };

    const reveal = () => {
      setNavState(null);
      setPhase("revealing");
      later(() => setPhase("idle"), REVEAL_MS);
    };

    const finish = (nav: PendingNavigation, arrived: boolean) => {
      if (pending.current !== nav) return;
      pending.current = null;
      clearTimers();

      if (nav.kind === "fade") {
        if (!arrived) {
          setNavState(null);
          return;
        }
        setNavState("fade-in");
        later(() => setNavState(null), FADE_IN_MS);
        return;
      }

      later(reveal, Math.max(0, nav.startedAt + MIN_COVER_MS - performance.now()));
    };

    const watchArrival = (nav: PendingNavigation) => {
      clearTimers();
      pending.current = nav;
      poller = window.setInterval(() => {
        if (window.location.href !== nav.fromHref) finish(nav, true);
      }, POLL_MS);
      later(() => finish(nav, false), SAFETY_MS);
    };

    const handleInternalNavigation = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        // 幕が出ている間は何もしない(幕が押せる範囲をふさいでいる)
        pending.current?.kind === "cover"
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const destination = new URL(anchor.href, window.location.href);
      const isSameDocument =
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search;

      if (
        destination.origin !== window.location.origin ||
        isSameDocument ||
        destination.protocol !== "http:" && destination.protocol !== "https:"
      ) {
        return;
      }

      event.preventDefault();

      const fromHref = window.location.href;
      const isCrossing = crossesSection(window.location.pathname, destination.pathname);
      router.push(`${destination.pathname}${destination.search}${destination.hash}`);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      if (isCrossing) {
        setCopy(copyForPath(destination.pathname));
        setPhase("covering");
        setNavState("cover");
      } else {
        setNavState("fade-out");
      }
      watchArrival({
        kind: isCrossing ? "cover" : "fade",
        fromHref,
        startedAt: performance.now(),
      });
    };

    document.addEventListener("click", handleInternalNavigation, true);
    return () => {
      document.removeEventListener("click", handleInternalNavigation, true);
      clearTimers();
      pending.current = null;
      setNavState(null);
    };
  }, [router]);

  return (
    <div
      aria-hidden="true"
      className={`page-transition page-transition--${phase}`}
    >
      <div className="page-transition__texture" />
      <div className="page-transition__message">
        <p>{copy.eyebrow}</p>
        <p>{copy.title}</p>
      </div>
    </div>
  );
}
