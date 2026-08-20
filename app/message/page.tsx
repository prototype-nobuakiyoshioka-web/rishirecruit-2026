import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "利尻富士町で働くということ",
  description:
    "北海道・利尻富士町で仕事を探す方へ。島で働く意味、暮らしの特徴、応募前に確かめたいことをお伝えします。",
  path: "/message",
});

const STORIES = [
  {
    eyebrow: "Work and community",
    title: "仕事の先に、\n島の日常がある。",
    body: [
      "利尻富士町は、北海道の北、日本海に浮かぶ利尻島の町です。人口は約2,000人。島の中央に利尻山がそびえ、その裾野に、海とともにある暮らしが広がっています。",
      "ここでの仕事は、職場の中だけで完結しません。医療や福祉、行政など、一つひとつの仕事が、島で暮らす人の日常を支えています。自分の仕事が誰の役に立っているのかを、近い距離で感じられる町です。",
    ],
  },
  {
    eyebrow: "Living together",
    title: "人との近さを、\n力に変える。",
    body: [
      "道ですれ違えば挨拶を交わし、困っている人がいれば声をかける。利尻富士町には、顔が見える距離で支え合う日常があります。初めて島へ来た人を気にかけてくれる人もいます。",
      "一方で、小さな町だからこそ、一人ひとりの役割も見えやすくなります。待っているだけではなく、自分から話を聞き、相手を知ろうとすること。その積み重ねが、仕事にも暮らしにもつながっていきます。",
    ],
  },
];

const DECISION_POINTS = [
  {
    number: "01",
    title: "仕事から見る",
    body: "移住を先に決める必要はありません。まずは仕事内容、雇用形態、給与、勤務時間を見て、自分の経験や希望と重なる仕事があるかを確かめてください。",
  },
  {
    number: "02",
    title: "暮らしまで確かめる",
    body: "冬の雪や風、住まい、買い物、通院、島外への移動。都市とは異なる日常も含めて、自分の暮らしに合う場所かどうかを考えることが大切です。",
  },
  {
    number: "03",
    title: "話してから決める",
    body: "求人票だけでは分からないことがあるのは当然です。住居サポートの有無は各求人で確認し、残った疑問は応募前にお問い合わせください。",
  },
];

