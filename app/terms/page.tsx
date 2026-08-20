import type { Metadata } from "next";
import { FooterOfficeInfo } from "@/components/layout/FooterInfo";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "利用規約",
  description: "当サイトの利用規約について。",
  path: "/terms",
});

const TERMS_SECTIONS = [
  {
    title: "1. サービスの概要",
    body: "本文は準備中です。このサイトで提供する求人情報、イベント情報、観光情報、関連コンテンツの位置づけについて記載します。",
  },
  {
    title: "2. 利用条件",
    body: "本文は準備中です。サイトを利用する際に確認していただきたい条件や、掲載情報の扱いについて整理します。",
  },
  {
    title: "3. 禁止事項",
    body: "本文は準備中です。不正利用、第三者への迷惑行為、掲載情報の不適切な利用などについて記載します。",
  },
  {
    title: "4. 免責事項",
    body: "本文は準備中です。掲載内容の更新タイミング、外部リンク、利用により生じた損害への考え方を記載します。",
  },
];

export default function TermsPage() {
  return (
    <main className="bg-[color:var(--c-paper)]">
      <section className="pt-[calc(var(--space-6)*6)] pb-[calc(var(--space-6)*2)]">
        <div className="mx-auto max-w-[720px] px-[var(--space-6)]">
          <h1 className="text-4xl font-bold leading-tight tracking-normal text-[color:var(--c-text-primary)] md:text-6xl">
            利用規約
          </h1>
        </div>
      </section>

      <article className="mx-auto max-w-[720px] px-[var(--space-6)] pb-[calc(var(--space-6)*4)]">
        <p className="rounded-[var(--radius-md)] border border-[color:var(--c-border-subtle)] bg-[color:var(--c-snow)] p-[var(--space-4)] text-sm leading-6 text-[color:var(--c-text-secondary)]">
          このページは現在準備中です。正式な利用規約は近日公開予定です。
        </p>

        <div className="mt-[var(--space-6)] grid gap-[var(--space-5)]">
          {TERMS_SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-bold tracking-normal text-[color:var(--c-text-primary)]">
                {section.title}
              </h2>
              <p className="mt-[var(--space-3)] text-base leading-8 text-[color:var(--c-text-secondary)]">
                {section.body}
              </p>
            </section>
          ))}

          <section>
            <h2 className="text-xl font-bold tracking-normal text-[color:var(--c-text-primary)]">
              5. お問い合わせ先
            </h2>
            <FooterOfficeInfo className="mt-[var(--space-3)] text-base leading-8 text-[color:var(--c-text-secondary)]" />
          </section>
        </div>
      </article>
    </main>
  );
}
