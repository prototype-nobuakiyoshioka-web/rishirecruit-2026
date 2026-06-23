import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DetailSection, FieldList } from "@/components/ui/DetailSection";
import { DUMMY_SPOTS } from "@/lib/dummy-data/spots";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return DUMMY_SPOTS.map((spot) => ({ slug: spot.slug }));
}

export default async function SpotDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const spot = DUMMY_SPOTS.find((item) => item.slug === slug);

  if (!spot) notFound();

  return (
    <main className="bg-[color:var(--c-paper)] pb-[calc(var(--space-6)*4)]">
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--space-6)] pt-[calc(var(--space-6)*6)]">
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: "観光地", href: "/spots" },
            { label: spot.title },
          ]}
        />

        <section className="grid gap-[var(--space-6)] py-[calc(var(--space-6)*2)] lg:grid-cols-[1fr_32rem]">
          <div>
            <p className="text-sm font-bold text-[color:var(--c-deep-ocean)]">
              {spot.categoryLabel}
            </p>
            <h1 className="mt-[var(--space-4)] text-4xl font-bold leading-tight tracking-normal text-[color:var(--c-text-primary)] md:text-6xl">
              {spot.title}
            </h1>
            <p className="mt-[var(--space-5)] max-w-2xl text-lg font-medium leading-8 text-[color:var(--c-text-secondary)]">
              {spot.catchCopy}
            </p>
          </div>
          <Image
            src={spot.thumbnailImage.sourceUrl}
            alt={spot.thumbnailImage.altText}
            width={1200}
            height={800}
            priority
            className="aspect-[3/2] w-full rounded-[var(--radius-lg)] object-cover shadow-[var(--shadow-md)]"
          />
        </section>

        <div className="grid gap-[var(--space-6)]">
          <DetailSection title="詳細・解説">
            <FieldList
              items={[
                { label: "説明文", value: spot.description },
                { label: "おすすめ季節", value: spot.bestSeason },
                { label: "サムネイル動画URL", value: spot.thumbnailVideoUrl },
              ]}
            />
          </DetailSection>

          <DetailSection title="ギャラリー">
            <div className="grid gap-[var(--space-4)] md:grid-cols-2">
              {spot.galleryImages.map((image) => (
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

          <DetailSection title="訪問情報">
            <FieldList
              items={[
                { label: "住所", value: spot.address },
                { label: "アクセス情報", value: spot.accessInfo },
                { label: "営業時間・開放時間", value: spot.openHours },
                { label: "定休日", value: spot.closedDays },
                { label: "料金", value: spot.price },
                { label: "電話番号", value: spot.phone },
                {
                  label: "公式サイトURL",
                  value: spot.websiteUrl ? (
                    <a
                      href={spot.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[color:var(--c-deep-ocean)] underline"
                    >
                      {spot.websiteUrl}
                    </a>
                  ) : (
                    ""
                  ),
                },
              ]}
            />
          </DetailSection>
        </div>

        <div className="mt-[calc(var(--space-6)*2)]">
          <Link
            href="/jobs"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-full)] bg-[color:var(--c-deep-ocean)] px-[var(--space-6)] font-bold text-[color:var(--c-text-inverse)]"
          >
            現在募集中の求人を見る →
          </Link>
        </div>
      </div>
    </main>
  );
}
