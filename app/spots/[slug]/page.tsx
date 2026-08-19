import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { EditorialDetailSection, EditorialDetailShell, EditorialFieldList } from "@/components/ui/EditorialDetailShell";
import { galleryFromField, htmlToText, imageFromField, selectFirst } from "@/lib/wp/format";
import { SPOT_CATEGORY_LABELS } from "@/lib/wp/labels";
import { getTouristspotBySlug, getTouristspots } from "@/lib/wp/queries/spots";

type PageProps={params:Promise<{slug:string}>};
export async function generateStaticParams(){return(await getTouristspots()).map(spot=>({slug:spot.slug}));}
export async function generateMetadata({params}:PageProps):Promise<Metadata>{const{slug}=await params;const spot=await getTouristspotBySlug(slug);return spot?{title:`${spot.title}｜利尻島の観光地`,description:spot.touristspotFields?.catchCopy??undefined}:{};}

export default async function SpotDetailPage({params}:PageProps){
  const{slug}=await params;const spot=await getTouristspotBySlug(slug);if(!spot)notFound();const fields=spot.touristspotFields;const category=selectFirst(fields?.category);const categoryLabel=category?(SPOT_CATEGORY_LABELS[category]??category):"Spot";const image=imageFromField(fields?.thumbnailImage,"/placeholders/spot.svg");const gallery=galleryFromField(fields?.galleryImages);
  return <EditorialDetailShell breadcrumbs={[{label:"ホーム",href:"/"},{label:"観光地",href:"/spots"},{label:spot.title}]} eyebrow="Place / Island guide" meta={categoryLabel} title={spot.title} lead={fields?.catchCopy} image={{...image,altText:image.altText||`${spot.title}の風景`}}>
    <EditorialDetailSection eyebrow="About this place" label="この場所について"><div className="grid gap-7 text-base leading-8 text-[color:var(--c-text-secondary)] md:text-lg">{htmlToText(fields?.description).split(/\n+/).filter(Boolean).map(p=><p key={p}>{p}</p>)}</div></EditorialDetailSection>
    {gallery.length?<EditorialDetailSection eyebrow="Scenery" label="この場所の風景"><div className="grid gap-5 md:grid-cols-2">{gallery.map((img,index)=><Image key={`${img.sourceUrl}-${index}`} src={img.sourceUrl} alt={img.altText||`${spot.title}の風景 ${index+1}`} width={1200} height={900} className={`aspect-[4/3] w-full rounded-[var(--radius-2xl)] object-cover ${index===0&&gallery.length%2===1?"md:col-span-2":""}`} />)}</div></EditorialDetailSection>:null}
    <EditorialDetailSection eyebrow="Visit" label="訪れる前に"><EditorialFieldList items={[{label:"おすすめ季節",value:fields?.bestSeason},{label:"住所",value:fields?.address},{label:"アクセス",value:fields?.accessInfo},{label:"開放時間",value:fields?.openHours},{label:"定休日",value:fields?.closedDays},{label:"料金",value:fields?.price},{label:"電話番号",value:fields?.phone},{label:"公式サイト",value:fields?.websiteUrl?<a href={fields.websiteUrl} target="_blank" rel="noopener noreferrer" className="underline">公式サイトを開く ↗</a>:null}]} /></EditorialDetailSection>
    <aside className="relative bg-[color:var(--c-deep-ocean)] px-6 py-20 text-[color:var(--c-text-inverse)]"><div className="mx-auto grid max-w-[1080px] gap-8 md:grid-cols-[1fr_auto] md:items-end"><div><p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--c-warning)]">Next / Jobs</p><h2 className="mt-5 text-3xl font-black md:text-5xl">この景色の近くで、働く。</h2></div><Button variant="primary" href="/jobs" className="md:w-auto">募集中の仕事を見る →</Button></div></aside>
  </EditorialDetailShell>;
}
