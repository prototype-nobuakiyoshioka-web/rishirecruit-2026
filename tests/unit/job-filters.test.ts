import { describe, expect, it } from "vitest";
import {
  buildJobFilterOptions,
  filterJobs,
  jobFilterSearch,
  readJobFilterState,
} from "@/lib/utils/job-filters";
import type { JobPosting } from "@/lib/wp/types";

const AREAS = {
  oshidomari: { id: "a1", name: "鴛泊", slug: "oshidomari" },
  oniwaki: { id: "a2", name: "鬼脇", slug: "oniwaki" },
  kutsugata: { id: "a3", name: "沓形", slug: "kutsugata" },
};

function job(id: string, type: string | null, area: keyof typeof AREAS | null): JobPosting {
  return {
    id,
    slug: id,
    title: id,
    areas: { nodes: area ? [AREAS[area]] : [] },
    jobPostingFields: { employmentType: type ? [type] : null },
  } as unknown as JobPosting;
}

const JOBS = [
  job("1", "seishain", "oniwaki"),
  job("2", "seishain", "oshidomari"),
  job("3", "part_time", "oniwaki"),
  job("4", "temporary", "oniwaki"),
  job("5", "seishain", "oniwaki"),
];

describe("filterJobs", () => {
  it("両方とも「すべて」なら全件", () => {
    expect(filterJobs(JOBS, { type: null, area: null })).toHaveLength(5);
  });

  it("雇用形態とエリアを組み合わせて絞る", () => {
    expect(filterJobs(JOBS, { type: "seishain", area: "oniwaki" }).map((j) => j.id)).toEqual(["1", "5"]);
    expect(filterJobs(JOBS, { type: "temporary", area: "oshidomari" })).toHaveLength(0);
  });

  it("存在しない値は 0 件", () => {
    expect(filterJobs(JOBS, { type: "unknown", area: null })).toHaveLength(0);
  });
});

describe("buildJobFilterOptions", () => {
  it("選択肢はデータにある値だけで、決まった順に並ぶ", () => {
    const facets = buildJobFilterOptions(JOBS, { type: null, area: null });
    expect(facets.type.options.map((o) => [o.label, o.count])).toEqual([
      ["正社員", 3],
      ["アルバイト・パート", 1],
      ["臨時職員", 1],
    ]);
    expect(facets.area.options.map((o) => [o.label, o.count])).toEqual([
      ["鴛泊", 1],
      ["鬼脇", 4],
    ]);
    expect(facets.type.allCount).toBe(5);
  });

  it("件数は、もう一方の条件を今の選択にしたときの数", () => {
    const facets = buildJobFilterOptions(JOBS, { type: null, area: "oshidomari" });
    expect(facets.type.allCount).toBe(1);
    expect(facets.type.options.map((o) => o.count)).toEqual([1, 0, 0]);
    // エリア側は雇用形態が「すべて」なので変わらない
    expect(facets.area.options.map((o) => o.count)).toEqual([1, 4]);
  });

  it("表にない雇用形態・エリアも、値のまま後ろに出る", () => {
    const facets = buildJobFilterOptions([...JOBS, job("6", "intern", "kutsugata")], { type: null, area: null });
    expect(facets.type.options.at(-1)).toEqual({ value: "intern", label: "intern", count: 1 });
    expect(facets.area.options.at(-1)).toEqual({ value: "kutsugata", label: "沓形", count: 1 });
  });
});

describe("readJobFilterState / jobFilterSearch", () => {
  it("検索パラメータを読む。空は「すべて」", () => {
    expect(readJobFilterState(new URLSearchParams("type=seishain&area="))).toEqual({ type: "seishain", area: null });
    expect(readJobFilterState(null)).toEqual({ type: null, area: null });
  });

  it("ほかのパラメータは残し、「すべて」は消す", () => {
    expect(jobFilterSearch("utm_source=x&type=part_time", { type: null, area: "oniwaki" })).toBe(
      "?utm_source=x&area=oniwaki",
    );
    expect(jobFilterSearch("type=seishain", { type: null, area: null })).toBe("");
  });
});
