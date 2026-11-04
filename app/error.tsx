"use client";

import { Button } from "@/components/ui/Button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-[var(--space-6)] bg-[color:var(--c-paper)] px-[var(--space-6)] text-center">
      <h1 className="text-2xl font-black text-[color:var(--c-deep-ocean)]">
        ページを表示できませんでした
      </h1>
      <p className="text-base leading-8 text-[color:var(--c-text-secondary)]">
        通信環境をご確認のうえ、もう一度お試しください。
      </p>
      <div className="flex flex-wrap justify-center gap-[var(--space-4)]">
        <Button type="button" onClick={reset}>
          もう一度読み込む
        </Button>
        {/* トップ自体のエラーでは同じ URL への移動で消えないので、全体を読み直す */}
        <Button type="button" variant="aqua" onClick={() => window.location.assign("/")}>
          トップへ戻る
        </Button>
      </div>
    </main>
  );
}
