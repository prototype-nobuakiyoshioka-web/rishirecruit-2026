import Parser from "rss-parser";

export interface NoteArticle {
  title: string;
  link: string;
  publishedAt: string;
  excerpt: string | null;
  imageUrl: string | null;
}

interface NoteFeedItem {
  contentEncoded?: string;
  descriptionHtml?: string;
  mediaThumbnail?: string;
}

const parser = new Parser<Record<string, never>, NoteFeedItem>({
  customFields: {
    item: [
      ["media:thumbnail", "mediaThumbnail"],
      ["content:encoded", "contentEncoded"],
      ["description", "descriptionHtml"],
    ],
  },
});

function normalizeHttpUrl(value: string | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function extractFirstImage(html: string | undefined): string | null {
  if (!html) return null;

  const match = html.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i);
  return normalizeHttpUrl(match?.[1]);
}

function normalizeExcerpt(value: string | undefined): string | null {
  if (!value) return null;

  const excerpt = value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/続きをみる\s*$/u, "")
    .replace(/\s+/g, " ")
    .trim();

  return excerpt || null;
}

export async function fetchNoteArticles(): Promise<NoteArticle[]> {
  const rssUrl = process.env.NEXT_PUBLIC_NOTE_RSS_URL;

  if (!rssUrl) {
    console.error("NEXT_PUBLIC_NOTE_RSS_URL is not configured.");
    return [];
  }

  try {
    const response = await fetch(rssUrl, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Note RSS request failed with status ${response.status}`);
    }

    const feed = await parser.parseString(await response.text());

    return feed.items.flatMap((item) => {
      const link = normalizeHttpUrl(item.link);
      if (!item.title || !link || !item.pubDate) return [];

      const contentHtml =
        item.contentEncoded ?? item.content ?? item.descriptionHtml;

      return [
        {
          title: item.title,
          link,
          publishedAt: item.pubDate,
          excerpt: normalizeExcerpt(
            item.contentSnippet ?? item.descriptionHtml ?? item.content,
          ),
          imageUrl:
            normalizeHttpUrl(item.mediaThumbnail) ??
            extractFirstImage(contentHtml),
        },
      ];
    });
  } catch (error: unknown) {
    console.error("Failed to fetch Note RSS articles.", error);
    return [];
  }
}
