/**
 * 一覧ページ共通の「規則性のないランダムグリッド」用の col-span を返す。
 *
 * 12カラムグリッド前提。パターンの各行は合計12になるよう組んであり(合計72=6行)、
 * index で循環させても行が12で割り切れるため隙間なく詰まる。
 * col-span が違う＝カードの横幅が変わるので、縦横比(16:9)は統一のままサイズだけが不揃いになる。
 */

const SPAN_PATTERN = [7, 5, 5, 7, 8, 4, 12, 6, 6, 4, 8];

// Tailwind が拾えるよう静的クラスで持つ
const SPAN_CLASS: Record<number, string> = {
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
  7: "md:col-span-7",
  8: "md:col-span-8",
  12: "md:col-span-12",
};

export function gridSpanClass(index: number): string {
  return SPAN_CLASS[SPAN_PATTERN[index % SPAN_PATTERN.length]];
}
