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

  // 位置指定は外側ラッパーに持たせ、Button 側の押し込みアニメ(translate)と競合させない。
  // スマホは右下に浮かせると給与などの本文に重なるため、画面下の全幅バー(不透明)にする。
  // バーの高さぶんの余白(下の spacer)を本文の後ろに足し、最後まで読めるようにする。
  return (
    <>
      <div
        aria-hidden={isFormVisible}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--c-border-subtle)] bg-[color:var(--c-paper)] px-[var(--space-4)] pb-[calc(var(--space-3)+5px+env(safe-area-inset-bottom))] pt-[var(--space-3)] shadow-[0_-6px_16px_-10px_rgba(10,46,78,0.25)] transition-opacity duration-300 md:inset-x-auto md:bottom-[var(--space-6)] md:right-[var(--space-6)] md:w-40 md:border-0 md:bg-transparent md:p-0 md:shadow-none"
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
      <div aria-hidden="true" className="h-[calc(var(--space-6)+48px+5px+env(safe-area-inset-bottom))] bg-[color:var(--c-paper)] md:hidden" />
    </>
  );
}
