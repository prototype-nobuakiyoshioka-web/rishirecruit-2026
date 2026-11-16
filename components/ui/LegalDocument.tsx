import type { ReactNode } from "react";
import { FooterOfficeInfo } from "@/components/layout/FooterInfo";

// プライバシーポリシー・利用規約など、長文の規程ページの共通の組版。
export type LegalBlock =
  | { kind: "p"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "ul"; items: (string | { label: string; text: string })[] };

export type LegalSection = { title: string; blocks: LegalBlock[] };

const BODY_TEXT = "text-base leading-8 text-[color:var(--c-text-secondary)]";
const H2_CLASS = "text-xl font-bold tracking-normal text-[color:var(--c-text-primary)]";

function LegalBlockView({ block }: { block: LegalBlock }) {
  if (block.kind === "h3") {
    return (
      <h3 className="mt-[var(--space-5)] text-base font-bold tracking-normal text-[color:var(--c-text-primary)]">
        {block.text}
      </h3>
    );
  }
  if (block.kind === "ul") {
    return (
      <ul className={`mt-[var(--space-2)] list-disc space-y-[var(--space-2)] pl-[1.25em] marker:text-[color:var(--c-deep-ocean)] ${BODY_TEXT}`}>
        {block.items.map((item) =>
          typeof item === "string" ? (
            <li key={item}>{item}</li>
          ) : (
            <li key={item.label}>
              <span className="font-bold text-[color:var(--c-text-primary)]">{item.label}</span>
              <span className="block">{item.text}</span>
            </li>
          ),
        )}
      </ul>
    );
  }
  return <p className={`mt-[var(--space-3)] ${BODY_TEXT}`}>{block.text}</p>;
}

export function LegalDocument({
  title,
  intro,
  sections,
  contactTitle,
  contactLead,
  enactedOn,
}: {
  title: ReactNode;
  intro: string;
  sections: LegalSection[];
  /** 最後の「お問い合わせ先」の章の見出し(番号つき) */
  contactTitle: string;
  contactLead: string;
  enactedOn: string;
}) {
  return (
    <main className="bg-[color:var(--c-paper)]">
      <section className="pt-[calc(var(--space-6)*6)] pb-[calc(var(--space-6)*2)]">
        <div className="mx-auto max-w-[720px] px-[var(--space-6)]">
          <h1 className="text-phrase text-4xl font-bold leading-tight tracking-normal text-[color:var(--c-text-primary)] md:text-6xl">
            {title}
          </h1>
        </div>
      </section>

      <article className="mx-auto max-w-[720px] px-[var(--space-6)] pb-[calc(var(--space-6)*4)]">
        <p className={BODY_TEXT}>{intro}</p>

        <div className="mt-[var(--space-6)] grid gap-[calc(var(--space-6)*1.5)]">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className={H2_CLASS}>{section.title}</h2>
              {section.blocks.map((block, index) => (
                <LegalBlockView key={index} block={block} />
              ))}
            </section>
          ))}

          <section>
            <h2 className={H2_CLASS}>{contactTitle}</h2>
            <p className={`mt-[var(--space-3)] ${BODY_TEXT}`}>{contactLead}</p>
            <FooterOfficeInfo className={`mt-[var(--space-3)] ${BODY_TEXT}`} />
          </section>
        </div>

        <p className="mt-[calc(var(--space-6)*2)] border-t border-[color:var(--c-border-subtle)] pt-[var(--space-4)] text-sm leading-6 text-[color:var(--c-text-secondary)]">
          制定日：{enactedOn}
        </p>
      </article>
    </main>
  );
}
