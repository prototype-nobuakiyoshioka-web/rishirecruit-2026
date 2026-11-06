import type { ReactNode } from "react";

type EditorialIndexShellProps = {
  eyebrow: string;
  title: ReactNode;
  lead: ReactNode;
  introLabel: string;
  introTitle: ReactNode;
  introBody: string;
  children: ReactNode;
};

export function EditorialIndexShell({
  eyebrow,
  title,
  lead,
  introLabel,
  introTitle,
  introBody,
  children,
}: EditorialIndexShellProps) {
  return (
    <main className="overflow-hidden bg-[#1a8fa8]">
      <section
        className="relative pb-32 pt-40 md:pb-44 md:pt-48"
        style={{
          background:
            "radial-gradient(circle at 78% 18%, rgba(201, 226, 240, 0.78), transparent 27%), linear-gradient(160deg, #5BB4E0 0%, #37A9C7 55%, #1A8FA8 100%)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-repeat opacity-[0.14] mix-blend-multiply"
          style={{ backgroundImage: "url('/images/message/bg-textre.webp')" }}
        />
        <div className="relative mx-auto max-w-[var(--container-max)] px-[var(--space-6)]">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--c-deep-ocean)] md:text-base">
            {eyebrow}
          </p>
          <h1 className="text-phrase mt-5 max-w-5xl text-balance text-4xl font-black leading-[1.14] tracking-[-0.035em] text-[color:var(--c-deep-ocean)] md:text-7xl md:leading-[1.12]">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base font-bold leading-8 text-[color:var(--c-deep-ocean)]/80 md:text-xl md:leading-9">
            {lead}
          </p>
        </div>
      </section>

      <article className="relative z-10 mx-auto -mt-16 max-w-[1320px] overflow-hidden rounded-t-[2.5rem] bg-[color:var(--c-paper)] md:-mt-24 md:rounded-t-[4rem]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-repeat opacity-[0.035]"
          style={{ backgroundImage: "url('/images/message/bg-textre.webp')" }}
        />
        <EditorialIntro label={introLabel} title={introTitle}>
          <p>{introBody}</p>
        </EditorialIntro>
        {children}
      </article>
    </main>
  );
}

/**
 * 一覧ページなどの導入(左に短い見出し、右に大きな見出しと本文)。
 * 英字の小見出しは付けない。左の見出しは右の大見出し(h2)より小さくし、主従を保つ
 */
export function EditorialIntro({ label, title, children }: { label: string; title: ReactNode; children: ReactNode }) {
  return (
    <header className="relative mx-auto grid max-w-[1080px] gap-10 px-[var(--space-6)] pb-20 pt-20 md:grid-cols-[13rem_1fr] md:gap-20 md:pb-28 md:pt-28">
      <div>
        <p className="text-lg font-black leading-[1.4] text-[color:var(--c-deep-ocean)] md:text-xl">{label}</p>
      </div>
      <div>
        <h2 className="text-balance text-3xl font-black leading-tight tracking-[-0.025em] text-[color:var(--c-deep-ocean)] md:text-5xl md:leading-[1.2]">
          {title}
        </h2>
        <div className="mt-8 grid max-w-3xl gap-5 text-base leading-8 text-[color:var(--c-text-secondary)] md:text-lg md:leading-9">
          {children}
        </div>
      </div>
    </header>
  );
}
