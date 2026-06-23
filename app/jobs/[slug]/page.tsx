import Image from "next/image";
import { notFound } from "next/navigation";
import { ApplyForm } from "@/components/job/ApplyForm";
import { StickyApplyCta } from "@/components/layout/StickyApplyCta";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DetailSection, FieldList } from "@/components/ui/DetailSection";
import { DUMMY_JOBS } from "@/lib/dummy-data/jobs";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const PIN_LABELS: Record<string, string> = {
  town_hall: "役場本庁舎",
  health_center: "保健センター",
  airport: "利尻空港",
  oniwaki: "鬼脇地区",
};

export function generateStaticParams() {
  return DUMMY_JOBS.map((job) => ({ slug: job.slug }));
}

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const job = DUMMY_JOBS.find((item) => item.slug === slug);

  if (!job) notFound();

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
              {job.employmentType}
            </p>
            <h1 className="mt-[var(--space-4)] text-4xl font-bold leading-tight tracking-normal text-[color:var(--c-text-primary)] md:text-6xl">
              {job.title}
            </h1>
            <p className="mt-[var(--space-5)] max-w-2xl text-lg font-medium leading-8 text-[color:var(--c-text-secondary)]">
              {job.catchCopy}
            </p>
          </div>
          <Image
            src={job.thumbnailImage?.sourceUrl ?? "/placeholders/job.svg"}
            alt={job.thumbnailImage?.altText ?? ""}
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
                { label: "雇用形態", value: job.employmentType },
                { label: "キャッチコピー", value: job.catchCopy },
                { label: "サムネイル動画URL", value: job.thumbnailVideoUrl },
                { label: "表示するピン位置", value: PIN_LABELS[job.pinLocation] },
              ]}
            />
          </DetailSection>

          <DetailSection title="業務内容">
            <FieldList
              items={[
                { label: "業務内容", value: job.description },
                { label: "求める人材", value: job.desiredPerson },
                { label: "必要資格", value: job.requiredQualifications },
              ]}
            />
          </DetailSection>

          <DetailSection title="条件・待遇">
            <FieldList
              items={[
                { label: "給与", value: job.salary },
                { label: "給与詳細", value: job.salaryDetail },
                { label: "勤務時間", value: job.workHours },
                { label: "勤務時間詳細", value: job.workHoursDetail },
                { label: "休日・休暇", value: job.holiday },
                { label: "社会保険", value: job.socialInsurance },
                { label: "福利厚生", value: job.benefits },
                {
                  label: "住居サポート",
                  value: job.housingSupportAvailable ? "あり" : "なし",
                },
                ...(job.housingSupportAvailable
                  ? [{ label: "住居サポート詳細", value: job.housingSupportDetail }]
                  : []),
                { label: "受動喫煙対策", value: job.smokingPolicy },
                { label: "試用・研修期間", value: job.trialPeriod },
              ]}
            />
          </DetailSection>

          <DetailSection title="勤務地">
            <FieldList
              items={[
                { label: "勤務地住所", value: job.workAddress },
                { label: "勤務地詳細", value: job.workAddressDetail },
              ]}
            />
          </DetailSection>

          <DetailSection title="応募">
            <FieldList items={[{ label: "応募後の流れ", value: job.applicationFlow }]} />
          </DetailSection>

          <ApplyForm jobTitle={job.title} jobSlug={job.slug} />
        </div>
      </div>
      <StickyApplyCta />
    </main>
  );
}
