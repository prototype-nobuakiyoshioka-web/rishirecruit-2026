import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

// 文言は社長の確認待ちの下書き(2026-11-06)
export const metadata: Metadata = {
  title: "ページが見つかりません",
};

// 募集が終わって消えた求人の URL などから来た人を、行き止まりにしない。
// ステータスは Next が 404 のまま返す。見た目は app/error.tsx とそろえる。
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-[var(--space-6)] bg-[color:var(--c-paper)] px-[var(--space-6)] pb-[var(--space-6)] pt-28 text-center">
      <h1 className="text-phrase text-balance text-2xl font-black leading-snug text-[color:var(--c-deep-ocean)] md:text-3xl">
        お探しのページが<wbr />見つかりませんでした
      </h1>
      <p className="max-w-xl text-base leading-8 text-[color:var(--c-text-secondary)]">
        募集が終わった求人や、移動したページの可能性があります。
        <br className="hidden sm:inline" />
        求人一覧かトップから、もう一度お探しください。
      </p>
      <div className="flex flex-wrap justify-center gap-[var(--space-4)]">
        <Button href="/jobs">求人一覧へ</Button>
        <Button href="/" variant="aqua">
          トップへ
        </Button>
      </div>
    </main>
  );
}
