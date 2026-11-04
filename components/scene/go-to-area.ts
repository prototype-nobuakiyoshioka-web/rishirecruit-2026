import { useScrollProgressStore } from "@/store/scroll-progress-store";

/**
 * エリアへ移動する。島が表示されていればスクロール位置を動かして島ごと回し、
 * 3D が使えないときはカードの表示だけを切り替える。
 */
export function goToArea(slug: "oshidomari" | "oniwaki") {
  const { scrollElement, setActiveAreaSlug, setLastScrollOffset } =
    useScrollProgressStore.getState();
  if (!scrollElement) {
    setActiveAreaSlug(slug);
    // 読み込み中に押されたときは、島が出たらこの位置から始める
    setLastScrollOffset(slug === "oshidomari" ? 0 : 1);
    return;
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  scrollElement.scrollTo({
    top:
      slug === "oshidomari"
        ? 0
        : scrollElement.scrollHeight - scrollElement.clientHeight,
    behavior: reduceMotion ? "auto" : "smooth",
  });
}
