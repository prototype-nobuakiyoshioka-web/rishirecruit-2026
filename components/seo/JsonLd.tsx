// 構造化データ(JSON-LD)を <script type="application/ld+json"> として埋め込む。
// Reactの子テキストはHTMLエスケープされ検索エンジンがパースできないため、
// dangerouslySetInnerHTML で生JSONを出力する(データはWP由来のためXSSリスクは限定的)。
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
