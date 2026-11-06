import Image from "next/image";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { IslandLocator } from "@/components/map/IslandLocator";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PhraseText } from "@/components/ui/PhraseText";
import type { IslandLocation } from "@/lib/map/island-locator";
import { longestPhraseLength } from "@/lib/text/phrases";

// 文字列値に含まれる <br /> や \n を実際の改行 (<br />) として描画する。
// ACF textarea (new_lines: 'br') は保存時 \n → 出力時 <br /> に変換されるため、
// そのままだと `<br />` が文字列として表示されてしまう問題を吸収する。
function renderMultiline(value: ReactNode): ReactNode {
  if (typeof value !== "string") return value;
  // 連続する <br /> / \n / 空白 を1つの改行として扱う。
  // 例: "A<br />\nB" や "A<br /><br />B" も1つの<br />で描画。
  const segments = value
    .split(/(?:\s*<br\s*\/?>\s*|\n)+/gi)
    .map((s) => s.trim())
    .filter(Boolean);
  if (segments.length <= 1) return value;
  return segments.map((seg, i) => (
    <Fragment key={i}>{i > 0 && <br />}{seg}</Fragment>
  ));
}

type EditorialDetailShellProps = {
  breadcrumbs: Array<{ label: string; href?: string }>;
  eyebrow: string;
  meta?: string | null;
  title: string;
  lead?: string | null;
  // 島の地図(求人・観光地・イベントの詳細)。位置もエリアもないときは null で、地図ごと出さない
  location?: IslandLocation | null;
  // 画像が無い場合は null を渡すと画像領域を出さない（求人詳細で画像未設定時など）
  image: { sourceUrl: string; altText: string; width?: number | null; height?: number | null } | null;
  children: ReactNode;
};

export function EditorialDetailShell({ breadcrumbs, eyebrow, meta, title, lead, location, image, children }: EditorialDetailShellProps) {
  return (
    <main className="overflow-hidden bg-[#1a8fa8]">
      <section className="relative pb-32 pt-36 md:pb-44 md:pt-40" style={{ background: "radial-gradient(circle at 78% 18%, rgba(201, 226, 240, 0.78), transparent 27%), linear-gradient(160deg, #5BB4E0 0%, #37A9C7 55%, #1A8FA8 100%)" }}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-repeat opacity-[0.14] mix-blend-multiply" style={{ backgroundImage: "url('/images/message/bg-textre.webp')" }} />
        <div className="relative mx-auto max-w-[var(--container-max)] px-[var(--space-6)]">
          <Breadcrumbs items={breadcrumbs} />
          {/* lg 以上は文字と写真を左右に分け、重ねない(見出しが人物や画像内の文字を横切らないように)。
              重ねないので、見出しの縁取り(text-stroke)も付けない。 */}
          <div className={`relative mt-12 ${image ? "lg:grid lg:grid-cols-[minmax(0,1fr)_52%] lg:items-end lg:gap-12" : ""}`}>
            <div className="relative">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--c-deep-ocean)]">{eyebrow}</p>
              {meta ? <p className="mt-5 text-sm font-bold text-[color:var(--c-deep-ocean)]/70">{meta}</p> : null}
              <h1 style={{ "--phrase-max": longestPhraseLength([title]) } as CSSProperties} className="text-phrase text-phrase-fit mt-5 text-balance font-black leading-tight tracking-[-0.03em] text-[color:var(--c-deep-ocean)] md:text-6xl lg:text-5xl">
                <PhraseText text={title} />
              </h1>
              {lead ? <p className="mt-6 max-w-2xl text-base font-bold leading-8 text-[color:var(--c-deep-ocean)]/75 md:text-lg">{lead}</p> : null}
              {location ? <IslandLocator location={location} /> : null}
            </div>
            {image ? (
              <div className="mt-10 lg:mt-0">
                {/* 寸法が分かる画像は切り抜かずに全体を見せる(求人の画像には文字が入っている) */}
                {image.width && image.height ? (
                  <Image src={image.sourceUrl} alt={image.altText || `${title}の写真`} width={image.width} height={image.height} priority sizes="(min-width: 1024px) 52vw, 100vw" className="h-auto w-full rounded-[var(--radius-2xl)]" />
                ) : (
                  <Image src={image.sourceUrl} alt={image.altText || `${title}の写真`} width={1200} height={900} priority sizes="(min-width: 1024px) 52vw, 100vw" className="aspect-[4/3] w-full rounded-[var(--radius-2xl)] object-cover" />
                )}
              </div>
            ) : null}
          </div>
        </div>
      </section>
      <article className="relative z-10 mx-auto -mt-16 max-w-[1320px] overflow-hidden rounded-t-[2.5rem] bg-[color:var(--c-paper)] md:-mt-24 md:rounded-t-[4rem]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-repeat opacity-[0.035]" style={{ backgroundImage: "url('/images/message/bg-textre.webp')" }} />
        {children}
      </article>
    </main>
  );
}

/**
 * 詳細ページのセクション。英字の小見出しは付けず(英字はページ冒頭の1か所だけ)、日本語の見出しを h2 にする。
 * PC では見出しを sticky にし、長いセクションを読んでいる間も今どこかが左に見え続けるようにする
 */
export function EditorialDetailSection({ label, children }: { label: string; children: ReactNode }) {
  return <section className="relative mx-auto grid max-w-[1080px] gap-10 border-t border-[color:var(--c-deep-ocean)]/15 px-[var(--space-6)] py-16 first:border-t-0 md:grid-cols-[13rem_1fr] md:gap-20 md:py-24"><div className="md:sticky md:top-28 md:self-start"><SectionHeading>{label}</SectionHeading></div><div>{children}</div></section>;
}

/** セクションの見出し(紺・極太、SP 22px / PC 26px)。詳細ページのセクションと、同じ形の見出しを持つページで使う */
export function SectionHeading({ children }: { children: ReactNode }) {
  return <h2 className="text-balance text-[1.375rem] font-black leading-[1.4] tracking-[-0.01em] text-[color:var(--c-deep-ocean)] md:text-[1.625rem]">{children}</h2>;
}

// 値が"実質空"か判定(null/undefined/空文字/空白のみの文字列 → 空扱い)。
function isEmptyValue(value: ReactNode): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  return false;
}

// items の中に描画可能な値が1つでもあるか(セクション非表示判定用)。
export function hasAnyValue(items: Array<{ value: ReactNode }>): boolean {
  return items.some((item) => !isEmptyValue(item.value));
}

export function EditorialFieldList({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return <dl className="border-t border-[color:var(--c-deep-ocean)]/15">{items.filter((item)=>!isEmptyValue(item.value)).map((item)=><div key={item.label} className="grid grid-cols-[7rem_1fr] gap-5 border-b border-[color:var(--c-deep-ocean)]/15 py-5 text-sm md:grid-cols-[10rem_1fr] md:text-base"><dt className="font-bold text-[color:var(--c-text-secondary)]">{item.label}</dt><dd className="font-bold leading-7 text-[color:var(--c-text-primary)]">{renderMultiline(item.value)}</dd></div>)}</dl>;
}
