import Link from "next/link";
import Image from "next/image";
import { CardGrid } from "@/components/ui/CardGrid";
import { PageHero } from "@/components/ui/PageHero";
import { imageFromField, selectFirst } from "@/lib/wp/format";
import { EMPLOYMENT_TYPE_LABELS, PIN_LABELS } from "@/lib/wp/labels";
import { getJobPostings } from "@/lib/wp/queries/jobs";

export default async function JobsPage() {
  const jobs = await getJobPostings();

  return (
    <main className="bg-[color:var(--c-paper)]">
      <PageHero
        eyebrow="Jobs"
        title="あなたの行き先を、ここから。"
        lead="利尻富士町で募集中の仕事、すべて。"
      />
      <section className="mx-auto max-w-[var(--container-max)] px-[var(--space-6)] pb-[calc(var(--space-6)*4)]">
        <CardGrid>
          {jobs.map((job) => {
            const fields = job.jobPostingFields;
            const employmentType = selectFirst(fields?.employmentType);
            const pinLocation = selectFirst(fields?.pinLocation);
            const thumbnailImage = imageFromField(
              fields?.thumbnailImage,
              "/placeholders/job.svg",
              "求人情報のプレースホルダー",
            );

            return (
              <article
                key={job.id}
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
                    <span className="rounded-[var(--radius-full)] bg-[color:var(--c-pin-job)] px-[var(--space-3)] py-[var(--space-1)] text-xs font-bold text-[color:var(--c-text-primary)]">
                      {employmentType ? EMPLOYMENT_TYPE_LABELS[employmentType] ?? employmentType : "未設定"}
                    </span>
                    <span className="rounded-[var(--radius-full)] bg-[color:var(--c-border-subtle)] px-[var(--space-3)] py-[var(--space-1)] text-xs font-bold text-[color:var(--c-text-secondary)]">
                      {pinLocation ? PIN_LABELS[pinLocation] ?? pinLocation : "未設定"}
                    </span>
                  </div>
                  <h2 className="mt-[var(--space-4)] text-xl font-bold tracking-normal text-[color:var(--c-text-primary)]">
                    {job.title}
                  </h2>
                  <p className="mt-[var(--space-3)] text-sm leading-6 text-[color:var(--c-text-secondary)]">
                    {fields?.catchCopy}
                  </p>
                  <dl className="mt-[var(--space-5)] grid gap-[var(--space-2)] text-sm">
                    <div className="flex justify-between gap-[var(--space-4)]">
                      <dt className="text-[color:var(--c-text-secondary)]">給与</dt>
                      <dd className="font-bold text-[color:var(--c-text-primary)]">{fields?.salary}</dd>
                    </div>
                    <div className="flex justify-between gap-[var(--space-4)]">
                      <dt className="text-[color:var(--c-text-secondary)]">勤務時間</dt>
                      <dd className="font-bold text-[color:var(--c-text-primary)]">{fields?.workHours}</dd>
                    </div>
                  </dl>
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="mt-[var(--space-6)] inline-flex min-h-11 items-center font-bold text-[color:var(--c-deep-ocean)] hover:underline"
                  >
                    詳細を見る →
                  </Link>
                </div>
              </article>
            );
          })}
        </CardGrid>
      </section>
    </main>
  );
}
