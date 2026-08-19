import { Button } from "@/components/ui/Button";
import { CardGrid } from "@/components/ui/CardGrid";
import { PageHero } from "@/components/ui/PageHero";
import { fetchNoteArticles } from "@/lib/note/fetch-articles";

export const revalidate = 3600;

const DATE_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

function formatPublishedAt(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : DATE_FORMATTER.format(date);
}

export default async function ColumnsPage() {
  const articles = await fetchNoteArticles();

  return (
    <main className="bg-[color:var(--c-paper)]">
      <PageHero
        eyebrow="Columns"
        title="島から、声をのせて。"
        lead="Noteで連載中の島ぐらしコラム。"
      />
      <section className="mx-auto max-w-[var(--container-max)] px-[var(--space-6)] pb-[calc(var(--space-6)*4)]">
        <CardGrid>
          {articles.length > 0 ? (
            articles.map((article) => (
              <article
                key={article.link}
                className="rounded-[var(--radius-lg)] border border-[color:var(--c-border-subtle)] bg-[color:var(--c-snow)] p-[var(--space-6)] shadow-[var(--shadow-md)]"
              >
                {article.imageUrl && (
                  <div
                    role="img"
                    aria-label={`${article.title}のサムネイル`}
                    className="mb-[var(--space-6)] aspect-video rounded-[var(--radius-md)] bg-[color:var(--c-border-subtle)] bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${JSON.stringify(article.imageUrl)})`,
                    }}
                  />
                )}
                <p className="text-sm font-bold text-[color:var(--c-text-secondary)]">
                  {formatPublishedAt(article.publishedAt)}
                </p>
                <h2 className="mt-[var(--space-4)] text-xl font-bold tracking-normal text-[color:var(--c-text-primary)]">
                  {article.title}
                </h2>
                {article.excerpt && (
                  <p className="mt-[var(--space-3)] text-sm leading-6 text-[color:var(--c-text-secondary)]">
                    {article.excerpt}
                  </p>
                )}
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-[var(--space-6)] inline-flex min-h-11 items-center font-bold text-[color:var(--c-deep-ocean)] hover:underline"
                >
                  Noteで読む →
                </a>
              </article>
            ))
          ) : (
            <div className="rounded-[var(--radius-lg)] border border-[color:var(--c-border-subtle)] bg-[color:var(--c-snow)] p-[var(--space-6)] shadow-[var(--shadow-md)]">
              <p className="text-sm leading-6 text-[color:var(--c-text-secondary)]">
                現在、表示できるコラム記事はありません。
              </p>
            </div>
          )}
        </CardGrid>
        <div className="mt-[calc(var(--space-6)*2)]">
          <Button variant="primary" size="md" href="/jobs" className="md:w-auto">
            求人を見る →
          </Button>
        </div>
      </section>
    </main>
  );
}
