# Phase 4 - Task 04: ヘッダー(HUDレイヤー)実装

**目的:** 3D Canvas の上に重なる「HUDレイヤー」の最初の要素として、ヘッダー(6項目ナビ)を実装する。3Dの回転・スクロールと完全に独立して、画面に固定表示されるカプセル型ナビゲーションバーを作る。データ取得は行わない(リンク先のみ、中身は空でOK)。

---

## コンテキスト

### 前提環境
- **Phase 4 Task 01-02 完了済み**: GLB表示、スクロール連動回転(`clamp → damp`)
- **Task 03(Lenis)はリバート済み**: `components/scene/IslandCanvas.tsx`, `IslandModel.tsx` は Task 02 時点の状態
- `app/page.tsx` が `IslandCanvas` を表示している状態

### 必ず参照すべきドキュメント
- **`docs/05-sitemap.md` §5(HUDレイヤー設計)** ← 本タスクの仕様の出典。特に §5.1〜§5.3, §5.5
- **`docs/04-design-tokens.md`** ← カラー・スペーシング・角丸・シャドウのトークン定義
- `AGENTS.md` の TypeScript/React コーディング規約

### 確定済みヘッダー仕様(`docs/05-sitemap.md` §5.2 より転記)

| ラベル | リンク先 |
|---|---|
| (ロゴ) | `/` |
| メッセージ | `/message` |
| 移住者の声 | `/voices` |
| 求人 | `/jobs` |
| 観光地 | `/spots` |
| イベント | `/events` |
| お問い合わせ | `/contact` |

**グローバルCTAボタンは置かない**(`docs/05-sitemap.md` §5.2 に明記済み、求人詳細ページの固定CTAのみが正解)。

### ヘッダーのスタイル仕様(`docs/05-sitemap.md` §5.5 より転記)

- 高さ: 64px(デスクトップ)/ 56px(モバイル)
- 背景: 暖白 `#FAF6EE`(半透明 + ブラー)or 純白、カプセル型(角丸 full)
- スクロール時: 固定(sticky)
- アクティブページのラベル: 下線 or 色変更

### HUDレイヤーという設計思想(`docs/05-sitemap.md` §5.1 より転記)

ヘッダーは3D Canvasの**上に重なる固定要素**。3D側の回転・スクロールとは完全に独立して動作する。つまり：
- ヘッダーは 3D Canvas(`IslandCanvas`)の**外側**、通常のDOM要素として実装する
- 3Dシーンのスクロール連動回転(Task 02実装)に一切影響を与えない、与えられない
- ページ遷移してもヘッダーは継続して表示される(`app/layout.tsx` に配置)

---

## やってほしいこと

### 1. `components/layout/Header.tsx` の新規作成

**責務:** 6項目ナビ + ロゴを持つ、画面上部固定のHUD要素。

実装内容:
- `"use client"` 必須(アクティブページの判定に `usePathname` 等のクライアントフックを使うため)
- カプセル型のナビゲーションバー(角丸 full、デザイントークンの `--radius-full` を使用)
- ロゴ(テキストでよい、画像ロゴは別途用意中のため `<span>` 等で仮実装)+ 6項目のナビリンク
- デスクトップ: 横並びで6項目すべて表示
- モバイル: ハンバーガーメニューに切り替え(後述)
- 現在のページに対応するリンクをアクティブ表示(下線 or 色変更)
- `position: fixed` または `sticky` で画面上部に固定
- z-index を高く設定し、3D Canvas より手前に表示されるようにする

**参照モード**(このとおりでなくてOK、より良いパターンがあれば提案してください):

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "メッセージ", href: "/message" },
  { label: "移住者の声", href: "/voices" },
  { label: "求人", href: "/jobs" },
  { label: "観光地", href: "/spots" },
  { label: "イベント", href: "/events" },
  { label: "お問い合わせ", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 ...">
      <div className="...">
        <Link href="/" className="...">rishirecruit</Link>

        {/* デスクトップナビ */}
        <nav className="hidden md:flex ...">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "active-style" : "default-style"}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* モバイル: ハンバーガーボタン */}
        <button
          className="md:hidden"
          aria-label="メニューを開く"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {/* ハンバーガーアイコン */}
        </button>
      </div>

      {/* モバイルメニュー(開いている時のみ表示) */}
      {isMobileMenuOpen && (
        <nav className="md:hidden ...">
          {/* 6項目を縦並びで */}
        </nav>
      )}
    </header>
  );
}
```

Tailwind CSS v4 を使用(`AGENTS.md` の技術スタックに記載済み)。クラス名は上記は仮で、実際のスタイル(色・余白・角丸・影)は `docs/04-design-tokens.md` のトークンに従って具体的に決定すること。

### 2. モバイル表示の実装

`docs/05-sitemap.md` §5.3 の仕様に従う:

- ハンバーガーメニュー(右上)
- タップで6項目の一覧オーバーレイ表示
- ハンバーガーアイコンは深海ブルー(`#0A2E4E` / デザイントークンの `--c-deep-ocean`)

