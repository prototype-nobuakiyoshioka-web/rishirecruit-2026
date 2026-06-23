import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DetailSection, FieldList } from "@/components/ui/DetailSection";
import { DUMMY_EVENTS } from "@/lib/dummy-data/events";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function generateStaticParams() {
  return DUMMY_EVENTS.map((event) => ({ slug: event.slug }));
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = DUMMY_EVENTS.find((item) => item.slug === slug);

  if (!event) notFound();

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
              {event.categoryLabel} ・ {event.status}
            </p>
            <h1 className="mt-[var(--space-4)] text-4xl font-bold leading-tight tracking-normal text-[color:var(--c-text-primary)] md:text-6xl">
              {event.title}
            </h1>
            <p className="mt-[var(--space-5)] max-w-2xl text-lg font-medium leading-8 text-[color:var(--c-text-secondary)]">
              {event.catchCopy}
            </p>
          </div>
          <Image
            src={event.thumbnailImage.sourceUrl}
            alt={event.thumbnailImage.altText}
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
                { label: "開始日時", value: DATE_FORMATTER.format(new Date(event.startDatetime)) },
                { label: "終了日時", value: DATE_FORMATTER.format(new Date(event.endDatetime)) },
                { label: "毎年開催", value: event.isRecurring ? "はい" : "いいえ" },
                { label: "開催パターン", value: event.recurrenceNote },
                { label: "主催", value: event.organizer },
              ]}
            />
          </DetailSection>

          <DetailSection title="詳細・解説">
            <FieldList
              items={[
                { label: "説明文", value: event.description },
                { label: "サムネイル動画URL", value: event.thumbnailVideoUrl },
              ]}
            />
          </DetailSection>

          <DetailSection title="ギャラリー">
            <div className="grid gap-[var(--space-4)] md:grid-cols-2">
              {event.galleryImages.map((image) => (
                <Image
                  key={image.altText}
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
                { label: "会場名", value: event.venueName },
                { label: "住所", value: event.address },
                { label: "アクセス情報", value: event.accessInfo },
                { label: "ピン位置の参照", value: event.pinReference },
                { label: "参加費", value: event.price },
                {
                  label: "申込先URL",
                  value: event.registrationUrl ? (
                    <a
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[color:var(--c-deep-ocean)] underline"
                    >
                      {event.registrationUrl}
                    </a>
                  ) : (
                    ""
                  ),
                },
                { label: "問い合わせ先", value: event.contact },
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

