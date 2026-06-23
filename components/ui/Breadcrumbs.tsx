import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="パンくずリスト"
      className="text-sm font-medium text-[color:var(--c-text-secondary)]"
    >
      <ol className="flex flex-wrap gap-[var(--space-2)]">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-[var(--space-2)]">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href ? (
              <Link href={item.href} className="text-[color:var(--c-deep-ocean)] hover:underline">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

