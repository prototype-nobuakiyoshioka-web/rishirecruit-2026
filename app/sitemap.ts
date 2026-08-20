import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { getEvents } from "@/lib/wp/queries/events";
import { getJobPostings } from "@/lib/wp/queries/jobs";
import { getTouristspots } from "@/lib/wp/queries/spots";
import { getTestimonials } from "@/lib/wp/queries/voices";

// 静的ページ + 4CPTの詳細ページを列挙する。WP実データfetchはタグ付きなので、
// 投稿更新時は On-demand Revalidation でこのsitemapも再生成される。
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 固定ページ。トップと一覧・静的系。
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/jobs"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/spots"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/events"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/voices"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/columns"), changeFrequency: "daily", priority: 0.6 },
    { url: absoluteUrl("/message"), changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.4 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.2 },
  ];

  // 4CPTの詳細ページを一括取得(取得失敗時は各クエリが空配列を返す)。
  const [jobs, spots, events, voices] = await Promise.all([
    getJobPostings(),
    getTouristspots(),
    getEvents(),
    getTestimonials(),
  ]);

  const dynamicRoutes: MetadataRoute.Sitemap = [
    ...jobs.map((job) => ({
      url: absoluteUrl(`/jobs/${job.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...spots.map((spot) => ({
      url: absoluteUrl(`/spots/${spot.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...events.map((event) => ({
      url: absoluteUrl(`/events/${event.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...voices.map((voice) => ({
      url: absoluteUrl(`/voices/${voice.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
