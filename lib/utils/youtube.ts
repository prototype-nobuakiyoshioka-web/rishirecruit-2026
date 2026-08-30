/**
 * YouTube URL の各種形式から video ID を抽出する。
 * 対応: watch?v= / youtu.be/ / embed/ / shorts/ / URLでない文字列(=IDそのもの)
 */
export function extractYouTubeVideoId(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // ID っぽい文字列がそのまま渡ってきたら受け入れる（11文字の英数記号）
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.replace(/^\//, "");
      return /^[\w-]{11}$/.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      const v = url.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;

      const match = url.pathname.match(/^\/(?:embed|shorts|v)\/([\w-]{11})/);
      if (match) return match[1];
    }
  } catch {
    return null;
  }

  return null;
}

export interface YouTubeOEmbed {
  title: string;
  authorName: string;
  thumbnailUrl: string;
  width: number;
  height: number;
}

/**
 * YouTube oEmbed API から動画のメタ情報を取得する。
 * サーバサイドで fetch を呼び、Next.js の revalidate キャッシュに乗せる(24時間)。
 * 失敗時は null を返す(呼び出し側で post_title 等にフォールバック)。
 */
export async function fetchYouTubeOEmbed(videoUrl: string): Promise<YouTubeOEmbed | null> {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;

  try {
    const res = await fetch(endpoint, {
      next: { revalidate: 86400, tags: ["youtube-oembed"] },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      title?: string;
      author_name?: string;
      thumbnail_url?: string;
      width?: number;
      height?: number;
    };

    if (!data.title) return null;

    return {
      title: data.title,
      authorName: data.author_name ?? "",
      thumbnailUrl: data.thumbnail_url ?? "",
      width: data.width ?? 480,
      height: data.height ?? 360,
    };
  } catch (error) {
    console.error(`YouTube oEmbed fetch failed for ${videoUrl}:`, error);
    return null;
  }
}
