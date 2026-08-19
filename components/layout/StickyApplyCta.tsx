"use client";

import { Button } from "@/components/ui/Button";

export function StickyApplyCta() {
  function handleClick() {
    document.getElementById("apply-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  // 位置指定は外側ラッパーに持たせ、Button 側の押し込みアニメ(translate)と競合させない
  return (
    <div className="fixed inset-x-[var(--space-4)] bottom-[var(--space-4)] z-40 md:inset-x-auto md:bottom-auto md:right-[var(--space-6)] md:top-1/2 md:w-40 md:-translate-y-1/2">
      <Button
        type="button"
        onClick={handleClick}
        aria-label="応募フォームへ移動"
        fullWidth
        className="md:min-h-16"
      >
        応募する
      </Button>
    </div>
  );
}
