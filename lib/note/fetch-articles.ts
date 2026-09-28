import Parser from "rss-parser";

export interface NoteArticle {
  title: string;
  link: string;
  publishedAt: string;
  excerpt: string | null;
  imageUrl: string | null;
  // true = RSS のサムネ/description に画像がなく、記事本文から拾ったフォールバック画像
  // (この場合フロントは cover 表示で余白を出さない)
  imageIsFallback: boolean;
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

// note 記事本体を取得し、og:image (アイキャッチ) を返す。
// RSS に画像が無い記事のフォールバック用。24時間キャッシュ。
async function fetchArticleOgImage(articleUrl: string): Promise<string | null> {
  try {
    const response = await fetch(articleUrl, {
      next: { revalidate: 86400 },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RishiRecruit/1.0)" },
    });
    if (!response.ok) return null;
    const html = await response.text();
    // <meta property="og:image" content="..."> を抽出
    const ogMatch = html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    );
    if (ogMatch?.[1]) return normalizeHttpUrl(ogMatch[1]);
    // フォールバック: 本文最初の <img>
    return extractFirstImage(html);
  } catch {
    return null;
  }
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

    const items = feed.items.flatMap((item) => {
      const link = normalizeHttpUrl(item.link);
      if (!item.title || !link || !item.pubDate) return [];

      const contentHtml =
        item.contentEncoded ?? item.content ?? item.descriptionHtml;

      const rssImage =
        normalizeHttpUrl(item.mediaThumbnail) ??
        extractFirstImage(contentHtml);

      return [
        {
          title: item.title,
          link,
          publishedAt: item.pubDate,
          excerpt: normalizeExcerpt(
            item.contentSnippet ?? item.descriptionHtml ?? item.content,
          ),
          imageUrl: rssImage,
          imageIsFallback: false,
        },
      ];
    });

    // RSS で画像が無い記事は note 記事ページから og:image を取得(並列)
    return await Promise.all(
      items.map(async (item) => {
        if (item.imageUrl) return item;
        const fallback = await fetchArticleOgImage(item.link);
        return { ...item, imageUrl: fallback, imageIsFallback: fallback !== null };
      }),
    );
  } catch (error: unknown) {
    console.error("Failed to fetch Note RSS articles.", error);
    return [];
  }
}
