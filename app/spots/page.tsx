import Link from "next/link";
import Image from "next/image";
import { CardGrid } from "@/components/ui/CardGrid";
import { PageHero } from "@/components/ui/PageHero";
import { imageFromField, selectFirst } from "@/lib/wp/format";
import { SPOT_CATEGORY_LABELS } from "@/lib/wp/labels";
import { getTouristspots } from "@/lib/wp/queries/spots";

export default async function SpotsPage() {
  const spots = await getTouristspots();

  return (
    <main className="bg-[color:var(--c-paper)]">
      <PageHero
        eyebrow="Spots"
        title="島を、知る。"
        lead="あなたが暮らす島の、見どころを巡る。"
      />
      <section className="mx-auto max-w-[var(--container-max)] px-[var(--space-6)] pb-[calc(var(--space-6)*4)]">
        <CardGrid>
          {spots.map((spot) => {
            const fields = spot.touristspotFields;
            const category = selectFirst(fields?.category);
            const thumbnailImage = imageFromField(
              fields?.thumbnailImage,
              "/placeholders/spot.svg",
              "観光地情報のプレースホルダー",
            );

            return (
              <article
                key={spot.id}
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
                  <span className="rounded-[var(--radius-full)] bg-[color:var(--c-pin-spot)] px-[var(--space-3)] py-[var(--space-1)] text-xs font-bold text-[color:var(--c-text-primary)]">
                    {category ? SPOT_CATEGORY_LABELS[category] ?? category : "未設定"}
                  </span>
                  <h2 className="mt-[var(--space-4)] text-xl font-bold tracking-normal text-[color:var(--c-text-primary)]">
                    {spot.title}
                  </h2>
                  <p className="mt-[var(--space-3)] text-sm leading-6 text-[color:var(--c-text-secondary)]">
                    {fields?.catchCopy}
                  </p>
                  <p className="mt-[var(--space-5)] text-sm font-medium text-[color:var(--c-text-secondary)]">
                    {fields?.accessInfo}
                  </p>
                  <Link
                    href={`/spots/${spot.slug}`}
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
            この島で働く →
          </Link>
        </div>
      </section>
    </main>
  );
}
