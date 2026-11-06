import Image from "next/image";
import Link from "next/link";
import { IslandPinMark } from "@/components/map/IslandPinMark";
import { TextArrow } from "@/components/ui/TextArrow";
import { selectFirst } from "@/lib/wp/format";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/wp/labels";
import type { JobPosting } from "@/lib/wp/types";

const AREA_ORDER = ["oshidomari", "oniwaki"];

/** 求人一覧のカード。className でグリッドの幅(gridSpanClass)を受け取る */
export function JobCard({ job, className }: { job: JobPosting; className: string }) {
  const fields = job.jobPostingFields;
  const employmentType = selectFirst(fields?.employmentType);
  const imageUrl = fields?.thumbnailImage?.node?.sourceUrl ?? null;
  const imageAlt = fields?.thumbnailImage?.node?.altText ?? `${job.title}の求人写真`;
  // エリアは WP の areas の名前をそのまま出す(並びは鴛泊→鬼脇)。絞り込みで「すべて」のときも場所が分かるように
  const areaNames = [...(job.areas?.nodes ?? [])]
    .sort((a, b) => AREA_ORDER.indexOf(a.slug) - AREA_ORDER.indexOf(b.slug))
    .map((area) => area.name);
  const typeLabel = employmentType ? EMPLOYMENT_TYPE_LABELS[employmentType] ?? employmentType : null;

  return (
    <article className={`${className} overflow-hidden rounded-[var(--radius-2xl)] border border-[color:var(--c-deep-ocean)]/10 bg-white/55`}>
      {imageUrl ? (
        <Link href={`/jobs/${job.slug}`} aria-label={`${job.title}の求人詳細を見る`}>
          <div className="relative aspect-video w-full overflow-hidden bg-[color:var(--c-ice)]">
            <Image src={imageUrl} alt={imageAlt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-contain transition-transform duration-500 hover:scale-[1.02]" />
          </div>
        </Link>
      ) : null}
      <div className="p-6 md:p-8">
        {areaNames.length > 0 || typeLabel ? (
          <p className="flex flex-wrap items-center gap-x-3.5 gap-y-1">
            {areaNames.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-[0.8125rem] font-black tracking-[0.02em] text-[color:var(--c-deep-ocean)]">
                {/* 白いカードの上では中心の白が溶けるので、ピンと分かる 16px より小さくしない */}
                <IslandPinMark className="size-4 flex-none" />
                {areaNames.join("・")}
              </span>
            ) : null}
            {typeLabel ? <span className="text-xs font-black tracking-[0.08em] text-[color:var(--c-accent-text)]">{typeLabel}</span> : null}
          </p>
        ) : null}
        <h2 className="mt-2 text-2xl font-black tracking-[-0.02em] text-[color:var(--c-deep-ocean)]">{job.title}</h2>
        {fields?.catchCopy ? <p className="mt-2 leading-7 text-[color:var(--c-text-secondary)]">{fields.catchCopy}</p> : null}
        <dl className="mt-6 border-t border-[color:var(--c-deep-ocean)]/15 text-sm">
          {[{label:"給与",value:fields?.salary},{label:"勤務時間",value:fields?.workHours},{label:"住居サポート",value:fields?.housingSupportAvailable ? "あり" : "なし"}].map((item)=>(
            <div key={item.label} className="grid grid-cols-[6rem_1fr] gap-4 border-b border-[color:var(--c-deep-ocean)]/15 py-3"><dt className="text-[color:var(--c-text-secondary)]">{item.label}</dt><dd className="font-bold text-[color:var(--c-text-primary)]">{item.value || "—"}</dd></div>
          ))}
        </dl>
        <Link href={`/jobs/${job.slug}`} className="mt-4 inline-flex min-h-11 items-center border-b border-[color:var(--c-deep-ocean)] pb-1 font-black text-[color:var(--c-deep-ocean)]">募集要項を見る<TextArrow /></Link>
      </div>
    </article>
  );
}
