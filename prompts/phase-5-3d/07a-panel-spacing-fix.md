# Phase 5 Task 07a: パネル間の余白調整

## 問題

エリア情報パネル(AreaInfoPanel)の下端と
タブスライダー(AreaPostSlider)のタブ上端が
密着していて窮屈に見える。

## 修正

2つのパネルの間に適切な余白を設ける。

### 変更対象

components/scene/AreaPostSlider.tsx のルート要素の
位置指定を調整してください。

### 現状の想定

現在 bottom を基準に配置しているため、
上のパネルとの間隔が画面高さによって変動している。

### 修正案

AreaPostSlider のルート div の style を以下に変更:

<div className="fixed z-40 hidden md:block"
  style={{
    bottom: "var(--space-6)",
    right: "var(--space-6)",
    width: "34rem",
    // 追加: 上のパネルとの最小間隔を確保
    marginTop: "var(--space-6)",
  }}
>

ただし fixed 配置では marginTop が効かないため、
以下のいずれかの方法で対応してください:

【方法A】AreaInfoPanel の高さを見込んで top 基準に変更

AreaPostSlider を bottom 基準ではなく top 基準にし、
AreaInfoPanel の下に一定の余白を空けて配置する:

style={{
  top: "calc(var(--space-6) + 6rem + 30rem + var(--space-8))",
  //     Header余白    Header高さ  InfoPanel高さ  パネル間余白
  right: "var(--space-6)",
  width: "34rem",
}}

【方法B】AreaInfoPanel の bottom margin を増やす

AreaInfoPanel に下方向の余白を持たせ、
AreaPostSlider は bottom 基準のまま、
両者が重ならない高さに調整する。

【方法C】2つのパネルを1つのラッパーで囲む(推奨)

新しく components/scene/AreaSidePanels.tsx を作成し、
AreaInfoPanel と AreaPostSlider を
flexbox の縦並びで包む:

"use client";
import { AreaInfoPanel } from "./AreaInfoPanel";
import { AreaPostSlider } from "./AreaPostSlider";
import type { AreaWithPosts } from "@/lib/wp/queries/areas";

interface AreaSidePanelsProps {
  areaData: Record<string, AreaWithPosts | null>;
}

export function AreaSidePanels({ areaData }: AreaSidePanelsProps) {
  return (
    <div
      className="fixed z-40 hidden md:flex"
      style={{
        top: "calc(var(--space-6) + 6rem)",
        right: "var(--space-6)",
        bottom: "var(--space-6)",
        width: "34rem",
        flexDirection: "column",
        gap: "var(--space-8)",   // ← ここでパネル間の余白を制御
        justifyContent: "flex-start",
        pointerEvents: "none",   // 3D操作を妨げないように
      }}
    >
      <div style={{ pointerEvents: "auto" }}>
        <AreaInfoPanel />
      </div>
      <div style={{ pointerEvents: "auto" }}>
        <AreaPostSlider areaData={areaData} />
      </div>
    </div>
  );
}

この場合、AreaInfoPanel と AreaPostSlider から
fixed / top / right / bottom の指定を削除し、
幅100%の通常ブロック要素にしてください。

app/page.tsx では2つを個別に呼ぶのをやめ、
<AreaSidePanels areaData={areaData} /> のみを呼びます。

## 推奨

方法Cを推奨します。理由:
- パネル間の余白を gap 一箇所で制御できる
- 画面高さが変わっても両パネルの関係が保たれる
- 今後パネルを追加する時も同じ仕組みで管理できる

## 制約

- 3D関連ファイル(IslandCanvas, IslandModel, Pin, Background)は変更しない
- ColumnBoard, Header, Footer は変更しない
- ストア連動(activeAreaSlug)の仕組みは維持する
- WordPress側ファイルへの変更は行わない

## 確認手順

1. npm run dev で表示確認
2. エリア情報パネルとタブの間に適度な余白があるか
3. 2つのパネルが重なっていないか
4. 画面下端からはみ出していないか
5. 3Dマップのドラッグ操作を妨げていないか(pointer-events)
6. スクロールでエリアが切り替わった時、両パネルが同時に更新されるか
7. ブラウザの高さを変えてもレイアウトが崩れないか
8. スクリーンショットを報告
