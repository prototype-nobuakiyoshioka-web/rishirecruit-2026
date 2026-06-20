import Link from "next/link";
import { CardGrid } from "@/components/ui/CardGrid";
import { PageHero } from "@/components/ui/PageHero";

type DummyColumn = {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  url: string;
};

const DUMMY_COLUMNS: DummyColumn[] = [
  {
    id: "column-1",
    title: "港から始まる一日",
    excerpt: "朝の鴛泊港で見える景色と、出勤前の小さな時間について。",
    publishedAt: "2026-06-01",
    url: "https://note.com/",
  },
  {
    id: "column-2",
    title: "冬の買いもの、夏の寄り道",
    excerpt: "季節で変わる島の動き方を、暮らしの目線で書きました。",
    publishedAt: "2026-05-18",
    url: "https://note.com/",
  },
  {
    id: "column-3",
    title: "役場の窓口から見える町",
    excerpt: "仕事を通して少しずつ知っていく、町の顔と日々のこと。",
    publishedAt: "2026-05-04",
    url: "https://note.com/",
  },
];

const DATE_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function ColumnsPage() {
  return (
    <main className="bg-[color:var(--c-paper)]">
      <PageHero
        eyebrow="Columns"
        title="島から、声をのせて。"
        lead="Noteで連載中の島ぐらしコラム。"
      />
      <section className="mx-auto max-w-[var(--container-max)] px-[var(--space-6)] pb-[calc(var(--space-6)*4)]">
        <CardGrid>
          {DUMMY_COLUMNS.map((column) => (
            <article
              key={column.id}
              className="rounded-[var(--radius-lg)] border border-[color:var(--c-border-subtle)] bg-[color:var(--c-snow)] p-[var(--space-6)] shadow-[var(--shadow-md)]"
            >
              <p className="text-sm font-bold text-[color:var(--c-text-secondary)]">
                {DATE_FORMATTER.format(new Date(column.publishedAt))}
              </p>
              <h2 className="mt-[var(--space-4)] text-xl font-bold tracking-normal text-[color:var(--c-text-primary)]">
                {column.title}
              </h2>
              <p className="mt-[var(--space-3)] text-sm leading-6 text-[color:var(--c-text-secondary)]">
                {column.excerpt}
              </p>
              <a
                href={column.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-[var(--space-6)] inline-flex min-h-11 items-center font-bold text-[color:var(--c-deep-ocean)] hover:underline"
              >
                Noteで読む →
              </a>
            </article>
          ))}
        </CardGrid>
        <div className="mt-[calc(var(--space-6)*2)]">
          <Link
            href="/jobs"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-full)] bg-[color:var(--c-deep-ocean)] px-[var(--space-6)] font-bold text-[color:var(--c-text-inverse)]"
          >
            求人を見る →
          </Link>
        </div>
      </section>
    </main>
  );
}

