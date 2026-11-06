// 求人一覧(/jobs)の絞り込み。選択肢と件数は WP のデータから作り、
// 雇用形態やエリアが増えてもコードを直さずに出るようにする。
// 状態は URL の検索パラメータ(?type=seishain&area=oniwaki)に持つ。

import { AREA_INFO } from "@/lib/constants/areas";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/wp/labels";
import type { JobPosting } from "@/lib/wp/types";

export const JOB_FILTER_PARAMS = { type: "type", area: "area" } as const;

export type JobFilterKey = keyof typeof JOB_FILTER_PARAMS;

/** null は「すべて」 */
export type JobFilterState = Record<JobFilterKey, string | null>;

export type JobFilterOption = {
  value: string;
  label: string;
  /** もう一方の条件を今の選択のままにしたときの件数 */
  count: number;
};

function employmentTypesOf(job: JobPosting): string[] {
  return job.jobPostingFields?.employmentType ?? [];
}

function areasOf(job: JobPosting) {
  return job.areas?.nodes ?? [];
}

function matches(job: JobPosting, key: JobFilterKey, value: string | null) {
  if (value === null) return true;
  return key === "type"
    ? employmentTypesOf(job).includes(value)
    : areasOf(job).some((area) => area.slug === value);
}

export function filterJobs(jobs: JobPosting[], state: JobFilterState) {
  return jobs.filter((job) => matches(job, "type", state.type) && matches(job, "area", state.area));
}

/** 並びは決まった順(雇用形態はラベル表の順、エリアは鴛泊 → 鬼脇)。表にない値は、出てきた順で後ろに足す */
function orderBy(order: string[]) {
  return (a: { value: string }, b: { value: string }) => {
    const ia = order.indexOf(a.value);
    const ib = order.indexOf(b.value);
    return (ia === -1 ? order.length : ia) - (ib === -1 ? order.length : ib);
  };
}

/** データに出てくる値だけを選択肢にする(0件の値は出さない) */
function collectOptions(jobs: JobPosting[], key: JobFilterKey) {
  const options = new Map<string, string>();
  for (const job of jobs) {
    if (key === "type") {
      for (const type of employmentTypesOf(job)) {
        options.set(type, EMPLOYMENT_TYPE_LABELS[type] ?? type);
      }
    } else {
      for (const area of areasOf(job)) {
        options.set(area.slug, area.name);
      }
    }
  }
  const order = key === "type" ? Object.keys(EMPLOYMENT_TYPE_LABELS) : Object.keys(AREA_INFO);
  // Array.prototype.sort は安定ソートなので、表にない値は出てきた順のまま
  return [...options].map(([value, label]) => ({ value, label })).sort(orderBy(order));
}

export function buildJobFilterOptions(jobs: JobPosting[], state: JobFilterState) {
  const countWith = (key: JobFilterKey, value: string | null) => {
    const other: JobFilterKey = key === "type" ? "area" : "type";
    return jobs.filter((job) => matches(job, key, value) && matches(job, other, state[other])).length;
  };

  const build = (key: JobFilterKey) => ({
    /** 「すべて」の件数 */
    allCount: countWith(key, null),
    options: collectOptions(jobs, key).map<JobFilterOption>((option) => ({
      ...option,
      count: countWith(key, option.value),
    })),
  });

  return { type: build("type"), area: build("area") };
}

type ParamsLike = { get(name: string): string | null };

export function readJobFilterState(params: ParamsLike | null): JobFilterState {
  const read = (key: JobFilterKey) => params?.get(JOB_FILTER_PARAMS[key])?.trim() || null;
  return { type: read("type"), area: read("area") };
}

/** 今の検索パラメータに絞り込みを反映した文字列(先頭の ? を含む。何もなければ "") */
export function jobFilterSearch(current: string, state: JobFilterState) {
  const params = new URLSearchParams(current);
  for (const key of Object.keys(JOB_FILTER_PARAMS) as JobFilterKey[]) {
    const value = state[key];
    if (value) {
      params.set(JOB_FILTER_PARAMS[key], value);
    } else {
      params.delete(JOB_FILTER_PARAMS[key]);
    }
  }
  const search = params.toString();
  return search ? `?${search}` : "";
}
