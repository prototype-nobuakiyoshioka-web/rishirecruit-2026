import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DetailSection, FieldList } from "@/components/ui/DetailSection";
import { eventStatus, galleryFromField, htmlToText, imageFromField, selectFirst } from "@/lib/wp/format";
import { EVENT_CATEGORY_LABELS } from "@/lib/wp/labels";
import { getEventBySlug, getEvents } from "@/lib/wp/queries/events";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export async function generateStaticParams() {
  const events = await getEvents();

  return events.map((event) => ({ slug: event.slug }));
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  const fields = event.eventFields;
  const category = selectFirst(fields?.category);
  const categoryLabel = category ? EVENT_CATEGORY_LABELS[category] ?? category : null;
  const thumbnailImage = imageFromField(
    fields?.thumbnailImage,
    "/placeholders/event.svg",
    "イベント情報のプレースホルダー",
  );
  const galleryImages = galleryFromField(fields?.galleryImages);
  const startDate = fields?.startDatetime ? new Date(fields.startDatetime) : null;
  const endDate = fields?.endDatetime ? new Date(fields.endDatetime) : null;

  return (
    <main className="bg-[color:var(--c-paper)] pb-[calc(var(--space-6)*4)]">
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--space-6)] pt-[calc(var(--space-6)*6)]">
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: "イベント", href: "/events" },
            { label: event.title },
          ]}
        />

        <section className="grid gap-[var(--space-6)] py-[calc(var(--space-6)*2)] lg:grid-cols-[1fr_32rem]">
          <div>
            <p className="text-sm font-bold text-[color:var(--c-deep-ocean)]">
              {categoryLabel} ・ {eventStatus(fields?.startDatetime)}
            </p>
            <h1 className="mt-[var(--space-4)] text-4xl font-bold leading-tight tracking-normal text-[color:var(--c-text-primary)] md:text-6xl">
              {event.title}
            </h1>
            <p className="mt-[var(--space-5)] max-w-2xl text-lg font-medium leading-8 text-[color:var(--c-text-secondary)]">
              {fields?.catchCopy}
            </p>
          </div>
          <Image
            src={thumbnailImage.sourceUrl}
            alt={thumbnailImage.altText}
            width={1200}
            height={800}
            priority
            className="aspect-[3/2] w-full rounded-[var(--radius-lg)] object-cover shadow-[var(--shadow-md)]"
          />
        </section>

        <div className="grid gap-[var(--space-6)]">
          <DetailSection title="スケジュール・開催情報">
            <FieldList
              items={[
                { label: "開始日時", value: startDate ? DATE_FORMATTER.format(startDate) : "" },
                { label: "終了日時", value: endDate ? DATE_FORMATTER.format(endDate) : "" },
                { label: "毎年開催", value: fields?.isRecurring ? "はい" : "いいえ" },
                { label: "開催パターン", value: fields?.recurrenceNote },
              ]}
            />
          </DetailSection>

          <DetailSection title="詳細・解説">
            <FieldList
              items={[
                { label: "説明文", value: htmlToText(fields?.description) },
                { label: "サムネイル動画URL", value: fields?.thumbnailVideoUrl },
              ]}
            />
          </DetailSection>

          <DetailSection title="ギャラリー">
            <div className="grid gap-[var(--space-4)] md:grid-cols-2">
              {galleryImages.map((image) => (
                <Image
                  key={image.sourceUrl}
                  src={image.sourceUrl}
                  alt={image.altText}
                  width={1200}
                  height={800}
                  className="aspect-[3/2] w-full rounded-[var(--radius-md)] object-cover"
                />
              ))}
            </div>
          </DetailSection>

          <DetailSection title="会場・申込">
            <FieldList
              items={[
                { label: "会場名", value: fields?.venueName },
                { label: "住所", value: fields?.address },
                { label: "アクセス情報", value: fields?.accessInfo },
                { label: "ピン位置の参照", value: fields?.pinReference },
                { label: "参加費", value: fields?.price },
                {
                  label: "申込先URL",
                  value: fields?.registrationUrl ? (
                    <a
                      href={fields.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[color:var(--c-deep-ocean)] underline"
                    >
                      {fields.registrationUrl}
                    </a>
                  ) : (
                    ""
                  ),
                },
                { label: "問い合わせ先", value: fields?.contact },
              ]}
            />
          </DetailSection>
        </div>

        <div className="mt-[calc(var(--space-6)*2)]">
          <Link
            href="/jobs"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-full)] bg-[color:var(--c-deep-ocean)] px-[var(--space-6)] font-bold text-[color:var(--c-text-inverse)]"
          >
            求人一覧 →
          </Link>
        </div>
      </div>
    </main>
  );
}
