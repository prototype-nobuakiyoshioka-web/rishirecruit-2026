type PageHeroProps = {
  title: string;
  lead: string;
  eyebrow?: string;
};

export function PageHero({ title, lead, eyebrow }: PageHeroProps) {
  return (
    <section className="pt-[calc(var(--space-6)*6)] pb-[calc(var(--space-6)*3)]">
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--space-6)]">
        {eyebrow ? (
          <p className="mb-[var(--space-4)] text-sm font-bold tracking-normal text-[color:var(--c-deep-ocean)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="max-w-5xl text-balance text-4xl font-bold leading-tight tracking-normal text-[color:var(--c-text-primary)] md:text-6xl">
          {title}
        </h1>
        <p className="mt-[var(--space-5)] max-w-2xl text-balance text-base font-medium leading-8 tracking-normal text-[color:var(--c-text-secondary)] md:text-lg">
          {lead}
        </p>
      </div>
    </section>
  );
}
