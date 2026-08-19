"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type TransitionPhase = "idle" | "covering" | "revealing";

const TRANSITION_COPY = [
  { prefix: "/message", eyebrow: "Message", title: "島で働く、その前に。" },
  { prefix: "/voices", eyebrow: "Voices", title: "ここに来た人たちの、声。" },
  { prefix: "/jobs", eyebrow: "Jobs", title: "あなたの行き先を、ここから。" },
  { prefix: "/spots", eyebrow: "Spots", title: "島を知ることは、暮らしを知ること。" },
  { prefix: "/events", eyebrow: "Events", title: "今、この島で起きていること。" },
  { prefix: "/columns", eyebrow: "Column", title: "島から、声をのせて。" },
  { prefix: "/contact", eyebrow: "Contact", title: "気になることを、話すところから。" },
  { prefix: "/privacy", eyebrow: "Privacy", title: "大切な情報について。" },
  { prefix: "/terms", eyebrow: "Terms", title: "このサイトを使う前に。" },
] as const;

const DEFAULT_COPY = {
  eyebrow: "Rishirecruit",
  title: "利尻富士町の仕事と暮らしへ。",
};

function copyForPath(pathname: string) {
  return (
    TRANSITION_COPY.find(
      ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    ) ?? DEFAULT_COPY
  );
}

export function PageTransition() {
  const pathname = usePathname();
  const router = useRouter();
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [copy, setCopy] = useState(DEFAULT_COPY);
  const targetPath = useRef<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const activeTimers = timers.current;

    return () => {
      activeTimers.forEach(window.clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (phase !== "covering" || pathname !== targetPath.current) return;

    setPhase("revealing");
    timers.current.push(
      window.setTimeout(() => {
        setPhase("idle");
        targetPath.current = null;
      }, 720),
    );
  }, [pathname, phase]);

  useEffect(() => {
    const handleInternalNavigation = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        phase !== "idle"
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

      const nextPath = `${destination.pathname}${destination.search}${destination.hash}`;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(nextPath);
        return;
      }

      targetPath.current = destination.pathname;
      setCopy(copyForPath(destination.pathname));
      setPhase("covering");
      timers.current.push(
        window.setTimeout(() => router.push(nextPath), 620),
      );
    };

    document.addEventListener("click", handleInternalNavigation, true);
    return () => {
      document.removeEventListener("click", handleInternalNavigation, true);
    };
  }, [phase, router]);

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