オーバーレイの実装方法(フルスクリーンオーバーレイ、ドロップダウン等)は Codex の判断に委ねる。ユーザビリティ上自然な実装であれば良い。

### 3. デザイントークンの適用

`docs/04-design-tokens.md` から、以下のトークンを実際に使用する:

| 用途 | トークン |
|---|---|
| ヘッダー背景 | `--c-paper`(暖白)または `--c-snow`(純白) |
| アクティブリンクの強調色 | `--c-deep-ocean` または `--c-pin-job`(夕陽コーラル、要検討) |
| 角丸 | `--radius-full`(カプセル型) |
| シャドウ | `--shadow-sm` または `--shadow-md`(控えめに) |
| ハンバーガーアイコン色 | `--c-deep-ocean` |
| スペーシング | `--space-*` シリーズ(ナビ項目間の余白等) |

CSS変数は `app/globals.css` に `:root` で定義されている想定。なければ Task 01 で `--c-deep-ocean` が追加されているはずなので、それを踏襲して残りのトークンも追加すること。

### 4. `app/layout.tsx` への統合

`Header` を `app/layout.tsx` に配置し、**全ページで共通して表示される**ようにする。

**参照モード**:

```tsx
import { Header } from "@/components/layout/Header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
```

既存の `layout.tsx` の構造(フォント設定等)は壊さず、`Header` の追加のみ行う。

### 5. Canvas とのレイヤー関係の確認

ヘッダーは 3D Canvas(`IslandCanvas`)の**外側**(独立したDOM要素)として実装し、Canvas の `z-index` より確実に手前に来るようにすること。`app/page.tsx` 側で Canvas を配置している場合、Canvas に高い `z-index` が設定されていないか確認し、必要なら Canvas 側を低い値に調整する(ヘッダーが3Dシーンに隠れないようにするため)。

---

## 成果物

```
components/
└── layout/
    └── Header.tsx          (新規)
app/
├── globals.css             (更新: 不足しているデザイントークンCSS変数があれば追加)
└── layout.tsx               (更新: Header を配置)
```

---

## 制約・前提

- `"use client"` を `Header.tsx` の先頭に書く(`usePathname` 等のクライアントフック使用のため)
- ナビゲーションのリンク先は `docs/05-sitemap.md` の6項目から**一字一句変更しない**
- グローバルCTAボタンを追加しない(仕様で明確に否定されている)
- リンク先のページ(`/jobs`, `/spots` 等)は現時点でまだ存在しない可能性が高い。リンクは張るが、リンク先ページの作成は本タスクのスコープ外
- TypeScript の型エラーを出さない(`any` 禁止)
- Next.js の `Link` コンポーネントを使う(`<a>` タグの直書きは避ける、SPA遷移のため)

---

## やってはいけないこと

- ❌ **ヘッダーに固定CTAボタンを追加する**(「応募する」等。これは `/jobs/[slug]` 専用、`docs/05-sitemap.md` §5.2, §7 に明記済み)
- ❌ **ヘッダーのナビ項目・ラベル・順序を変更する**(6項目は確定仕様)
- ❌ **ヘッダーを3D Canvas の内部(R3F コンポーネントとして)に実装する**(HUDレイヤーはDOM要素であるべき、3Dシーンの一部ではない)
- ❌ **Task 02 のスクロール連動回転ロジック(`IslandModel.tsx`)に手を加える**
- ❌ **データ取得(WPGraphQL等)を実装する**(本タスクはUIの骨格のみ、データ接続は別タスク)
- ❌ **「コラム看板」(別要素、`docs/05-sitemap.md` §5.4)を本タスクで実装する**(スコープ外、次タスク以降で扱う)
- ❌ **WordPress側ファイルへの変更**

