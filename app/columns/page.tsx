import type { Metadata } from "next";
import Link from "next/link";
import { EditorialIndexShell } from "@/components/ui/EditorialIndexShell";
import { fetchNoteArticles } from "@/lib/note/fetch-articles";
import { gridSpanClass } from "@/lib/utils/grid-spans";

export const metadata: Metadata = {
  title: "島ぐらしコラム",
  description:
    "利尻富士町の暮らしを綴る、Note連載の島ぐらしコラム。島の四季や人、小さな日常を言葉で紹介します。",
};

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
    <EditorialIndexShell
      eyebrow="Columns from the island"
      title={<>島のことばを、<br />綴っていく。</>}
      lead={<>Noteで連載中の、島ぐらしコラム。<br />暮らしの手ざわりを、言葉で残します。</>}
      introEyebrow="Island columns"
      introLabel="島ぐらしの記録"
      introTitle={<>求人の外側にある、<br />島の暮らしの話。</>}
      introBody="働くことの周りには、日々の暮らしがあります。島の四季や人、ふとした出来事を綴ったコラムから、ここで流れる時間を感じてみてください。"
    >
      <section className="relative mx-auto max-w-[1080px] px-[var(--space-6)] pb-20 md:pb-28">
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-12">
            {articles.map((article, index) => (
              <article key={article.link} className={gridSpanClass(index)}>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${article.title}をNoteで読む`}
                >
                  <div
                    role="img"
                    aria-label={`${article.title}のサムネイル`}
                    className="aspect-video w-full rounded-[var(--radius-2xl)] bg-[color:var(--c-ice)] bg-contain bg-no-repeat bg-center transition-transform duration-500 hover:scale-[1.02]"
                    style={
                      article.imageUrl
                        ? { backgroundImage: `url(${JSON.stringify(article.imageUrl)})` }
                        : undefined
                    }
                  />
                </a>
                <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[color:var(--c-warning)]">
                      Column {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-3 text-sm font-bold text-[color:var(--c-text-secondary)]">
                      {formatPublishedAt(article.publishedAt)}
                    </p>
                    <h2 className="mt-3 text-2xl font-black text-[color:var(--c-deep-ocean)] md:text-3xl">
                      {article.title}
                    </h2>
                    {article.excerpt ? (
                      <p className="mt-3 leading-7 text-[color:var(--c-text-secondary)]">
                        {article.excerpt}
                      </p>
                    ) : null}
                  </div>
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center font-black text-[color:var(--c-deep-ocean)] hover:underline"
                  >
                    Noteで読む →
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border-y border-[color:var(--c-deep-ocean)]/15 py-16 text-center md:py-24">
            <p className="text-2xl font-black text-[color:var(--c-deep-ocean)]">
              新しいコラムを準備しています。
            </p>
            <p className="mt-4 text-base leading-8 text-[color:var(--c-text-secondary)]">
              公開まで、募集中の仕事をご覧ください。
            </p>
          </div>
        )}

        <div className="mt-20 border-t border-[color:var(--c-deep-ocean)]/15 pt-10">
          <Link
            href="/jobs"
            className="font-black text-[color:var(--c-deep-ocean)] hover:underline"
          >
            この島で働く →
          </Link>
        </div>
      </section>
    </EditorialIndexShell>
  );
}
