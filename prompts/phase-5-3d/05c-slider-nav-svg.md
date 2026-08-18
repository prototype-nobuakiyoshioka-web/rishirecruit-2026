# Phase 5 Task 05c: スライドナビをSVGアイコン化

## 問題

現在のボタンは「‹」「›」というテキスト文字を使用しているため:

- 文字のベースライン/字形の影響で視覚的な中心からズレる
- フォント依存で環境によって見た目が変わる
- 線の太さや角度を制御できない

## 修正

テキストをやめてインラインSVGに置き換える。
SVG は viewBox の中心に対称な形状で描画するため、
視覚的にも確実に中央に来る。

## 実装

components/scene/AreaPostSlider.tsx のナビゲーションボタン部分を
以下に変更してください。

### アイコンコンポーネントを定義

ファイル冒頭(コンポーネント外)に以下を追加:

```tsx
function ChevronLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 3.5L5.5 8L10 12.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 3.5L10.5 8L6 12.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
```

### ボタンの中身を差し替え

「前へ」ボタン:

```tsx
<button
  onClick={() => setSlideIndex((i) => (i - 1 + posts.length) % posts.length)}
  aria-label="前の投稿"
  style={{
    width: "2.25rem",
    height: "2.25rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "9999px",
    border: "none",
    background: "rgba(10, 46, 78, 0.06)",
    color: "var(--c-deep-ocean)",
    cursor: "pointer",
    padding: 0,
    transition: "background 150ms ease",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = "rgba(10, 46, 78, 0.14)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = "rgba(10, 46, 78, 0.06)";
  }}
>
  <ChevronLeftIcon />
</button>
```

「次へ」ボタンも同様に <ChevronRightIcon /> に差し替えてください。

### 視覚的中心の微調整について

SVG の path 座標は既に viewBox 中心(8,8)を基準に
左右対称になるよう設計しています:

- 左向き: M10 3.5 → L5.5 8 → L10 12.5 (頂点が x=5.5)
- 右向き: M6 3.5 → L10.5 8 → L6 12.5 (頂点が x=10.5)

山括弧は「く」の字型で片側に重心が寄るため、
数学的中心(8)ではなく頂点を少しオフセットしています。
これにより視覚的な中央に見えます。

目視で微妙にズレて見える場合は、
path の x 座標を 0.25 ずつ調整して報告してください。

## 制約

- AreaPostSlider.tsx のみ変更
- テキスト文字(‹ ›)は使わない
- 外部アイコンライブラリは追加しない(インラインSVGで完結させる)
- ボタンのサイズ・色・ホバー挙動は既存の設計を維持
- padding: 0 を必ず指定(ブラウザ既定のボタンpaddingで中心がズレるため)

## 確認手順

1. npm run dev で表示確認
2. 矢印アイコンが円の視覚的中央に来ているか
3. 左右のボタンで対称に見えるか
4. アイコンの線の太さが適切か(細すぎ/太すぎないか)
5. ホバー時の背景変化が動作するか
6. クリックでスライドが前後に切り替わるか
7. スクリーンショットを報告
