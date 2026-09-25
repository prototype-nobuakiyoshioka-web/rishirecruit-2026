"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";

export function StickyApplyCta() {
  // 応募フォームが画面内に入ったら sticky CTA を消す（単一 primary 原則）。
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    const form = document.getElementById("apply-form");
    if (!form) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsFormVisible(entry.isIntersecting),
      {
        // フォーム上端が視野に少し入っただけで CTA を退場させる。
        rootMargin: "0px 0px -30% 0px",
        threshold: 0,
      },
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  function handleClick() {
    // 応募CTAのクリックをGA4へ送信(応募フォーム到達の先行指標)。
    trackEvent("apply_cta_click", { location: "sticky" });
    document.getElementById("apply-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  // 位置指定は外側ラッパーに持たせ、Button 側の押し込みアニメ(translate)と競合させない
  return (
    <div
      aria-hidden={isFormVisible}
      className="fixed bottom-[var(--space-4)] right-[var(--space-4)] z-40 w-40 transition-opacity duration-300 md:bottom-[var(--space-6)] md:right-[var(--space-6)]"
      style={{
        opacity: isFormVisible ? 0 : 1,
        pointerEvents: isFormVisible ? "none" : "auto",
      }}
    >
      <Button
        type="button"
        onClick={handleClick}
        aria-label="応募フォームへ移動"
        fullWidth
        className="md:min-h-16"
        tabIndex={isFormVisible ? -1 : 0}
      >
        応募する
      </Button>
    </div>
  );
}
