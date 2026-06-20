import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

const SUPPORT_LINKS = [
  { label: "お問い合わせ", href: "/contact" },
  { label: "プライバシーポリシー", href: "/privacy" },
  { label: "利用規約", href: "/terms" },
];

const CONTENT_LINKS = [
  { label: "求人", href: "/jobs" },
  { label: "観光地", href: "/spots" },
  { label: "イベント", href: "/events" },
  { label: "移住者の声", href: "/voices" },
  { label: "コラム", href: "/columns" },
  { label: "町からの便り", href: "/message" },
];

const EXTERNAL_LINKS = [
  { label: "Note公式", href: "https://note.com/" },
  {
    label: "利尻富士町公式サイト",
    href: "https://town.rishirifuji.hokkaido.jp/",
  },
];

const FOOTER_STYLE: CSSProperties = {
  // ページの締めとしてHeaderの暖白・ColumnBoardの木目と明確に分けるため、core.deep-oceanを背景に使う。
  backgroundColor: "var(--c-deep-ocean)",
  color: "var(--c-text-inverse)",
  opacity: 1,
};

const FOOTER_INNER_STYLE: CSSProperties = {
  maxWidth: "var(--container-max)",
  paddingInline: "var(--space-6)",
};

const SECTION_GRID_STYLE: CSSProperties = {
  gap: "var(--space-6)",
};

const SNS_PLACEHOLDER_STYLE: CSSProperties = {
  borderColor: "rgba(250, 246, 238, 0.28)",
  borderRadius: "var(--radius-lg)",
};

function FooterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="text-sm font-bold tracking-normal text-[color:var(--c-paper)]">
        {title}
      </h3>
      <div className="mt-[var(--space-3)]">{children}</div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto" style={FOOTER_STYLE}>
      <div
        className="mx-auto py-[calc(var(--space-6)*2)]"
        style={FOOTER_INNER_STYLE}
      >
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          style={SECTION_GRID_STYLE}
        >
          <FooterSection title="サポート">
            <ul className="grid gap-[var(--space-2)]">
              {SUPPORT_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium tracking-normal text-[color:var(--c-text-inverse)]/85 transition-colors hover:text-[color:var(--c-paper)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          <FooterSection title="コンテンツ">
            <ul className="grid gap-[var(--space-2)]">
              {CONTENT_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium tracking-normal text-[color:var(--c-text-inverse)]/85 transition-colors hover:text-[color:var(--c-paper)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          <FooterSection title="外部">
            <ul className="grid gap-[var(--space-2)]">
              {EXTERNAL_LINKS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium tracking-normal text-[color:var(--c-text-inverse)]/85 transition-colors hover:text-[color:var(--c-paper)]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </FooterSection>

          <FooterSection title="SNS">
            {/* 将来ここにSNSアイコンを追加予定。現時点では仕様通り空枠のみ確保する。 */}
            <div
              aria-hidden="true"
              className="min-h-11 border border-dashed"
              style={SNS_PLACEHOLDER_STYLE}
            />
          </FooterSection>
        </div>

        <div className="mt-[calc(var(--space-6)*2)] border-t border-[rgba(250,246,238,0.22)] pt-[var(--space-4)]">
          <p className="text-sm font-medium tracking-normal text-[color:var(--c-text-inverse)]/80">
            © 2026 rishirecruit ・ 利尻富士町
          </p>
        </div>
      </div>
    </footer>
  );
}
