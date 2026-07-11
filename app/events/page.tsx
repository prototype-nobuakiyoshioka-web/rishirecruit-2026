import Link from "next/link";
import Image from "next/image";
import { CardGrid } from "@/components/ui/CardGrid";
import { PageHero } from "@/components/ui/PageHero";
import { eventStatus, imageFromField, selectFirst } from "@/lib/wp/format";
import { EVENT_CATEGORY_LABELS } from "@/lib/wp/labels";
import { getEvents } from "@/lib/wp/queries/events";

const DATE_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <main className="bg-[color:var(--c-paper)]">
      <PageHero
        eyebrow="Events"
        title="今、この島で起きていること。"
        lead="開催中・予定のイベントをまとめて。"
      />
      <section className="mx-auto max-w-[var(--container-max)] px-[var(--space-6)] pb-[calc(var(--space-6)*4)]">
        <CardGrid>
          {events.map((event) => {
            const fields = event.eventFields;
            const category = selectFirst(fields?.category);
            const thumbnailImage = imageFromField(
              fields?.thumbnailImage,
              "/placeholders/event.svg",
              "イベント情報のプレースホルダー",
            );
            const startDate = fields?.startDatetime ? new Date(fields.startDatetime) : null;

            return (
              <article
                key={event.id}
                className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--c-border-subtle)] bg-[color:var(--c-snow)] shadow-[var(--shadow-md)]"
              >
                <Image
                  src={thumbnailImage.sourceUrl}
                  alt={thumbnailImage.altText}
                  width={1200}
                  height={800}
                  className="aspect-[3/2] w-full object-cover"
                />
                <div className="p-[var(--space-6)]">
                  <div className="flex flex-wrap gap-[var(--space-2)]">
                    <span className="rounded-[var(--radius-full)] bg-[color:var(--c-pin-event)] px-[var(--space-3)] py-[var(--space-1)] text-xs font-bold text-[color:var(--c-text-primary)]">
                      {category ? EVENT_CATEGORY_LABELS[category] ?? category : "未設定"}
                    </span>
                    <span className="rounded-[var(--radius-full)] bg-[color:var(--c-border-subtle)] px-[var(--space-3)] py-[var(--space-1)] text-xs font-bold text-[color:var(--c-text-secondary)]">
                      {eventStatus(fields?.startDatetime)}
                    </span>
                  </div>
                  <h2 className="mt-[var(--space-4)] text-xl font-bold tracking-normal text-[color:var(--c-text-primary)]">
                    {event.title}
                  </h2>
                  <p className="mt-[var(--space-3)] text-sm leading-6 text-[color:var(--c-text-secondary)]">
                    {fields?.catchCopy}
                  </p>
                  <dl className="mt-[var(--space-5)] grid gap-[var(--space-2)] text-sm">
                    <div>
                      <dt className="text-[color:var(--c-text-secondary)]">開催日</dt>
                      <dd className="mt-[var(--space-1)] font-bold text-[color:var(--c-text-primary)]">
                        {startDate ? DATE_FORMATTER.format(startDate) : "未設定"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[color:var(--c-text-secondary)]">会場</dt>
                      <dd className="mt-[var(--space-1)] font-bold text-[color:var(--c-text-primary)]">
                        {fields?.venueName}
                      </dd>
                    </div>
                  </dl>
                  <Link
                    href={`/events/${event.slug}`}
                    className="mt-[var(--space-6)] inline-flex min-h-11 items-center font-bold text-[color:var(--c-deep-ocean)] hover:underline"
                  >
                    詳細を見る →
                  </Link>
                </div>
              </article>
            );
          })}
        </CardGrid>
        <div className="mt-[calc(var(--space-6)*2)]">
          <Link
            href="/jobs"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-full)] bg-[color:var(--c-deep-ocean)] px-[var(--space-6)] font-bold text-[color:var(--c-text-inverse)]"
          >
            求人一覧 →
          </Link>
        </div>
      </section>
    </main>
  );
}
