import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EditorialIndexShell } from "@/components/ui/EditorialIndexShell";
import { imageFromField, selectFirst } from "@/lib/wp/format";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/wp/labels";
import { getJobPostings } from "@/lib/wp/queries/jobs";

export const metadata: Metadata = {
  title: "利尻富士町の求人",
  description:
    "利尻富士町で募集中の求人一覧。仕事内容、雇用形態、給与、勤務時間、住居サポートを確認できます。",
};

export default async function JobsPage() {
  const jobs = await getJobPostings();

  return (
    <EditorialIndexShell
      eyebrow="Jobs in Rishirifuji"
      title={<>あなたの行き先を、<br />ここから。</>}
      lead={<>利尻富士町で募集中の仕事を、<br />条件と暮らしの両方から確かめられます。</>}
      introEyebrow="Open positions"
      introLabel="現在募集中の仕事"
      introTitle={<>島で暮らすことを、<br />仕事から考える。</>}
      introBody="職種名だけでなく、仕事内容、給与、勤務時間、住居サポートまで。気になる求人を開き、自分の経験や希望と重なる部分があるかを確かめてください。"
    >
      <section className="relative mx-auto max-w-[1080px] px-[var(--space-6)] pb-20 md:pb-28">
        <div className="grid gap-8 md:grid-cols-2">
          {jobs.map((job) => {
            const fields = job.jobPostingFields;
            const employmentType = selectFirst(fields?.employmentType);
            const image = imageFromField(fields?.thumbnailImage, "/placeholders/job.svg");
            return (
              <article key={job.id} className="overflow-hidden rounded-[var(--radius-2xl)] border border-[color:var(--c-deep-ocean)]/10 bg-white/55">
                <Link href={`/jobs/${job.slug}`} aria-label={`${job.title}の求人詳細を見る`}>
                  <Image src={image.sourceUrl} alt={image.altText || `${job.title}の求人写真`} width={1200} height={800} className="aspect-[3/2] w-full object-cover transition-transform duration-500 hover:scale-[1.015]" />
                </Link>
                <div className="p-6 md:p-8">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[color:var(--c-warning)]">
                    {employmentType ? EMPLOYMENT_TYPE_LABELS[employmentType] ?? employmentType : "Job"}
                  </p>
                  <h2 className="mt-4 text-2xl font-black tracking-[-0.02em] text-[color:var(--c-deep-ocean)]">{job.title}</h2>
                  {fields?.catchCopy ? <p className="mt-4 leading-7 text-[color:var(--c-text-secondary)]">{fields.catchCopy}</p> : null}
                  <dl className="mt-6 border-t border-[color:var(--c-deep-ocean)]/15 text-sm">
                    {[{label:"給与",value:fields?.salary},{label:"勤務時間",value:fields?.workHours},{label:"住居サポート",value:fields?.housingSupportAvailable ? "あり" : "なし"}].map((item)=>(
                      <div key={item.label} className="grid grid-cols-[6rem_1fr] gap-4 border-b border-[color:var(--c-deep-ocean)]/15 py-3"><dt className="text-[color:var(--c-text-secondary)]">{item.label}</dt><dd className="font-bold text-[color:var(--c-text-primary)]">{item.value || "—"}</dd></div>
                    ))}
                  </dl>
                  <Link href={`/jobs/${job.slug}`} className="mt-6 inline-flex min-h-11 items-center border-b border-[color:var(--c-deep-ocean)] pb-1 font-black text-[color:var(--c-deep-ocean)]">募集要項を見る →</Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </EditorialIndexShell>
  );
}