---

## Git 運用ルール

コミットメッセージ例:
- `Phase 4 Task 04: Header.tsx 新規作成(6項目ナビ + HUDレイヤー)`
- `Phase 4 Task 04: app/layout.tsx に Header を統合`
- `Phase 4 Task 04: globals.css にデザイントークン変数を追加`

---

## レビュー基準(Claude Code レビュー用チェックリスト)

### ファイル構造
- [ ] `components/layout/Header.tsx` が存在するか
- [ ] `app/layout.tsx` が更新され、`Header` を読み込んでいるか
- [ ] Task 02 までの3D関連ファイル(`IslandCanvas.tsx`, `IslandModel.tsx`)が変更されていないか
- [ ] WordPress側ファイルが変更されていないか

### ナビゲーション内容(最重要)
- [ ] 6項目すべてが存在するか: メッセージ / 移住者の声 / 求人 / 観光地 / イベント / お問い合わせ
- [ ] 各項目のリンク先が正しいか: `/message`, `/voices`, `/jobs`, `/spots`, `/events`, `/contact`
- [ ] 項目の順序が `docs/05-sitemap.md` §5.2 の表と一致しているか
- [ ] ロゴが `/` にリンクしているか
- [ ] **グローバルCTAボタンが存在しない**か(「応募する」等のボタンがヘッダーに混入していないか)

### HUDレイヤーとしての健全性
- [ ] `Header` が 3D Canvas の外側(独立したDOM要素)として実装されているか
- [ ] ヘッダーが `position: fixed` または `sticky` で画面に固定されているか
- [ ] z-index が適切に設定され、3D Canvas より手前に表示されるか
- [ ] スクロールしてもヘッダーが画面に留まり続けるか(3Dの回転とは無関係に)

### モバイル対応
- [ ] デスクトップで6項目が横並び表示されるか
- [ ] モバイル幅でハンバーガーメニューに切り替わるか
- [ ] ハンバーガーアイコンの色が `#0A2E4E`(deep-ocean)か
- [ ] ハンバーガーメニューをタップすると6項目のオーバーレイが開くか
- [ ] `aria-label` がハンバーガーボタンに設定されているか

### デザイントークン適用
- [ ] ヘッダー背景に `--c-paper` または `--c-snow` 相当の色が使われているか
- [ ] 角丸が `--radius-full`(カプセル型)になっているか
- [ ] アクティブページのリンクが視覚的に区別されているか(下線 or 色変更)

### コード品質
- [ ] `"use client"` が先頭にあるか
- [ ] Next.js の `Link` コンポーネントを使用しているか(`<a>` タグの直書きでないか)
- [ ] TypeScript の型エラーがないか(`any` 未使用)

---

## 完了後の確認手順

1. `npm run dev` を起動
2. `http://localhost:3000` をブラウザで開く
3. 画面上部にカプセル型のヘッダーが表示され、3D島の手前に来ていることを確認
4. デスクトップ幅で6項目すべてが横並びで表示されることを確認(メッセージ/移住者の声/求人/観光地/イベント/お問い合わせ)
5. ヘッダーに「応募する」等のCTAボタンが**存在しない**ことを確認
6. ブラウザ幅を縮めてモバイル表示に切り替え、ハンバーガーメニューが表示されることを確認
7. ハンバーガーメニューをクリックし、6項目のオーバーレイが開くことを確認
8. スクロールしても、Task 02 で確認した「島が回転する」動作が壊れていないことを確認 — ヘッダー追加で3D側への影響がないか最優先で確認
9. ヘッダーが常にスクロール位置に関わらず画面上部に表示され続けることを確認
10. 各ナビリンクをクリックし、404になる(リンク先ページがまだ存在しないため)が、URLが正しく `/message`, `/voices` 等に遷移しようとすることを確認(リンク自体の正しさの確認)
11. `npm run build` でビルドエラーがないことを確認

---

## 次タスク予告

**Phase 4 Task 05(仮): コラム看板(HUD要素)の実装**

- `docs/05-sitemap.md` §5.4 の仕様に従い、画面左下に常時表示される木製看板風のUIオブジェクトを実装
- クリックで `/columns` へ遷移
- トップページ(`/`)のみに表示

または、先にリンク先の各ページ(`/jobs`, `/message` 等)の雛形を作るタスクに進む可能性もあり、次回相談。
