import Image from "next/image";
import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

type EditorialDetailShellProps = {
  breadcrumbs: Array<{ label: string; href?: string }>;
  eyebrow: string;
  meta?: string | null;
  title: string;
  lead?: string | null;
  image: { sourceUrl: string; altText: string };
  children: ReactNode;
};

export function EditorialDetailShell({ breadcrumbs, eyebrow, meta, title, lead, image, children }: EditorialDetailShellProps) {
  return (
    <main className="overflow-hidden bg-[#1a8fa8]">
      <section className="relative pb-32 pt-36 md:pb-44 md:pt-40" style={{ background: "radial-gradient(circle at 78% 18%, rgba(201, 226, 240, 0.78), transparent 27%), linear-gradient(160deg, #5BB4E0 0%, #37A9C7 55%, #1A8FA8 100%)" }}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-repeat opacity-[0.14] mix-blend-multiply" style={{ backgroundImage: "url('/images/message/bg-textre.webp')" }} />
        <div className="relative mx-auto max-w-[var(--container-max)] px-[var(--space-6)]">
          <Breadcrumbs items={breadcrumbs} />
          <div className="mt-12 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-20">
            <div><p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--c-warning)]">{eyebrow}</p>{meta ? <p className="mt-5 text-sm font-bold text-[color:var(--c-deep-ocean)]/70">{meta}</p> : null}<h1 className="mt-5 text-balance text-4xl font-black leading-tight tracking-[-0.03em] text-[color:var(--c-deep-ocean)] md:text-6xl">{title}</h1>{lead ? <p className="mt-6 max-w-2xl text-base font-bold leading-8 text-[color:var(--c-deep-ocean)]/75 md:text-lg">{lead}</p> : null}</div>
            <Image src={image.sourceUrl} alt={image.altText || `${title}の写真`} width={1200} height={900} priority className="aspect-[4/3] w-full rounded-[var(--radius-2xl)] object-cover" />
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
  return <dl className="border-t border-[color:var(--c-deep-ocean)]/15">{items.filter((item)=>item.value !== null && item.value !== undefined && item.value !== "").map((item)=><div key={item.label} className="grid grid-cols-[7rem_1fr] gap-5 border-b border-[color:var(--c-deep-ocean)]/15 py-5 text-sm md:grid-cols-[10rem_1fr] md:text-base"><dt className="font-bold text-[color:var(--c-text-secondary)]">{item.label}</dt><dd className="font-bold leading-7 text-[color:var(--c-text-primary)]">{item.value}</dd></div>)}</dl>;
}
