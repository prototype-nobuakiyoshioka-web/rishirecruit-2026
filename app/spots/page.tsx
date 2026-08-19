import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EditorialIndexShell } from "@/components/ui/EditorialIndexShell";
import { imageFromField, selectFirst } from "@/lib/wp/format";
import { SPOT_CATEGORY_LABELS } from "@/lib/wp/labels";
import { getTouristspots } from "@/lib/wp/queries/spots";

export const metadata: Metadata = { title: "利尻島の観光地", description: "利尻島の観光地と、島で暮らす人の身近な風景を紹介します。" };

export default async function SpotsPage() {
  const spots = await getTouristspots();
  return (
    <EditorialIndexShell
      eyebrow="Places on the island"
      title={<>島を知ることは、<br />暮らしを知ること。</>}
      lead={<>休日に歩く場所、季節を感じる景色。<br />働く先にある島の日常を巡ります。</>}
      introEyebrow="Island guide"
      introLabel="島の風景と場所"
      introTitle={<>観光地の先にある、<br />いつもの景色。</>}
      introBody="訪れる人にとっての名所は、暮らす人にとっては休日の散歩道や季節を知る場所でもあります。求人条件だけでは見えない、島で過ごす時間を想像してみてください。"
    >
      <section className="relative mx-auto max-w-[1080px] px-[var(--space-6)] pb-20 md:pb-28">
        <div className="grid gap-x-8 gap-y-14 md:grid-cols-2">
          {spots.map((spot, index) => {
            const fields = spot.touristspotFields;
            const category = selectFirst(fields?.category);
            const image = imageFromField(fields?.thumbnailImage, "/placeholders/spot.svg");
            return (
              <article key={spot.id} className={index % 3 === 0 ? "md:col-span-2" : undefined}>
                <Link href={`/spots/${spot.slug}`} aria-label={`${spot.title}の詳細を見る`}>
                  <Image src={image.sourceUrl} alt={image.altText || `${spot.title}の風景`} width={1600} height={1000} className={`w-full rounded-[var(--radius-2xl)] object-cover transition-transform duration-500 hover:scale-[1.01] ${index % 3 === 0 ? "aspect-[16/8]" : "aspect-[4/3]"}`} />
                </Link>
                <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
                  <div><p className="text-xs font-black uppercase tracking-[0.16em] text-[color:var(--c-warning)]">{category ? SPOT_CATEGORY_LABELS[category] ?? category : "Spot"}</p><h2 className="mt-3 text-2xl font-black text-[color:var(--c-deep-ocean)] md:text-3xl">{spot.title}</h2>{fields?.catchCopy ? <p className="mt-3 leading-7 text-[color:var(--c-text-secondary)]">{fields.catchCopy}</p> : null}</div>
                  <Link href={`/spots/${spot.slug}`} className="inline-flex min-h-11 items-center font-black text-[color:var(--c-deep-ocean)] hover:underline">この場所を知る →</Link>
                </div>
              </article>
            );
          })}
        </div>
        <div className="mt-20 border-t border-[color:var(--c-deep-ocean)]/15 pt-10"><Link href="/jobs" className="font-black text-[color:var(--c-deep-ocean)] hover:underline">この島で働く →</Link></div>
      </section>
    </EditorialIndexShell>
  );
}
