import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DetailSection, FieldList } from "@/components/ui/DetailSection";
import { DUMMY_JOBS } from "@/lib/dummy-data/jobs";
import { DUMMY_VOICES } from "@/lib/dummy-data/voices";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return DUMMY_VOICES.map((voice) => ({ slug: voice.slug }));
}

export default async function VoiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const voice = DUMMY_VOICES.find((item) => item.slug === slug);

  if (!voice) notFound();

  const relatedJob = voice.relatedJob
    ? DUMMY_JOBS.find((job) => job.slug === voice.relatedJob?.slug)
    : null;

  return (
    <main className="bg-[color:var(--c-paper)] pb-[calc(var(--space-6)*4)]">
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--space-6)] pt-[calc(var(--space-6)*6)]">
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: "移住者の声", href: "/voices" },
            { label: voice.title },
          ]}
        />

        <section className="grid gap-[var(--space-6)] py-[calc(var(--space-6)*2)] lg:grid-cols-[1fr_32rem]">
          <div>
            <p className="text-sm font-bold text-[color:var(--c-deep-ocean)]">
              {voice.migrationYear} 移住
            </p>
            <h1 className="mt-[var(--space-4)] text-4xl font-bold leading-tight tracking-normal text-[color:var(--c-text-primary)] md:text-6xl">
              {voice.catchCopy}
            </h1>
            <p className="mt-[var(--space-5)] max-w-2xl text-lg font-medium leading-8 text-[color:var(--c-text-secondary)]">
              {voice.title}
            </p>
          </div>
          <Image
            src={voice.photo.sourceUrl}
            alt={voice.photo.altText}
            width={1200}
            height={800}
            priority
            className="aspect-[3/2] w-full rounded-[var(--radius-lg)] object-cover shadow-[var(--shadow-md)]"
          />
        </section>

        <div className="grid gap-[var(--space-6)]">
          <DetailSection title="プロフィール">
            <FieldList
              items={[
                { label: "移住前の暮らし", value: voice.profileBefore },
                { label: "現在の暮らし", value: voice.profileAfter },
                { label: "移住年", value: voice.migrationYear },
                { label: "関連求人", value: voice.relatedJob?.title ?? "" },
              ]}
            />
          </DetailSection>

          <DetailSection title="リード文">
            <p className="text-lg font-medium leading-8 text-[color:var(--c-text-primary)]">
              {voice.leadText}
            </p>
          </DetailSection>

          <DetailSection title="インタビュー本文">
            <div className="grid gap-[var(--space-4)] text-base leading-8 text-[color:var(--c-text-primary)]">
              {voice.interviewBody.split("\n\n").map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </DetailSection>

          <DetailSection title="暮らしの写真">
            <div className="grid gap-[var(--space-4)] md:grid-cols-2">
              {voice.galleryImages.map((image) => (
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

          {relatedJob ? (
            <DetailSection title="関連する求人">
              <article className="rounded-[var(--radius-md)] border border-[color:var(--c-border-subtle)] p-[var(--space-5)]">
                <p className="text-sm font-bold text-[color:var(--c-text-secondary)]">
                  {relatedJob.employmentType}
                </p>
                <h2 className="mt-[var(--space-2)] text-xl font-bold text-[color:var(--c-text-primary)]">
                  {relatedJob.title}
                </h2>
                <p className="mt-[var(--space-2)] text-sm leading-6 text-[color:var(--c-text-secondary)]">
                  {relatedJob.catchCopy}
                </p>
                <Link
                  href={`/jobs/${relatedJob.slug}`}
                  className="mt-[var(--space-4)] inline-flex min-h-11 items-center font-bold text-[color:var(--c-deep-ocean)] hover:underline"
                >
                  関連する求人を見る →
                </Link>
              </article>
            </DetailSection>
          ) : null}
        </div>

        <div className="mt-[calc(var(--space-6)*2)]">
          <Link
            href={relatedJob ? `/jobs/${relatedJob.slug}` : "/jobs"}
            className="inline-flex min-h-11 items-center rounded-[var(--radius-full)] bg-[color:var(--c-deep-ocean)] px-[var(--space-6)] font-bold text-[color:var(--c-text-inverse)]"
          >
            {relatedJob ? "関連する求人を見る →" : "求人一覧 →"}
          </Link>
        </div>
      </div>
    </main>
  );
}
