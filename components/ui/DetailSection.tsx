import type { ReactNode } from "react";

export function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[color:var(--c-border-subtle)] bg-[color:var(--c-snow)] p-[var(--space-6)] shadow-[var(--shadow-md)]">
      <h2 className="text-2xl font-bold tracking-normal text-[color:var(--c-text-primary)]">
        {title}
      </h2>
      <div className="mt-[var(--space-5)]">{children}</div>
    </section>
  );
}

export function FieldList({
  items,
}: {
  items: Array<{ label: string; value: ReactNode }>;
}) {
  return (
    <dl className="grid gap-[var(--space-4)]">
      {items.map((item) => (
        <div
          key={item.label}
          className="grid gap-[var(--space-1)] border-b border-[color:var(--c-border-subtle)] pb-[var(--space-4)] last:border-b-0 last:pb-0 md:grid-cols-[12rem_1fr]"
        >
          <dt className="text-sm font-bold text-[color:var(--c-text-secondary)]">
            {item.label}
          </dt>
          <dd className="text-base leading-7 text-[color:var(--c-text-primary)]">
            {item.value || "未設定"}
          </dd>
        </div>
      ))}
    </dl>
  );
}
