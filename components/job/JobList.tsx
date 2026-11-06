"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useRef, type Ref } from "react";
import { JobCard } from "@/components/job/JobCard";
import { Button } from "@/components/ui/Button";
import { gridSpanClass } from "@/lib/utils/grid-spans";
import {
  buildJobFilterOptions,
  filterJobs,
  jobFilterSearch,
  readJobFilterState,
  type JobFilterKey,
  type JobFilterOption,
  type JobFilterState,
} from "@/lib/utils/job-filters";
import type { JobPosting } from "@/lib/wp/types";

const ALL_STATE: JobFilterState = { type: null, area: null };

const GROUPS: { key: JobFilterKey; legend: string }[] = [
  { key: "type", legend: "雇用形態" },
  { key: "area", legend: "エリア" },
];

/**
 * 求人一覧と、雇用形態・エリアの絞り込み。
 * ページは静的(ISR)のまま、URL の検索パラメータを読んでクライアント側で絞る。
 * useSearchParams を使うので Suspense で囲み、静的 HTML には絞り込み前の全件を出す。
 */
export function JobList({ jobs }: { jobs: JobPosting[] }) {
  return (
    <Suspense fallback={<JobBoard jobs={jobs} state={ALL_STATE} onChange={() => {}} />}>
      <JobListWithParams jobs={jobs} />
    </Suspense>
  );
}

function JobListWithParams({ jobs }: { jobs: JobPosting[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const state = readJobFilterState(searchParams);

  // <a> で移動すると PageTransition が拾うので、履歴を直接書き換える(幕もフェードも出ない)。
  // 絞り込みのたびに履歴を積むと「戻る」で一覧を抜けられないため、置き換えにする
  const handleChange = (next: JobFilterState) => {
    const search = jobFilterSearch(searchParams.toString(), next);
    window.history.replaceState(null, "", `${pathname}${search}${window.location.hash}`);
  };

  return <JobBoard jobs={jobs} state={state} onChange={handleChange} />;
}

type JobBoardProps = {
  jobs: JobPosting[];
  state: JobFilterState;
  onChange: (next: JobFilterState) => void;
};

function JobBoard({ jobs, state, onChange }: JobBoardProps) {
  const firstRadioRef = useRef<HTMLInputElement>(null);
  const filtered = filterJobs(jobs, state);
  const facets = buildJobFilterOptions(jobs, state);
  const isFiltered = state.type !== null || state.area !== null;

  // 解除のボタンは押すと消えるので、フォーカスを絞り込みの先頭(雇用形態の「すべて」)に移す
  const clearAll = () => {
    onChange(ALL_STATE);
    firstRadioRef.current?.focus();
  };

  return (
    <>
      <div role="group" aria-label="求人の絞り込み" className="mb-12 border-y border-[color:var(--c-deep-ocean)]/15 md:mb-16">
        {GROUPS.map(({ key, legend }, groupIndex) => (
          <fieldset
            key={key}
            className="grid gap-3 border-b border-[color:var(--c-deep-ocean)]/15 py-5 md:grid-cols-[7rem_1fr] md:items-start md:gap-6"
          >
            {/* legend は grid の子として並ばないので、見た目の見出しは別に置く */}
            <legend className="sr-only">{legend}</legend>
            <p aria-hidden="true" className="text-sm font-bold text-[color:var(--c-text-secondary)] md:pt-3">
              {legend}
            </p>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                ref={groupIndex === 0 ? firstRadioRef : undefined}
                name={key}
                label="すべて"
                count={facets[key].allCount}
                checked={state[key] === null}
                onSelect={() => onChange({ ...state, [key]: null })}
              />
              {facets[key].options.map((option) => (
                <FilterChip
                  key={option.value}
                  name={key}
                  label={option.label}
                  count={option.count}
                  checked={state[key] === option.value}
                  onSelect={() => onChange({ ...state, [key]: option.value })}
                />
              ))}
            </div>
          </fieldset>
        ))}
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2">
          <p role="status" className="font-bold text-[color:var(--c-deep-ocean)]">
            求人 <span className="text-2xl font-black tabular-nums">{filtered.length}</span>件
            {isFiltered ? (
              <span className="text-sm text-[color:var(--c-text-secondary)]">（全{jobs.length}件中）</span>
            ) : null}
          </p>
          {isFiltered ? (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex min-h-11 cursor-pointer items-center border-b border-[color:var(--c-deep-ocean)] text-sm font-black text-[color:var(--c-deep-ocean)]"
            >
              条件を解除
            </button>
          ) : null}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-12">
          {filtered.map((job, index) => (
            <JobCard key={job.id} job={job} className={gridSpanClass(index)} />
          ))}
        </div>
      ) : (
        <div className="rounded-[var(--radius-2xl)] border border-[color:var(--c-deep-ocean)]/10 bg-white/55 px-6 py-10 md:px-10 md:py-14">
          <p className="text-xl font-black text-[color:var(--c-deep-ocean)] md:text-2xl">
            該当する求人はありません
          </p>
          <p className="mt-3 leading-7 text-[color:var(--c-text-secondary)]">
            雇用形態かエリアを「すべて」に戻すと、ほかの求人が見られます。
          </p>
          <div className="mt-8">
            <Button type="button" variant="aqua" size="md" icon={null} onClick={clearAll}>
              条件を解除
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

type FilterChipProps = {
  ref?: Ref<HTMLInputElement>;
  name: string;
  label: string;
  count: JobFilterOption["count"];
  checked: boolean;
  onSelect: () => void;
};

/** お問い合わせの項目選びと同じ形(枠つきの板、選ぶと紺に塗る)。中身は radio なので矢印キーで選べる */
function FilterChip({ ref, name, label, count, checked, onSelect }: FilterChipProps) {
  return (
    <label
      className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[var(--radius-lg)] border px-4 text-sm font-black transition-colors has-focus-visible:ring-2 has-focus-visible:ring-[color:var(--c-deep-ocean)] has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-[color:var(--c-paper)] ${
        checked
          ? "border-[color:var(--c-deep-ocean)] bg-[color:var(--c-deep-ocean)] text-white"
          : "border-[color:var(--c-deep-ocean)]/15 bg-white/60 text-[color:var(--c-text-primary)] hover:border-[color:var(--c-deep-ocean)]/45"
      }`}
    >
      <input
        ref={ref}
        type="radio"
        name={`job-filter-${name}`}
        checked={checked}
        onChange={onSelect}
        className="sr-only"
      />
      {label}
      <span
        className={`tabular-nums text-xs font-bold ${
          checked ? "text-white/80" : count === 0 ? "text-[color:var(--c-text-secondary)]/80" : "text-[color:var(--c-text-secondary)]"
        }`}
      >
        {count}
        <span className="sr-only">件</span>
      </span>
    </label>
  );
}
