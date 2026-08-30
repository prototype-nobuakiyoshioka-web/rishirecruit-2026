import type { Metadata } from "next";
import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildMetadata, ogImageFromField } from "@/lib/seo";
import { imageFromField, splitByBr, htmlToText } from "@/lib/wp/format";
import {
  getTestimonialBySlug,
  getTestimonials,
} from "@/lib/wp/queries/voices";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const voices = await getTestimonials();

  return voices.map((voice) => ({ slug: voice.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const voice = await getTestimonialBySlug(slug);

  if (!voice) return {};

  const catchCopyText = htmlToText(voice.testimonialFields?.catchCopy);

  return buildMetadata({
    title: `${voice.title}｜移住者の声`,
    description:
      catchCopyText || "利尻富士町へ移住し、島で働く人のインタビューです。",
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
  const photo = imageFromField(
    fields?.photo,
    "/placeholders/voice.svg",
    "移住者の声のプレースホルダー",
  );
  const qaList = (fields?.qaList ?? []).filter(
    (qa): qa is { question: string; answer: string } =>
      Boolean(qa?.question && qa?.answer),
  );

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
                {fields?.age ?? "移住者インタビュー"}
              </p>
              <h1 className="mt-5 text-balance text-4xl font-black leading-tight tracking-[-0.03em] text-[color:var(--c-deep-ocean)] md:text-6xl">
                {fields?.catchCopy
                  ? splitByBr(fields.catchCopy).map((seg, i, arr) => (
                      <Fragment key={i}>
                        {seg}
                        {i < arr.length - 1 ? <br /> : null}
                      </Fragment>
                    ))
                  : voice.title}
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

        <section className="relative mx-auto grid max-w-[1080px] gap-10 px-[var(--space-6)] pb-20 pt-20 md:grid-cols-[13rem_1fr] md:gap-20 md:pb-28 md:pt-28">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--c-warning)]">
              Interview
            </p>
            <p className="mt-2 text-sm font-bold text-[color:var(--c-text-secondary)]">
              本人の言葉
            </p>
          </div>
          <div>
            {qaList.length > 0 ? (
              <dl className="divide-y divide-[color:var(--c-deep-ocean)]/15">
                {qaList.map((qa, index) => (
                  <div key={index} className="py-8 first:pt-0 last:pb-0 md:py-10">
                    <dt className="text-lg font-black leading-snug text-[color:var(--c-deep-ocean)] md:text-xl">
                      {qa.question}
                    </dt>
                    <dd className="mt-4 text-base leading-9 text-[color:var(--c-text-secondary)] md:text-lg md:leading-10">
                      {splitByBr(qa.answer).map((seg, i, arr) => (
                        <Fragment key={i}>
                          {seg}
                          {i < arr.length - 1 ? <br /> : null}
                        </Fragment>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-base leading-9 text-[color:var(--c-text-secondary)]">
                インタビュー本文を準備しています。
              </p>
            )}
          </div>
        </section>

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
                自分につながる仕事を探す。
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--c-ice)] md:text-lg">
                今募集中の仕事から、あなたに合う選択肢を確かめてください。
              </p>
            </div>
            <Button variant="primary" href="/jobs">
              求人一覧を見る →
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
