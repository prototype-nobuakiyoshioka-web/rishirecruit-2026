import type { Metadata } from "next";
import { FooterOfficeInfo } from "@/components/layout/FooterInfo";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "プライバシーポリシー",
  description: "当サイトにおける個人情報の取り扱いについて。",
  path: "/privacy",
});

const PRIVACY_SECTIONS = [
  {
    title: "1. 個人情報の収集について",
    body: "本文は準備中です。応募フォーム・お問い合わせフォームで取得する情報の範囲について記載します。",
  },
  {
    title: "2. 個人情報の利用目的",
    body: "本文は準備中です。求人応募への対応、お問い合わせへの返信、サイト運営上必要な確認のために利用する内容を整理します。",
  },
  {
    title: "3. 個人情報の第三者提供",
    body: "本文は準備中です。法令に基づく場合を除き、本人の同意なく第三者へ提供しない方針を記載します。",
  },
  {
    title: "4. 個人情報の管理",
    body: "本文は準備中です。取得した情報の保管、アクセス管理、不要になった情報の取り扱いについて記載します。",
  },
];

export default function PrivacyPage() {
  return (
    <main className="bg-[color:var(--c-paper)]">
      <section className="pt-[calc(var(--space-6)*6)] pb-[calc(var(--space-6)*2)]">
        <div className="mx-auto max-w-[720px] px-[var(--space-6)]">
          <h1 className="text-4xl font-bold leading-tight tracking-normal text-[color:var(--c-text-primary)] md:text-6xl">
            プライバシーポリシー
          </h1>
        </div>
      </section>

      <article className="mx-auto max-w-[720px] px-[var(--space-6)] pb-[calc(var(--space-6)*4)]">
        <p className="rounded-[var(--radius-md)] border border-[color:var(--c-border-subtle)] bg-[color:var(--c-snow)] p-[var(--space-4)] text-sm leading-6 text-[color:var(--c-text-secondary)]">
          このページは現在準備中です。正式なプライバシーポリシーは近日公開予定です。
        </p>

        <div className="mt-[var(--space-6)] grid gap-[var(--space-5)]">
          {PRIVACY_SECTIONS.map((section) => (
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
