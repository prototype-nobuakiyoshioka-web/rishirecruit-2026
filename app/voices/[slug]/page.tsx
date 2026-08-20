import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildMetadata, ogImageFromField } from "@/lib/seo";
import { galleryFromField, imageFromField, selectFirst } from "@/lib/wp/format";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/wp/labels";
import {
  getTestimonialBySlug,
  getTestimonials,
} from "@/lib/wp/queries/voices";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function paragraphsFromHtml(value: string | null | undefined): string[] {
  return (value ?? "")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li)>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([\da-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export async function generateStaticParams() {
  const voices = await getTestimonials();

  return voices.map((voice) => ({ slug: voice.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const voice = await getTestimonialBySlug(slug);

  if (!voice) return {};

  return buildMetadata({
    title: `${voice.title}｜移住者の声`,
    description:
      voice.testimonialFields?.leadText ??
      "利尻富士町へ移住し、島で働く人のインタビューです。",
    path: `/voices/${slug}`,
    image: ogImageFromField(
      voice.testimonialFields?.photo,
      `${voice.title}の写真`,
    ),
    article: true,
  });
}

export default async function VoiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const voice = await getTestimonialBySlug(slug);

  if (!voice) notFound();

  const fields = voice.testimonialFields;
  const relatedJob = fields?.relatedJob?.nodes?.[0] ?? null;
  const relatedEmploymentType = selectFirst(
    relatedJob?.jobPostingFields?.employmentType,
  );
  const photo = imageFromField(
    fields?.photo,
    "/placeholders/voice.svg",
    "移住者の声のプレースホルダー",
  );
  const galleryImages = galleryFromField(fields?.galleryImages);
  const interviewParagraphs = paragraphsFromHtml(fields?.interviewBody);

  return (
    <main className="overflow-hidden bg-[#1a8fa8]">
      <section
        className="relative pb-32 pt-36 md:pb-44 md:pt-40"
        style={{
          background:
            "radial-gradient(circle at 78% 18%, rgba(201, 226, 240, 0.78), transparent 27%), linear-gradient(160deg, #5BB4E0 0%, #37A9C7 55%, #1A8FA8 100%)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-repeat opacity-[0.14] mix-blend-multiply"
          style={{ backgroundImage: "url('/images/message/bg-textre.webp')" }}
        />
        <div className="relative mx-auto max-w-[var(--container-max)] px-[var(--space-6)]">
          <Breadcrumbs
            items={[
              { label: "ホーム", href: "/" },
              { label: "移住者の声", href: "/voices" },
              { label: voice.title },
            ]}
          />

          <div className="mt-12 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-20">
            <div className="pb-2">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--c-warning)]">
                Voice / Interview
              </p>
              <p className="mt-5 text-sm font-bold text-[color:var(--c-deep-ocean)]/70">
                {fields?.migrationYear
                  ? `${fields.migrationYear} 移住`
                  : "移住者インタビュー"}
              </p>
              <h1 className="mt-5 text-balance text-4xl font-black leading-tight tracking-[-0.03em] text-[color:var(--c-deep-ocean)] md:text-6xl">
                {fields?.catchCopy ?? voice.title}
              </h1>
              <p className="mt-6 text-lg font-black text-[color:var(--c-deep-ocean)]">
                {voice.title}
              </p>
            </div>
            <Image
              src={photo.sourceUrl}
              alt={photo.altText || `${voice.title}の写真`}
              width={1200}
              height={900}
              priority
              className="aspect-[4/3] w-full rounded-[var(--radius-2xl)] object-cover"
            />
          </div>
        </div>
      </section>

      <article className="relative z-10 mx-auto -mt-16 max-w-[1320px] overflow-hidden rounded-t-[2.5rem] bg-[color:var(--c-paper)] md:-mt-24 md:rounded-t-[4rem]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-repeat opacity-[0.035]"
          style={{ backgroundImage: "url('/images/message/bg-textre.webp')" }}
        />

        <section className="relative mx-auto max-w-[1080px] px-[var(--space-6)] pb-20 pt-20 md:pb-28 md:pt-28">
          <div className="grid gap-10 md:grid-cols-[13rem_1fr] md:gap-20">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--c-warning)]">
                Profile
              </p>
              <p className="mt-2 text-sm font-bold text-[color:var(--c-text-secondary)]">
                移住前と現在
              </p>
            </div>
            <div>
              {fields?.leadText ? (
                <p className="text-balance text-2xl font-black leading-relaxed tracking-[-0.02em] text-[color:var(--c-deep-ocean)] md:text-3xl">
                  {fields.leadText}
                </p>
              ) : null}
              <dl className="mt-10 border-t border-[color:var(--c-deep-ocean)]/15">
                {[
                  { label: "移住前", value: fields?.profileBefore },
                  { label: "現在", value: fields?.profileAfter },
                  { label: "移住年", value: fields?.migrationYear },
                ]
                  .filter((item) => item.value)
                  .map((item) => (
                    <div
                      key={item.label}
                      className="grid grid-cols-[6rem_1fr] gap-6 border-b border-[color:var(--c-deep-ocean)]/15 py-5 text-sm md:grid-cols-[8rem_1fr] md:text-base"
                    >
                      <dt className="font-bold text-[color:var(--c-text-secondary)]">
                        {item.label}
                      </dt>
                      <dd className="font-black text-[color:var(--c-text-primary)]">
                        {item.value}
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>
          </div>
        </section>

        <section className="relative mx-auto grid max-w-[1080px] gap-10 border-t border-[color:var(--c-deep-ocean)]/15 px-[var(--space-6)] py-20 md:grid-cols-[13rem_1fr] md:gap-20 md:py-28">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--c-warning)]">
              Interview
            </p>
            <p className="mt-2 text-sm font-bold text-[color:var(--c-text-secondary)]">
              本人の言葉
            </p>
          </div>
          <div className="grid gap-7 text-base leading-9 text-[color:var(--c-text-secondary)] md:text-lg md:leading-10">
            {interviewParagraphs.length > 0 ? (
              interviewParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))
            ) : (
              <p>インタビュー本文を準備しています。</p>
            )}
          </div>
        </section>

        {galleryImages.length > 0 ? (
          <section className="relative mx-auto max-w-[1080px] border-t border-[color:var(--c-deep-ocean)]/15 px-[var(--space-6)] py-20 md:py-28">
            <div className="grid gap-10 md:grid-cols-[13rem_1fr] md:gap-20">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--c-warning)]">
                  Island life
                </p>
                <p className="mt-2 text-sm font-bold text-[color:var(--c-text-secondary)]">
                  暮らしの風景
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {galleryImages.map((image, index) => (
                  <Image
                    key={`${image.sourceUrl}-${index}`}
                    src={image.sourceUrl}
                    alt={image.altText}
                    width={1200}
                    height={900}
                    className={`aspect-[4/3] w-full rounded-[var(--radius-2xl)] object-cover ${
                      index === 0 && galleryImages.length % 2 === 1
                        ? "md:col-span-2"
                        : ""
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <aside className="relative overflow-hidden bg-[color:var(--c-deep-ocean)] px-[var(--space-6)] py-20 text-[color:var(--c-text-inverse)] md:py-28">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-repeat opacity-[0.08]"
            style={{ backgroundImage: "url('/images/message/bg-textre.webp')" }}
          />
          <div className="relative mx-auto grid max-w-[1080px] gap-10 md:grid-cols-[1fr_auto] md:items-end md:gap-20">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--c-warning)]">
                Next / Jobs
              </p>
              <h2 className="mt-5 max-w-3xl text-balance text-3xl font-black leading-snug tracking-[-0.025em] md:text-5xl md:leading-tight">
                {relatedJob
                  ? "この人につながる仕事を見る。"
                  : "自分につながる仕事を探す。"}
              </h2>
              {relatedJob ? (
                <div className="mt-6">
                  <p className="text-sm font-bold text-[color:var(--c-ice)]">
                    {relatedEmploymentType
                      ? EMPLOYMENT_TYPE_LABELS[relatedEmploymentType] ??
                        relatedEmploymentType
                      : "関連求人"}
                  </p>
                  <p className="mt-2 text-xl font-black md:text-2xl">
                    {relatedJob.title}
                  </p>
                  {relatedJob.jobPostingFields?.catchCopy ? (
                    <p className="mt-3 max-w-2xl text-base leading-8 text-[color:var(--c-ice)]">
                      {relatedJob.jobPostingFields.catchCopy}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--c-ice)] md:text-lg">
                  今募集中の仕事から、あなたに合う選択肢を確かめてください。
                </p>
              )}
            </div>
            <Button
              variant="primary"
              href={relatedJob ? `/jobs/${relatedJob.slug}` : "/jobs"}
            >
              {relatedJob ? "関連する求人を見る →" : "求人一覧を見る →"}
            </Button>
          </div>
          <div className="relative mx-auto mt-10 max-w-[1080px] border-t border-white/15 pt-8">
            <Link
              href="/voices"
              className="text-sm font-bold text-[color:var(--c-ice)] hover:underline md:text-base"
            >
              ← 移住者の声一覧へ
            </Link>
          </div>
        </aside>
      </article>
    </main>
  );
}
