import Link from "next/link";
import Image from "next/image";
import { CardGrid } from "@/components/ui/CardGrid";
import { PageHero } from "@/components/ui/PageHero";
import { imageFromField } from "@/lib/wp/format";
import { getTestimonials } from "@/lib/wp/queries/voices";

export default async function VoicesPage() {
  const voices = await getTestimonials();

  return (
    <main className="bg-[color:var(--c-paper)]">
      <PageHero
        eyebrow="Voices"
        title="ここに来た人たちの、声。"
        lead="利尻富士町で暮らし、働く人たちの話を集めました。"
      />
      <section className="mx-auto max-w-[var(--container-max)] px-[var(--space-6)] pb-[calc(var(--space-6)*4)]">
        <CardGrid>
          {voices.map((voice) => {
            const fields = voice.testimonialFields;
            const photo = imageFromField(
              fields?.photo,
              "/placeholders/voice.svg",
              "移住者の声のプレースホルダー",
            );

            return (
              <article
                key={voice.id}
                className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--c-border-subtle)] bg-[color:var(--c-snow)] shadow-[var(--shadow-md)]"
              >
                <Image
                  src={photo.sourceUrl}
                  alt={photo.altText}
                  width={1200}
                  height={800}
                  className="aspect-[3/2] w-full object-cover"
                />
                <div className="p-[var(--space-6)]">
                  <span className="rounded-[var(--radius-full)] bg-[color:var(--c-border-subtle)] px-[var(--space-3)] py-[var(--space-1)] text-xs font-bold text-[color:var(--c-text-secondary)]">
                    {fields?.migrationYear} 移住
                  </span>
                  <h2 className="mt-[var(--space-4)] text-xl font-bold leading-8 tracking-normal text-[color:var(--c-text-primary)]">
                    {fields?.catchCopy}
                  </h2>
                  <p className="mt-[var(--space-3)] text-sm font-medium text-[color:var(--c-text-secondary)]">
                    {voice.title}
                  </p>
                  <Link
                    href={`/voices/${voice.slug}`}
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
            現在募集中の求人を見る →
          </Link>
        </div>
      </section>
    </main>
  );
}
