import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { WP_CACHE_TAG } from "@/lib/wp/client";

// WordPress の投稿更新フックから呼ばれる On-demand Revalidation エンドポイント。
// シークレット照合 → WP実データfetchのキャッシュタグを一括再検証する。
// 任意で paths を受け取り、静的化済みページを個別に revalidatePath する。
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;

  // 未設定のまま公開すると誰でも再検証を叩ける。設定必須にしてエンドポイントを閉じる。
  if (!secret) {
    return NextResponse.json(
      { revalidated: false, message: "REVALIDATE_SECRET is not configured." },
      { status: 500 },
    );
  }

  // シークレットは Authorization: Bearer またはヘッダで受け取る(URLに残さない)。
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ")
    ? header.slice(7)
    : request.headers.get("x-revalidate-secret") ?? "";

  if (provided !== secret) {
    return NextResponse.json(
      { revalidated: false, message: "Invalid secret." },
      { status: 401 },
    );
  }

  // paths は任意。指定が無ければタグ一括再検証のみ行う。
  let paths: string[] = [];
  try {
    const body = (await request.json()) as { paths?: unknown };
    if (Array.isArray(body?.paths)) {
      paths = body.paths.filter((p): p is string => typeof p === "string");
    }
  } catch {
    // ボディ無し/不正JSONはタグ再検証のみで許容する。
  }

  // Next 16 では第2引数にキャッシュライフプロファイルが必須。"max" で即時再検証扱いにする。
  revalidateTag(WP_CACHE_TAG, "max");
  for (const path of paths) {
    revalidatePath(path, "page");
  }

  return NextResponse.json({
    revalidated: true,
    tag: WP_CACHE_TAG,
    paths,
    now: Date.now(),
  });
}
