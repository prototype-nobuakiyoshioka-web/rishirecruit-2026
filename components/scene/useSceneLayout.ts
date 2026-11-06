"use client";

import { useEffect, useState } from "react";

// トップの 3D シーンとパネルの配置の判定。
// - sp: 767px 以下(下部カルーセル)
// - tablet: 768〜1279px(iPad の縦・横。パネルを画面下に左右で並べ、上に島を映す)
// - pc: 1280px 以上(右にパネル)
// ヘッダーのナビの判定(1024px)とは別。
export const SP_MEDIA_QUERY = "(max-width: 767px)";
export const TABLET_MEDIA_QUERY = "(min-width: 768px) and (max-width: 1279px)";

export type SceneLayout = "sp" | "tablet" | "pc";

export function getSceneLayout(): SceneLayout {
  if (window.matchMedia(SP_MEDIA_QUERY).matches) return "sp";
  if (window.matchMedia(TABLET_MEDIA_QUERY).matches) return "tablet";
  return "pc";
}

/** 画面幅から配置を返す。マウント前(サーバー描画を含む)は null */
export function useSceneLayout(): SceneLayout | null {
  const [layout, setLayout] = useState<SceneLayout | null>(null);

  useEffect(() => {
    const queries = [SP_MEDIA_QUERY, TABLET_MEDIA_QUERY].map((query) =>
      window.matchMedia(query)
    );
    const update = () => setLayout(getSceneLayout());

    update();
    queries.forEach((query) => query.addEventListener("change", update));
    return () =>
      queries.forEach((query) => query.removeEventListener("change", update));
  }, []);

  return layout;
}
