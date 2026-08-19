import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorialDetailSection, EditorialDetailShell, EditorialFieldList } from "@/components/ui/EditorialDetailShell";
import { formatEventPeriod } from "@/lib/utils/format-date";
import { eventStatus, galleryFromField, htmlToText, imageFromField, selectFirst } from "@/lib/wp/format";
import { EVENT_CATEGORY_LABELS } from "@/lib/wp/labels";
import { getEventBySlug, getEvents } from "@/lib/wp/queries/events";

type PageProps={params:Promise<{slug:string}>};
export async function generateStaticParams(){return(await getEvents()).map(event=>({slug:event.slug}));}
export async function generateMetadata({params}:PageProps):Promise<Metadata>{const{slug}=await params;const event=await getEventBySlug(slug);return event?{title:`${event.title}｜利尻富士町のイベント`,description:event.eventFields?.catchCopy??undefined}:{};}

export default async function EventDetailPage({params}:PageProps){
  const{slug}=await params;const event=await getEventBySlug(slug);if(!event)notFound();const fields=event.eventFields;const category=selectFirst(fields?.category);const categoryLabel=category?(EVENT_CATEGORY_LABELS[category]??category):"Event";const image=imageFromField(fields?.thumbnailImage,"/placeholders/event.svg");const gallery=galleryFromField(fields?.galleryImages);const period=formatEventPeriod(fields?.dateDisplayType?.[0]??null,fields?.startDatetime??null,fields?.endDatetime??null,fields?.periodMonth?.[0]??null,fields?.periodRange?.[0]??null);
  return <EditorialDetailShell breadcrumbs={[{label:"ホーム",href:"/"},{label:"イベント",href:"/events"},{label:event.title}]} eyebrow="Event / Island calendar" meta={`${categoryLabel} ・ ${eventStatus(fields?.startDatetime)}`} title={event.title} lead={fields?.catchCopy} image={{...image,altText:image.altText||`${event.title}の写真`}}>
    <EditorialDetailSection eyebrow="Schedule" label="開催情報"><EditorialFieldList items={[{label:"日程",value:period},{label:"毎年開催",value:fields?.isRecurring?"はい":"いいえ"},{label:"開催パターン",value:fields?.recurrenceNote},{label:"会場",value:fields?.venueName},{label:"住所",value:fields?.address}]} /></EditorialDetailSection>
    <EditorialDetailSection eyebrow="About" label="イベントについて"><div className="grid gap-7 text-base leading-8 text-[color:var(--c-text-secondary)] md:text-lg">{htmlToText(fields?.description).split(/\n+/).filter(Boolean).map(p=><p key={p}>{p}</p>)}</div></EditorialDetailSection>
    {gallery.length?<EditorialDetailSection eyebrow="Scenes" label="会場の風景"><div className="grid gap-5 md:grid-cols-2">{gallery.map((img,index)=><Image key={`${img.sourceUrl}-${index}`} src={img.sourceUrl} alt={img.altText||`${event.title}の写真 ${index+1}`} width={1200} height={900} className="aspect-[4/3] w-full rounded-[var(--radius-2xl)] object-cover" />)}</div></EditorialDetailSection>:null}
    <EditorialDetailSection eyebrow="Join" label="参加・アクセス"><EditorialFieldList items={[{label:"アクセス",value:fields?.accessInfo},{label:"参加費",value:fields?.price},{label:"問い合わせ",value:fields?.contact},{label:"申込",value:fields?.registrationUrl?<a href={fields.registrationUrl} target="_blank" rel="noopener noreferrer" className="underline">申込ページを開く ↗</a>:null}]} /></EditorialDetailSection>
    <aside className="relative bg-[color:var(--c-deep-ocean)] px-6 py-20 text-[color:var(--c-text-inverse)]"><div className="mx-auto grid max-w-[1080px] gap-8 md:grid-cols-[1fr_auto] md:items-end"><div><p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--c-warning)]">Next / Jobs</p><h2 className="mt-5 text-3xl font-black md:text-5xl">島の日常を、仕事から知る。</h2></div><Link href="/jobs" className="inline-flex min-h-14 items-center justify-center rounded-full bg-[color:var(--c-pin-job)] px-8 font-black text-white">求人一覧を見る →</Link></div></aside>
  </EditorialDetailShell>;
}
