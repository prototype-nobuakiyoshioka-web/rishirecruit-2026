"use client";

import { usePathname } from "next/navigation";

// Vercel で トップを ISR で作り直すとき、サーバー側の pathname が "/index" になる。
// ブラウザ側は "/" なので、そのまま使うと pathname で出し分ける部品が食い違い、
// ハイドレーションに失敗してページ全体が描き直される(オープニングの状態も消える)。
export function normalizeSitePathname(pathname: string) {
  return pathname === "/index" ? "/" : pathname;
}

export function useSitePathname() {
  return normalizeSitePathname(usePathname());
}