export default function MessagePage() {
  return (
    <main className="overflow-hidden bg-[#1a8fa8]">
      <section
        className="relative overflow-hidden pb-28 pt-40 md:pb-40 md:pt-44"
        style={{
          background:
            "radial-gradient(circle at 82% 24%, rgba(127, 227, 232, 0.64), transparent 26%), linear-gradient(180deg, #4FA8D5 0%, #2BA8C4 58%, #1A8FA8 100%)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-repeat opacity-[0.14] mix-blend-multiply"
          style={{
            backgroundImage: "url('/images/message/bg-textre.webp')",
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-[var(--container-max)] px-[var(--space-6)]">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--c-warning)] md:text-base">
            Message from Rishirifuji
          </p>
          <h1 className="mt-[var(--space-5)] max-w-4xl text-balance text-5xl font-black leading-[1.12] tracking-[-0.035em] text-[color:var(--c-deep-ocean)] md:text-7xl">
            利尻富士町ではたらく。
            <br />
            島とつながる。
          </h1>
          <p className="mt-[var(--space-6)] max-w-xl text-base font-bold leading-8 text-[color:var(--c-deep-ocean)]/80 md:text-xl md:leading-9">
            北海道・利尻富士町の求人と、
            <br />
            その先にある暮らしを伝える求人ポータルです。
          </p>

          <figure className="mt-12 md:mt-16">
            <Image
              src="/images/message/rishirifuji-hokkaidou.png"
              alt="北海道に対する利尻島の位置を示した図"
              width={1920}
              height={1080}
              priority
              sizes="(max-width: 768px) calc(100vw - 48px), 1200px"
              className="h-auto w-full object-contain"
            />
          </figure>
        </div>
      </section>

      <article className="relative z-10 mx-auto -mt-16 max-w-[1320px] overflow-hidden rounded-t-[2.5rem] bg-[color:var(--c-paper)] md:-mt-24 md:rounded-t-[4rem]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-repeat opacity-[0.035]"
          style={{
            backgroundImage: "url('/images/message/bg-textre.webp')",
          }}
        />

        <header className="relative mx-auto grid max-w-[1080px] gap-10 px-[var(--space-6)] pb-20 pt-20 md:grid-cols-[13rem_1fr] md:gap-20 md:pb-28 md:pt-28">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--c-warning)]">
              Message
            </p>
            <p className="mt-2 text-sm font-bold text-[color:var(--c-text-secondary)]">
              島を選ぶ前に
            </p>
          </div>
          <div>
            <h2 className="text-balance text-3xl font-black leading-tight tracking-[-0.025em] text-[color:var(--c-deep-ocean)] md:text-5xl md:leading-[1.2]">
              きれいな景色だけで、
              <br />
              働く場所は決められない。
            </h2>
            <div className="mt-8 grid max-w-3xl gap-5 text-base leading-8 text-[color:var(--c-text-secondary)] md:text-lg md:leading-9">
              <p>
                求人票の条件だけでも、島の美しさだけでも、働く場所を決めることはできません。
              </p>
              <p>
                仕事のことも、暮らしのことも。利尻富士町を選ぶ前に、知ってほしいことを正直にお伝えします。
              </p>
            </div>
          </div>
        </header>

        <div className="relative mx-auto max-w-[1080px] px-[var(--space-6)]">
          {STORIES.map((story) => (
            <section
              key={story.eyebrow}
              className="grid gap-10 border-t border-[color:var(--c-deep-ocean)]/15 py-16 md:grid-cols-[minmax(16rem,0.85fr)_1.15fr] md:gap-24 md:py-24"
            >
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[color:var(--c-warning)]">
                  {story.eyebrow}
                </p>
                <h2 className="mt-5 whitespace-pre-line text-3xl font-black leading-tight tracking-[-0.025em] text-[color:var(--c-deep-ocean)] md:text-4xl">
                  {story.title}
                </h2>
              </div>
              <div className="grid gap-6 text-base leading-8 text-[color:var(--c-text-secondary)] md:text-lg md:leading-9">
                {story.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="relative mx-auto max-w-[1080px] border-t border-[color:var(--c-deep-ocean)]/15 px-[var(--space-6)] py-20 md:py-28">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[color:var(--c-warning)]">
            Before you decide
          </p>
          <h2 className="mt-5 max-w-3xl text-balance text-3xl font-black leading-tight tracking-[-0.025em] text-[color:var(--c-deep-ocean)] md:text-5xl md:leading-[1.2]">
            次の行き先を選ぶために、
            <br />
            大切にしてほしいこと。
          </h2>

          <div className="mt-14 md:mt-20">
            {DECISION_POINTS.map((point) => (
              <section
                key={point.number}
                className="grid gap-5 border-t border-[color:var(--c-deep-ocean)]/15 py-10 md:grid-cols-[5rem_15rem_1fr] md:items-start md:gap-10 md:py-12"
              >
                <p className="text-sm font-black tracking-[0.14em] text-[color:var(--c-warning)]">
                  {point.number}
                </p>
                <h3 className="text-2xl font-black tracking-[-0.02em] text-[color:var(--c-deep-ocean)]">
                  {point.title}
                </h3>
                <p className="text-base leading-8 text-[color:var(--c-text-secondary)] md:text-lg md:leading-9">
                  {point.body}
                </p>
              </section>
            ))}
          </div>
        </section>

        <aside className="relative overflow-hidden bg-[color:var(--c-deep-ocean)] px-[var(--space-6)] py-20 text-[color:var(--c-text-inverse)] md:py-28">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-repeat opacity-[0.08]"
            style={{
              backgroundImage: "url('/images/message/bg-textre.webp')",
            }}
          />
          <div className="relative mx-auto grid max-w-[1080px] gap-10 md:grid-cols-[1fr_auto] md:items-end md:gap-20">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--c-warning)]">
                Next / Jobs
              </p>
              <h2 className="mt-5 max-w-3xl text-balance text-3xl font-black leading-snug tracking-[-0.025em] md:text-5xl md:leading-tight">
                まずは、今ある仕事を
                <br />
                見るところから。
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--c-ice)] md:text-lg md:leading-9">
                気になる求人があるか、仕事内容や条件が自分に合うか。応募するかどうかは、それを確かめてからでかまいません。
              </p>
            </div>
            <Button variant="primary" href="/jobs">
              募集中の仕事を見る →
            </Button>
          </div>
          <div className="relative mx-auto mt-10 flex max-w-[1080px] flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-8 text-sm font-bold text-[color:var(--c-ice)] md:text-base">
            <Link href="/voices" className="hover:underline">
              移住者の声を読む →
            </Link>
            <Link href="/contact" className="hover:underline">
              応募前に相談する →
            </Link>
          </div>
        </aside>
      </article>
    </main>
  );
}
