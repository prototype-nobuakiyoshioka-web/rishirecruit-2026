import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EditorialIndexShell } from "@/components/ui/EditorialIndexShell";
import { formatEventPeriod } from "@/lib/utils/format-date";
import { eventStatus, imageFromField, selectFirst } from "@/lib/wp/format";
import { EVENT_CATEGORY_LABELS } from "@/lib/wp/labels";
import { getEvents } from "@/lib/wp/queries/events";
import { gridSpanClass } from "@/lib/utils/grid-spans";

export const metadata: Metadata = { title: "利尻富士町のイベント", description: "利尻富士町で開催中・開催予定のイベント情報。日時、会場、参加方法を確認できます。" };

export default async function EventsPage() {
  const events = await getEvents();
  return (
    <EditorialIndexShell
      eyebrow="Events on the island"
      title={<>今、この島で<br />起きていること。</>}
      lead={<>季節の催し、人が集まる時間。<br />島の今を、予定から見つけられます。</>}
      introEyebrow="Event calendar"
      introLabel="開催中・開催予定"
      introTitle={<>参加することで、<br />町との距離が近くなる。</>}
      introBody="行事や小さな集まりは、島の人や季節に触れる入口です。開催日と場所を確認して、気になる時間に足を運んでみてください。"
    >
      <section className="relative mx-auto max-w-[1080px] px-[var(--space-6)] pb-20 md:pb-28">
        <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-12">
          {events.map((event, index) => {
            const fields = event.eventFields;
            const category = selectFirst(fields?.category);
            const image = imageFromField(fields?.thumbnailImage, "/placeholders/event.svg");
            const period = formatEventPeriod(fields?.dateDisplayType?.[0] ?? null, fields?.startDatetime ?? null, fields?.endDatetime ?? null, fields?.periodMonth?.[0] ?? null, fields?.periodRange?.[0] ?? null);
            return (
              <article key={event.id} className={gridSpanClass(index)}>
                <Link href={`/events/${event.slug}`} aria-label={`${event.title}の詳細を見る`}>
                  <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[var(--radius-2xl)] bg-[color:var(--c-ice)]">
                    <Image src={image.sourceUrl} alt={image.altText || `${event.title}の写真`} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-500 hover:scale-[1.02]" />
                  </div>
                </Link>
                <div className="mt-6">
                  <div className="flex flex-wrap gap-3 text-xs font-black"><span className="text-[color:var(--c-warning)]">{category ? EVENT_CATEGORY_LABELS[category] ?? category : "Event"}</span><span className="text-[color:var(--c-text-secondary)]">{eventStatus(fields?.startDatetime)}</span></div>
                  <p className="mt-4 text-lg font-black text-[color:var(--c-deep-ocean)]">{period || "開催日調整中"}</p>
                  <h2 className="mt-2 text-2xl font-black leading-tight tracking-[-0.02em] text-[color:var(--c-deep-ocean)] md:text-3xl">{event.title}</h2>
                  {fields?.catchCopy ? <p className="mt-3 leading-7 text-[color:var(--c-text-secondary)]">{fields.catchCopy}</p> : null}
                  {fields?.venueName ? <p className="mt-3 text-sm font-bold text-[color:var(--c-text-secondary)]">会場　{fields.venueName}</p> : null}
                  <Link href={`/events/${event.slug}`} className="mt-5 inline-flex min-h-11 items-center border-b border-[color:var(--c-deep-ocean)] pb-1 font-black text-[color:var(--c-deep-ocean)]">開催情報を見る →</Link>
                </div>
              </article>
            );
          })}
        </div>
        <div className="mt-12 border-t border-[color:var(--c-deep-ocean)]/15 pt-10"><Link href="/jobs" className="font-black text-[color:var(--c-deep-ocean)] hover:underline">求人一覧を見る →</Link></div>
      </section>
    </EditorialIndexShell>
  );
}
