import { NextResponse, type NextRequest } from "next/server";

/**
 * 「リニューアル準備中」画面の全ページ差し替えミドルウェア。
 *
 * 有効化: Vercel 環境変数 `NEXT_PUBLIC_COMING_SOON` を `true` にセットして再デプロイ。
 * 解除: 同変数を削除 or `false` にセットして再デプロイ。
 *
 * バイパス:
 * - `/coming-soon` 自体
 * - `/api/*`（revalidate 等の内部 API）
 * - `/_next/*`（静的アセット）
 * - `/robots.txt` / `/sitemap.xml`（クローラ制御は SEO 上残す）
 * - 拡張子付きの静的ファイル（favicon, og 画像等）
 */
export function middleware(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_COMING_SOON !== "true") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  const isBypass =
    pathname.startsWith("/coming-soon") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.[a-zA-Z0-9]+$/.test(pathname);

  if (isBypass) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/coming-soon";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
