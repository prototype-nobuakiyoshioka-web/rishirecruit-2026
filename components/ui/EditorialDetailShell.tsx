import Image from "next/image";
import { Fragment, type ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

// 文字列値に含まれる <br /> や \n を実際の改行 (<br />) として描画する。
// ACF textarea (new_lines: 'br') は保存時 \n → 出力時 <br /> に変換されるため、
// そのままだと `<br />` が文字列として表示されてしまう問題を吸収する。
function renderMultiline(value: ReactNode): ReactNode {
  if (typeof value !== "string") return value;
  const segments = value.split(/<br\s*\/?>|\n/gi).filter(Boolean);
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
  // 画像が無い場合は null を渡すと画像領域を出さない（求人詳細で画像未設定時など）
  image: { sourceUrl: string; altText: string } | null;
  children: ReactNode;
};

export function EditorialDetailShell({ breadcrumbs, eyebrow, meta, title, lead, image, children }: EditorialDetailShellProps) {
  return (
    <main className="overflow-hidden bg-[#1a8fa8]">
      <section className="relative pb-32 pt-36 md:pb-44 md:pt-40" style={{ background: "radial-gradient(circle at 78% 18%, rgba(201, 226, 240, 0.78), transparent 27%), linear-gradient(160deg, #5BB4E0 0%, #37A9C7 55%, #1A8FA8 100%)" }}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-repeat opacity-[0.14] mix-blend-multiply" style={{ backgroundImage: "url('/images/message/bg-textre.webp')" }} />
        <div className="relative mx-auto max-w-[var(--container-max)] px-[var(--space-6)]">
          <Breadcrumbs items={breadcrumbs} />
          {/* lg 以上ではタイトルが画像上に重ねて表示される（不自然な改行防止）。
              画像は絶対配置で背面に置き、テキストは背景色と同色の text-stroke で視認性を確保する。 */}
          <div className="relative mt-12">
            <div className={`relative z-10 lg:flex ${image ? "lg:min-h-[440px]" : ""} lg:flex-col lg:justify-end lg:pr-0`}>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--c-warning)]">{eyebrow}</p>
              {meta ? <p className="mt-5 text-sm font-bold text-[color:var(--c-deep-ocean)]/70">{meta}</p> : null}
              <h1
                className="mt-5 text-balance text-4xl font-black leading-tight tracking-[-0.03em] text-[color:var(--c-deep-ocean)] md:text-6xl"
                style={{ WebkitTextStroke: "6px #2CA0BB", paintOrder: "stroke fill" }}
              >{title}</h1>
              {lead ? <p className="mt-6 max-w-2xl text-base font-bold leading-8 text-[color:var(--c-deep-ocean)]/75 md:text-lg">{lead}</p> : null}
            </div>
            {image ? (
              <div className="mt-10 lg:absolute lg:right-0 lg:top-1/2 lg:z-0 lg:mt-0 lg:w-[52%] lg:-translate-y-1/2">
                <Image src={image.sourceUrl} alt={image.altText || `${title}の写真`} width={1200} height={900} priority className="aspect-[4/3] w-full rounded-[var(--radius-2xl)] object-cover" />
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

export function EditorialDetailSection({ eyebrow, label, children }: { eyebrow: string; label: string; children: ReactNode }) {
  return <section className="relative mx-auto grid max-w-[1080px] gap-10 border-t border-[color:var(--c-deep-ocean)]/15 px-[var(--space-6)] py-16 first:border-t-0 md:grid-cols-[13rem_1fr] md:gap-20 md:py-24"><div><p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--c-warning)]">{eyebrow}</p><p className="mt-2 text-sm font-bold text-[color:var(--c-text-secondary)]">{label}</p></div><div>{children}</div></section>;
}

export function EditorialFieldList({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return <dl className="border-t border-[color:var(--c-deep-ocean)]/15">{items.filter((item)=>item.value !== null && item.value !== undefined && item.value !== "").map((item)=><div key={item.label} className="grid grid-cols-[7rem_1fr] gap-5 border-b border-[color:var(--c-deep-ocean)]/15 py-5 text-sm md:grid-cols-[10rem_1fr] md:text-base"><dt className="font-bold text-[color:var(--c-text-secondary)]">{item.label}</dt><dd className="font-bold leading-7 text-[color:var(--c-text-primary)]">{renderMultiline(item.value)}</dd></div>)}</dl>;
}
