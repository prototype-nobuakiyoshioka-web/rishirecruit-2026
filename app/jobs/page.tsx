import type { Metadata } from "next";
import { JobList } from "@/components/job/JobList";
import { EditorialIndexShell } from "@/components/ui/EditorialIndexShell";
import { buildMetadata } from "@/lib/seo";
import { getJobPostings } from "@/lib/wp/queries/jobs";

export const metadata: Metadata = buildMetadata({
  title: "利尻富士町の求人",
  description:
    "利尻富士町で募集中の求人一覧。仕事内容、雇用形態、給与、勤務時間、住居サポートを確認できます。",
  path: "/jobs",
});

export default async function JobsPage() {
  const jobs = await getJobPostings();

  return (
    <EditorialIndexShell
      eyebrow="Jobs in Rishirifuji"
      title={<>あなたの<wbr />行き先を、<br />ここから。</>}
      lead={<>利尻富士町で募集中の仕事を、<br />条件と暮らしの両方から確かめられます。</>}
      introLabel="現在募集中の仕事"
      introTitle={<>島で暮らすことを、<br />仕事から考える。</>}
      introBody="職種名だけでなく、仕事内容、給与、勤務時間、住居サポートまで。気になる求人を開き、自分の経験や希望と重なる部分があるかを確かめてください。"
    >
      <section className="relative mx-auto max-w-[1080px] px-[var(--space-6)] pb-20 md:pb-28">
        <JobList jobs={jobs} />
      </section>
    </EditorialIndexShell>
  );
}
