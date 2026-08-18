# Phase 5 Task 05b: スライドナビゲーションボタンの修正

## 問題

現在の前後ボタンに2つの問題がある:

1. **位置**: パネルの外側(左右)にはみ出しており、
   3Dマップに重なって浮いて見える
2. **デザイン**: 木製ボタン風のスキュアモーフィックな見た目で、
   周囲のフラットで洗練されたUI(Header/エリアパネル)と
   トーンが合っていない

## 修正方針

ボタンをパネル内部に収め、フラットでミニマルなデザインにする。
配置はスライドのドット表示と同じ行に統合する。

## 実装

components/scene/AreaPostSlider.tsx のスライドナビゲーション部分を
以下に置き換えてください。

### 変更前の構造(削除する)

- パネル外側に配置された左右の木製ボタン
- ドットだけの独立した行

### 変更後の構造

パネル下部に「← ・・・ →」を1行にまとめる:

{posts.length > 1 && (
  <div style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--space-4)",
    marginTop: "var(--space-4)",
    paddingTop: "var(--space-4)",
    borderTop: "1px solid rgba(10, 46, 78, 0.08)",
  }}>
    {/* 前へ */}
    <button
      onClick={() => setSlideIndex((i) => (i - 1 + posts.length) % posts.length)}
      aria-label="前の投稿"
      style={{
        width: "2rem",
        height: "2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "9999px",
        border: "none",
        background: "rgba(10, 46, 78, 0.06)",
        color: "var(--c-deep-ocean)",
        cursor: "pointer",
        fontSize: "1rem",
        lineHeight: 1,
        transition: "background 150ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(10, 46, 78, 0.14)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(10, 46, 78, 0.06)";
      }}
    >
      ‹
    </button>

    {/* ドット */}
    <div style={{ display: "flex", gap: "0.4rem" }}>
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
            padding: 0,
            background: i === slideIndex
              ? "var(--c-deep-ocean)"
              : "rgba(10, 46, 78, 0.2)",
            transition: "background 150ms ease",
          }}
        />
      ))}
    </div>

    {/* 次へ */}
    <button
      onClick={() => setSlideIndex((i) => (i + 1) % posts.length)}
      aria-label="次の投稿"
      style={{
        width: "2rem",
        height: "2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "9999px",
        border: "none",
        background: "rgba(10, 46, 78, 0.06)",
        color: "var(--c-deep-ocean)",
        cursor: "pointer",
        fontSize: "1rem",
        lineHeight: 1,
        transition: "background 150ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(10, 46, 78, 0.14)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(10, 46, 78, 0.06)";
      }}
    >
      ›
    </button>
  </div>
)}

## デザインの意図

| 項目 | 内容 |
|---|---|
| 形状 | 円形(パネルの角丸・ドットと統一) |
| 色 | 深海ブルーの半透明(#0A2E4E ベース) |
| サイズ | 2rem(小さく控えめ、ドットとバランスを取る) |
| 記号 | ‹ › (シンプルな山括弧、絵文字や画像は使わない) |
| 配置 | パネル内部・ドットと同じ行・中央揃え |
| 区切り線 | 上部に薄い border でコンテンツと分離 |

## 制約

- AreaPostSlider.tsx のみ変更
- パネルの外側に要素を配置しない
- 木製・立体的な装飾は使わない(Header/エリアパネルと同じフラットトーン)
- 既存のタブ・コンテンツ表示部分は変更しない

## 確認手順

1. npm run dev で表示確認
2. ボタンがパネル内部に収まっているか
3. 「‹ ・・ ›」が1行に中央揃えで並んでいるか
4. ボタンをクリックしてスライドが前後に切り替わるか
5. 最後のスライドで「›」を押すと先頭に戻るか(ループ)
6. ホバー時に背景色がわずかに濃くなるか
7. 周囲のUI(Header/エリアパネル)とトーンが揃っているか
8. スクリーンショットを報告
