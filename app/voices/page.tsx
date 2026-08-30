import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { imageFromField, splitByBr } from "@/lib/wp/format";
import { Button } from "@/components/ui/Button";
import { VoiceVideoPlayer } from "@/components/ui/VoiceVideoPlayer";
import { buildMetadata } from "@/lib/seo";
import { getTestimonials } from "@/lib/wp/queries/voices";
import { getVoiceVideos } from "@/lib/wp/queries/voice-videos";
import { extractYouTubeVideoId, fetchYouTubeOEmbed } from "@/lib/utils/youtube";
import { gridSpanClass } from "@/lib/utils/grid-spans";

export const metadata: Metadata = buildMetadata({
  title: "移住者の声",
  description:
    "利尻富士町へ移住し、島で働く人たちの声。移住前の暮らし、仕事、冬の生活、人とのつながりを本人の言葉で紹介します。",
  path: "/voices",
});

export default async function VoicesPage() {
  const [voices, videos] = await Promise.all([
    getTestimonials(),
    getVoiceVideos(),
  ]);

  // 動画メタ(表示用タイトル)を YouTube oEmbed から並列取得。
  // post_title には YouTube URL がそのまま入っている前提。
  const videoItems = await Promise.all(
    videos.map(async (video) => {
      const videoId = extractYouTubeVideoId(video.title);
      if (!videoId) return null;
      const oembed = await fetchYouTubeOEmbed(video.title);
      return {
        id: video.id,
        videoId,
        title: oembed?.title ?? video.title,
      };
    }),
  ).then((items) => items.filter((v): v is NonNullable<typeof v> => v !== null));

  return (
    <main className="overflow-hidden bg-[#1a8fa8]">
      <section
        className="relative pb-32 pt-40 md:pb-44 md:pt-48"
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
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--c-warning)] md:text-base">
            Voices from the island
          </p>
          <h1 className="mt-5 max-w-4xl text-balance text-5xl font-black leading-[1.12] tracking-[-0.035em] text-[color:var(--c-deep-ocean)] md:text-7xl">
            ここに来た人たちの、
            <br />
            声。
          </h1>
          <p className="mt-6 max-w-2xl text-base font-bold leading-8 text-[color:var(--c-deep-ocean)]/80 md:text-xl md:leading-9">
            仕事、住まい、冬のこと、人との距離。
            <br />
            島を選んだ人の言葉から、移住後の日常をたどります。
          </p>
        </div>
      </section>

      <article className="relative z-10 mx-auto -mt-16 max-w-[1320px] overflow-hidden rounded-t-[2.5rem] bg-[color:var(--c-paper)] md:-mt-24 md:rounded-t-[4rem]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-repeat opacity-[0.035]"
          style={{ backgroundImage: "url('/images/message/bg-textre.webp')" }}
        />

        <header className="relative mx-auto grid max-w-[1080px] gap-10 px-[var(--space-6)] pb-20 pt-20 md:grid-cols-[13rem_1fr] md:gap-20 md:pb-28 md:pt-28">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--c-warning)]">
              Real stories
            </p>
            <p className="mt-2 text-sm font-bold text-[color:var(--c-text-secondary)]">
              島で働く人たち
            </p>
          </div>
          <div>
            <h2 className="text-balance text-3xl font-black leading-tight tracking-[-0.025em] text-[color:var(--c-deep-ocean)] md:text-5xl md:leading-[1.2]">
              求人票の向こうにある、
              <br />
              一人ひとりの暮らし。
            </h2>
            <p className="mt-8 max-w-3xl text-base leading-8 text-[color:var(--c-text-secondary)] md:text-lg md:leading-9">
              島での暮らしに、ひとつの正解はありません。移住前に感じていたこと、働き始めて分かったこと、今も戸惑うこと。実際に暮らす人の経験を、あなたの判断材料として読んでください。
            </p>
          </div>
        </header>

        {videoItems.length > 0 ? (
          <section className="relative mx-auto max-w-[960px] px-[var(--space-6)] pb-24 md:pb-32">
            <div className="mb-10 text-center md:mb-14">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--c-warning)]">
                Video interviews
              </p>
            </div>
            <div className="flex flex-col items-center gap-16 md:gap-20">
              {videoItems.map((video) => (
                <article
                  key={video.id}
                  className="flex w-full flex-col items-center gap-5"
                >
                  <h4 className="w-full text-balance text-center text-xl font-black leading-snug text-[color:var(--c-deep-ocean)] md:text-2xl">
                    {video.title}
                  </h4>
                  <div className="w-full">
                    <VoiceVideoPlayer
                      videoId={video.videoId}
                      title={video.title}
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="relative mx-auto max-w-[1080px] px-[var(--space-6)] pb-20 md:pb-28">
          {voices.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-12">
              {voices.map((voice, index) => {
                const fields = voice.testimonialFields;
                const photo = imageFromField(
                  fields?.photo,
                  "/placeholders/voice.svg",
                  "移住者の声のプレースホルダー",
                );

                return (
                  <article key={voice.id} className={gridSpanClass(index)}>
                    <Link
                      href={`/voices/${voice.slug}`}
                      aria-label={`${voice.title}の話を読む`}
                    >
                      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[var(--radius-2xl)] bg-[color:var(--c-ice)]">
                        <Image
                          src={photo.sourceUrl}
                          alt={photo.altText || `${voice.title}の写真`}
                          fill
                          sizes="(min-width: 768px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 hover:scale-[1.02]"
                        />
                      </div>
                    </Link>
                    <div className="mt-6">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[color:var(--c-warning)]">
                        Voice {String(index + 1).padStart(2, "0")}
                      </p>
                      <p className="mt-3 text-sm font-bold text-[color:var(--c-text-secondary)]">
                        {fields?.age ?? "移住者インタビュー"}
                      </p>
                      <h2 className="mt-3 text-balance text-2xl font-black leading-tight tracking-[-0.025em] text-[color:var(--c-deep-ocean)] md:text-3xl">
                        {fields?.catchCopy
                          ? splitByBr(fields.catchCopy).map((seg, i, arr) => (
                              <Fragment key={i}>
                                {seg}
                                {i < arr.length - 1 ? <br /> : null}
                              </Fragment>
                            ))
                          : voice.title}
                      </h2>
                      <p className="mt-3 text-base font-bold text-[color:var(--c-text-primary)]">
                        {voice.title}
                      </p>
                      <Link
                        href={`/voices/${voice.slug}`}
                        className="mt-5 inline-flex min-h-11 items-center border-b border-[color:var(--c-deep-ocean)] pb-1 text-base font-black text-[color:var(--c-deep-ocean)] transition-opacity hover:opacity-65"
                      >
                        この人の話を読む →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="border-y border-[color:var(--c-deep-ocean)]/15 py-16 text-center md:py-24">
              <p className="text-2xl font-black text-[color:var(--c-deep-ocean)]">
                新しいインタビューを準備しています。
              </p>
              <p className="mt-4 text-base leading-8 text-[color:var(--c-text-secondary)]">
                公開まで、募集中の仕事をご覧ください。
              </p>
            </div>
          )}
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
              <h2 className="mt-5 text-balance text-3xl font-black leading-snug tracking-[-0.025em] md:text-5xl md:leading-tight">
                誰かの経験を、
                <br />
                自分の選択肢へ。
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--c-ice)] md:text-lg md:leading-9">
                島で働くイメージが少し見えてきたら、現在募集中の仕事を確かめてみてください。
              </p>
            </div>
            <Button variant="primary" href="/jobs">
              募集中の仕事を見る →
            </Button>
          </div>
        </aside>
      </article>
    </main>
  );
}
