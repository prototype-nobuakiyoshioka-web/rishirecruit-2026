import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";

const MESSAGE_SECTIONS = [
  {
    title: "(挨拶)",
    body: [
      "こんにちは。利尻富士町からです。このページを開いてくれて、ありがとうございます。",
      "あなたが「次の行き先」を探しているなら、すこしお話しさせてください。",
    ],
  },
  {
    title: "利尻富士町ってどんな町",
    body: [
      "本文は準備中です。利尻富士町の場所・人口・自然・産業についての紹介が入ります。",
      "海と山が近くにある暮らし、季節ごとに表情が変わる日常を、私たちの言葉でお届けします。",
    ],
  },
  {
    title: "なぜ今、新しい仲間を募集しているのか",
    body: [
      "本文は準備中です。人口減少・高齢化を正直に、前向きに語る内容が入ります。",
      "課題を隠さず伝えたうえで、それでも一緒に町をつくっていきたい理由を書きます。",
    ],
  },
  {
    title: "どんな人と一緒に働きたいか",
    body: [
      "本文は準備中です。「行き先を自分で決められる人」という軸で語る内容が入ります。",
      "特別な強さよりも、目の前の人と向き合い、少しずつ進められる姿勢を大切にします。",
    ],
  },
  {
    title: "移住者へのサポート体制",
    body: [
      "本文は準備中です。住居・補助金・相談窓口についての情報が入ります。",
      "来る前だけでなく、来たあとも相談しやすい関係をどうつくるかを整理します。",
    ],
  },
  {
    title: "(結び)",
    body: [
      "あなたの「次」の選択肢のひとつに、ぜひこの島も加えてください。",
      "私たちは、このページの続きを準備しながら、あなたと出会える日を待っています。",
    ],
  },
];

export default function MessagePage() {
  return (
    <main className="bg-[color:var(--c-paper)]">
      <PageHero
        eyebrow="Message"
        title="町から、あなたへ。"
        lead="利尻富士町からの、ささやかなお手紙。"
      />

      <article className="mx-auto max-w-[720px] px-[var(--space-6)] pb-[calc(var(--space-6)*4)]">
        <div className="grid gap-[var(--space-6)]">
          {MESSAGE_SECTIONS.map((section) => (
            <section
              key={section.title}
              className="rounded-[var(--radius-lg)] border border-[color:var(--c-border-subtle)] bg-[color:var(--c-snow)] p-[var(--space-6)] shadow-[var(--shadow-md)]"
            >
              <h2 className="text-2xl font-bold tracking-normal text-[color:var(--c-text-primary)]">
                {section.title}
              </h2>
              <div className="mt-[var(--space-4)] grid gap-[var(--space-3)] text-base leading-8 text-[color:var(--c-text-secondary)]">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <Link
          href="/jobs"
          className="mt-[calc(var(--space-6)*2)] inline-flex min-h-12 items-center rounded-[var(--radius-full)] bg-[color:var(--c-pin-job)] px-[var(--space-6)] text-base font-bold text-[color:var(--c-snow)] shadow-[var(--shadow-pop-coral)] transition-[filter] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--c-deep-ocean)]"
        >
          現在募集中の求人を見る →
        </Link>
      </article>
    </main>
  );
}
