import { GraphQLClient } from "graphql-request";

const WP_GRAPHQL_URL =
  process.env.NEXT_PUBLIC_WP_GRAPHQL_URL ?? "http://rishirecruit-2026.local/graphql";

// WP実データfetchに付与する共通キャッシュタグ。
// WordPress側の更新フックが /api/revalidate 経由で revalidateTag(WP_CACHE_TAG) を叩き、
// タグの付いた全GraphQL fetchを一括で再検証(On-demand Revalidation)する。
export const WP_CACHE_TAG = "wp";

// graphql-request は requestConfig の未知キーを fetch の RequestInit へそのまま展開するため、
// Next.js の fetch 拡張(next.tags / next.revalidate)を渡せる。型上 next は存在しないため cast する。
// revalidate はフック不達時のフォールバック(1時間)。
export const wpClient = new GraphQLClient(WP_GRAPHQL_URL, {
  next: { tags: [WP_CACHE_TAG], revalidate: 3600 },
} as ConstructorParameters<typeof GraphQLClient>[1]);
