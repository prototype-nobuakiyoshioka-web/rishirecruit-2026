import Image from "next/image";
import { notFound } from "next/navigation";
import { ApplyForm } from "@/components/job/ApplyForm";
import { StickyApplyCta } from "@/components/layout/StickyApplyCta";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DetailSection, FieldList } from "@/components/ui/DetailSection";
import { htmlToText, imageFromField, selectFirst } from "@/lib/wp/format";
import { EMPLOYMENT_TYPE_LABELS, PIN_LABELS } from "@/lib/wp/labels";
import { getJobPostingBySlug, getJobPostings } from "@/lib/wp/queries/jobs";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const jobs = await getJobPostings();

  return jobs.map((job) => ({ slug: job.slug }));
}

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const job = await getJobPostingBySlug(slug);

  if (!job) notFound();

  const fields = job.jobPostingFields;
  const employmentType = selectFirst(fields?.employmentType);
  const employmentTypeLabel = employmentType
    ? EMPLOYMENT_TYPE_LABELS[employmentType] ?? employmentType
    : null;
  const pinLocation = selectFirst(fields?.pinLocation);
  const thumbnailImage = imageFromField(
    fields?.thumbnailImage,
    "/placeholders/job.svg",
    "求人情報のプレースホルダー",
  );

  return (
    <main className="bg-[color:var(--c-paper)] pb-28 md:pb-[calc(var(--space-6)*4)]">
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--space-6)] pt-[calc(var(--space-6)*6)] md:pr-[calc(var(--space-6)*8)]">
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: "求人", href: "/jobs" },
            { label: job.title },
          ]}
        />

        <section className="grid gap-[var(--space-6)] py-[calc(var(--space-6)*2)] lg:grid-cols-[1fr_28rem]">
          <div>
            <p className="text-sm font-bold text-[color:var(--c-deep-ocean)]">
              {employmentTypeLabel}
            </p>
            <h1 className="mt-[var(--space-4)] text-4xl font-bold leading-tight tracking-normal text-[color:var(--c-text-primary)] md:text-6xl">
              {job.title}
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
          <DetailSection title="募集の基本">
            <FieldList
              items={[
                { label: "雇用形態", value: employmentTypeLabel },
                { label: "キャッチコピー", value: fields?.catchCopy },
                { label: "サムネイル動画URL", value: fields?.thumbnailVideoUrl },
                {
                  label: "表示するピン位置",
                  value: pinLocation ? PIN_LABELS[pinLocation] ?? pinLocation : null,
                },
              ]}
            />
          </DetailSection>

          <DetailSection title="業務内容">
            <FieldList
              items={[
                { label: "業務内容", value: htmlToText(fields?.description) },
                { label: "求める人材", value: fields?.desiredPerson },
                { label: "必要資格", value: fields?.requiredQualifications },
              ]}
            />
          </DetailSection>

          <DetailSection title="条件・待遇">
            <FieldList
              items={[
                { label: "給与", value: fields?.salary },
                { label: "給与詳細", value: fields?.salaryDetail },
                { label: "勤務時間", value: fields?.workHours },
                { label: "勤務時間詳細", value: fields?.workHoursDetail },
                { label: "休日・休暇", value: fields?.holiday },
                { label: "社会保険", value: fields?.socialInsurance },
                { label: "福利厚生", value: fields?.benefits },
                {
                  label: "住居サポート",
                  value: fields?.housingSupportAvailable ? "あり" : "なし",
                },
                ...(fields?.housingSupportAvailable
                  ? [{ label: "住居サポート詳細", value: fields.housingSupportDetail }]
                  : []),
                { label: "受動喫煙対策", value: fields?.smokingPolicy },
                { label: "試用・研修期間", value: fields?.trialPeriod },
              ]}
            />
          </DetailSection>

          <DetailSection title="勤務地">
            <FieldList
              items={[
                { label: "勤務地住所", value: fields?.workAddress },
                { label: "勤務地詳細", value: fields?.workAddressDetail },
              ]}
            />
          </DetailSection>

          <DetailSection title="応募">
            <FieldList items={[{ label: "応募後の流れ", value: htmlToText(fields?.applicationFlow) }]} />
          </DetailSection>

          <ApplyForm jobTitle={job.title} jobSlug={job.slug} />
        </div>
      </div>
      <StickyApplyCta />
    </main>
  );
}
