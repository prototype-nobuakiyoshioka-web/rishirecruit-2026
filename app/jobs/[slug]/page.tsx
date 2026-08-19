import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApplyForm } from "@/components/job/ApplyForm";
import { StickyApplyCta } from "@/components/layout/StickyApplyCta";
import { EditorialDetailSection, EditorialDetailShell, EditorialFieldList } from "@/components/ui/EditorialDetailShell";
import { htmlToText, imageFromField, selectFirst } from "@/lib/wp/format";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/wp/labels";
import { getJobPostingBySlug, getJobPostings } from "@/lib/wp/queries/jobs";

type PageProps = { params: Promise<{ slug: string }> };
export async function generateStaticParams() { return (await getJobPostings()).map((job) => ({ slug: job.slug })); }
export async function generateMetadata({params}:PageProps):Promise<Metadata>{const {slug}=await params;const job=await getJobPostingBySlug(slug);return job?{title:`${job.title}｜利尻富士町の求人`,description:job.jobPostingFields?.catchCopy??undefined}:{};}

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params; const job = await getJobPostingBySlug(slug); if (!job) notFound();
  const fields=job.jobPostingFields; const type=selectFirst(fields?.employmentType); const typeLabel=type?(EMPLOYMENT_TYPE_LABELS[type]??type):"求人"; const image=imageFromField(fields?.thumbnailImage,"/placeholders/job.svg");
  return <>
    <EditorialDetailShell breadcrumbs={[{label:"ホーム",href:"/"},{label:"求人",href:"/jobs"},{label:job.title}]} eyebrow="Job / Open position" meta={typeLabel} title={job.title} lead={fields?.catchCopy} image={{...image,altText:image.altText||`${job.title}の求人写真`}}>
      <EditorialDetailSection eyebrow="Overview" label="仕事について"><div className="grid gap-7 text-base leading-8 text-[color:var(--c-text-secondary)] md:text-lg">{htmlToText(fields?.description).split(/\n+/).filter(Boolean).map(p=><p key={p}>{p}</p>)}</div></EditorialDetailSection>
      <EditorialDetailSection eyebrow="Requirements" label="求める人"><EditorialFieldList items={[{label:"求める人材",value:fields?.desiredPerson},{label:"必要資格",value:fields?.requiredQualifications}]} /></EditorialDetailSection>
      <EditorialDetailSection eyebrow="Conditions" label="条件・待遇"><EditorialFieldList items={[{label:"雇用形態",value:typeLabel},{label:"給与",value:fields?.salary},{label:"給与詳細",value:fields?.salaryDetail},{label:"勤務時間",value:fields?.workHours},{label:"勤務時間詳細",value:fields?.workHoursDetail},{label:"休日・休暇",value:fields?.holiday},{label:"社会保険",value:fields?.socialInsurance},{label:"福利厚生",value:fields?.benefits},{label:"住居サポート",value:fields?.housingSupportAvailable?"あり":"なし"},{label:"住居サポート詳細",value:fields?.housingSupportAvailable?fields.housingSupportDetail:null},{label:"受動喫煙対策",value:fields?.smokingPolicy},{label:"試用・研修期間",value:fields?.trialPeriod}]} /></EditorialDetailSection>
      <EditorialDetailSection eyebrow="Workplace" label="勤務地"><EditorialFieldList items={[{label:"勤務地",value:fields?.workAddress},{label:"勤務地詳細",value:fields?.workAddressDetail}]} /></EditorialDetailSection>
      <EditorialDetailSection eyebrow="Application" label="応募について"><div className="grid gap-8"><p className="whitespace-pre-line text-base leading-8 text-[color:var(--c-text-secondary)]">{htmlToText(fields?.applicationFlow)}</p><ApplyForm jobTitle={job.title} jobSlug={job.slug} /></div></EditorialDetailSection>
    </EditorialDetailShell><StickyApplyCta />
  </>;
}
