# Phase 5 Task 05: エリア投稿スライドショー実装

## 目的

画面下部に、現在のエリアの投稿を Job / Event / Spot の
タブで切り替えて表示するスライドショーを実装する。

## 参考イメージの構造

    ┌──────┬───────┬──────┐
    │ Job  │ Event │ Spot │  ← タブ

┌───────┴──────┴───────┴──────┴────────┐
│                                      │
│ 鴛泊エリアの投稿情報                  │
│ ┌──────────┐                         │
│ スライドショー表示 │                  │
│ 求人、イベント、観光で │ 画像 │       │
│ タブ分け │                            │
│ 概要テキストも表示 └──────────┘       │
│                                      │
└──────────────────────────────────────┘

| 要素 | 内容 |
|---|---|
| タブ | Job / Event / Spot の3つ |
| コンテンツ | 選択中タブの投稿をスライドショー表示 |
| 各スライド | タイトル・キャッチコピー・サムネイル画像 |
| 配置 | 画面右下(エリア情報パネルの下) |

## 実装

### Step 5-1: サーバーコンポーネントでデータ取得

app/page.tsx で両エリアのデータを事前取得する:

import { getAreaWithPosts } from "@/lib/wp/queries/areas";

export default async function Home() {
  // 両エリアのデータを取得
  const [oshidomariData, oniwakiData] = await Promise.all([
    getAreaWithPosts("oshidomari"),
    getAreaWithPosts("oniwaki"),
  ]);

  const areaData = {
    oshidomari: oshidomariData,
    oniwaki: oniwakiData,
  };

  return (
    <>
      <main style={{ width: "100vw", height: "100vh" }}>
        <IslandCanvas />
      </main>
      <ColumnBoard />
      <AreaInfoPanel areaSlug="oshidomari" />
      <AreaPostSlider areaSlug="oshidomari" areaData={areaData} />
    </>
  );
}

### Step 5-2: スライドショーコンポーネント作成

新規ファイル: components/scene/AreaPostSlider.tsx

"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { AreaWithPosts } from "@/lib/wp/queries/areas";

type TabType = "job" | "event" | "spot";

const TABS: { key: TabType; label: string }[] = [
  { key: "job",   label: "Job" },
  { key: "event", label: "Event" },
  { key: "spot",  label: "Spot" },
];

interface AreaPostSliderProps {
  areaSlug: string;
  areaData: Record<string, AreaWithPosts | null>;
}

export function AreaPostSlider({ areaSlug, areaData }: AreaPostSliderProps) {
  const [activeTab, setActiveTab] = useState<TabType>("job");
  const [slideIndex, setSlideIndex] = useState(0);

  const area = areaData[areaSlug];
  if (!area) return null;

  // タブごとの投稿を取得
  const posts =
    activeTab === "job"   ? area.jobPostings.nodes :
    activeTab === "event" ? area.events.nodes :
                            area.touristspots.nodes;

  const currentPost = posts[slideIndex] ?? null;

  // タブ切替時はスライドを先頭に戻す
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSlideIndex(0);
  };

  // 各CPTごとにフィールド名が異なるため正規化する
  const getPostInfo = (post: any) => {
    if (activeTab === "job") {
      return {
        title: post.title,
        catchCopy: post.jobPostingFields?.catchCopy ?? null,
        imageUrl: post.jobPostingFields?.thumbnailImage?.node?.sourceUrl ?? null,
        href: `/jobs/${post.slug}`,
      };
    }
    if (activeTab === "event") {
      return {
        title: post.title,
        catchCopy: post.eventFields?.catchCopy ?? null,
        imageUrl: post.eventFields?.thumbnailImage?.node?.sourceUrl ?? null,
        href: `/events/${post.slug}`,
      };
    }
    return {
      title: post.title,
      catchCopy: post.touristspotFields?.catchCopy ?? null,
      imageUrl: post.touristspotFields?.thumbnailImage?.node?.sourceUrl ?? null,
      href: `/spots/${post.slug}`,
    };
  };

  const info = currentPost ? getPostInfo(currentPost) : null;

  return (
    <div className="fixed z-40 hidden md:block"
      style={{
        bottom: "var(--space-6)",
        right: "var(--space-6)",
        width: "34rem",
      }}
    >
      {/* タブ */}
      <div style={{ display: "flex", gap: "0.25rem", marginLeft: "1.5rem" }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            style={{
              padding: "0.5rem 1.5rem",
              borderRadius: "var(--radius-md) var(--radius-md) 0 0",
              background: activeTab === tab.key
                ? "rgba(255, 255, 255, 0.95)"
                : "rgba(255, 255, 255, 0.7)",
              fontWeight: activeTab === tab.key ? 700 : 500,
              fontSize: "0.95rem",
              color: "var(--c-deep-ocean)",
              border: "none",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* コンテンツパネル */}
      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-6)",
        boxShadow: "var(--shadow-md)",
        minHeight: "13rem",
      }}>
        {info ? (
          <div style={{ display: "flex", gap: "var(--space-6)" }}>
            {/* テキスト */}
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "var(--c-deep-ocean)",
                marginBottom: "var(--space-2)",
              }}>
                {info.title}
              </h3>
              {info.catchCopy && (
                <p style={{
                  fontSize: "0.9rem",
                  color: "var(--c-text-secondary)",
                  lineHeight: 1.7,
                  marginBottom: "var(--space-4)",
                }}>
                  {info.catchCopy}
                </p>
              )}
              <Link href={info.href} style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "var(--c-deep-ocean)",
              }}>
                詳細を見る →
              </Link>
            </div>

            {/* 画像 */}
            <div style={{
              width: "12rem",
              height: "8rem",
              position: "relative",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              background: "#E5E5E5",
              flexShrink: 0,
            }}>
              {info.imageUrl && (
                <Image
                  src={info.imageUrl}
                  alt={info.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              )}
            </div>
          </div>
        ) : (
          <p style={{ color: "var(--c-text-secondary)" }}>
            このエリアには該当する情報がありません。
          </p>
        )}

        {/* スライドナビゲーション */}
        {posts.length > 1 && (
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "var(--space-4)",
          }}>
            {posts.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIndex(i)}
                aria-label={`スライド ${i + 1}`}
                style={{
                  width: "0.5rem",
                  height: "0.5rem",
                  borderRadius: "9999px",
                  border: "none",
                  cursor: "pointer",
                  background: i === slideIndex
                    ? "var(--c-deep-ocean)"
                    : "rgba(10, 46, 78, 0.25)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

### Step 5-3: 型定義の調整

lib/wp/queries/areas.ts の AreaWithPosts 型で any を使っている場合、
必要に応じて適切な型に置き換えてください。

## 確認手順

1. npm run dev で表示確認
2. 画面右下にタブ付きパネルが表示されるか
3. Job / Event / Spot のタブを切り替えて内容が変わるか
4. 各投稿のタイトル・キャッチコピー・画像が表示されるか
5. スライドのドットをクリックして投稿が切り替わるか
6. 「詳細を見る →」が正しいURLにリンクしているか
7. エリア情報パネルと重なっていないか
8. スクリーンショットを報告

## 制約

- 新規ファイル1つ + app/page.tsx の更新のみ
- Header, Footer, ColumnBoard, AreaInfoPanel, 3D関連は変更しない
- WordPress側ファイルへの変更は行わない
- TypeScript の型エラーを出さない
- next/image を使う(remotePatterns 設定済み)
