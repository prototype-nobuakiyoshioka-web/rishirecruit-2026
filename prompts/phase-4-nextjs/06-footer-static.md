# Phase 4 - Task 06: フッター(静的レイアウト)実装

**目的:** 全ページ共通で表示されるフッターを実装する。本タスクでは**静的なレイアウト・コンテンツ・スタイルのみ**を作る。トップページでのフェードイン演出(スクロール連動)は次タスク(Task 07)で扱うため、本タスクでは含めない。

---

## コンテキスト

### 前提環境
- **Phase 4 Task 01-02 完了済み**: GLB表示、スクロール連動回転
- **Phase 4 Task 04 完了済み**: `components/layout/Header.tsx`(HUDレイヤーの実装パターン)
- **Phase 4 Task 05 完了済み**: `components/scene/ColumnBoard.tsx`

### 必ず参照すべきドキュメント
- **`docs/05-sitemap.md` §6(フッターナビゲーション)** ← 本タスクの仕様の出典。特に §6.1(実装時の留保事項)
- **`docs/05-sitemap.md` §3.1 の `/` Home セクション(スクロール挙動)** ← 次タスクとの接続点を理解するため、目を通しておくこと(本タスクでは実装しない)
- **`docs/04-design-tokens.md`** ← カラー・スペーシング・角丸・シャドウのトークン定義
- `components/layout/Header.tsx`(参考実装。独立したコンテナとしてスタイルをまとめるパターンを踏襲する)

### 確定済みフッター仕様(`docs/05-sitemap.md` §6 より転記)

4段構成:

| セクション | 内容 |
|---|---|
| サポート | お問い合わせ(/contact) / プライバシーポリシー(/privacy) / 利用規約(/terms) |
| コンテンツ | 求人(/jobs) / 観光地(/spots) / イベント(/events) / 移住者の声(/voices) / コラム(/columns) / 町からの便り(/message) |
| 外部 | Note公式(→ note.com、リンク先は環境変数 `NEXT_PUBLIC_NOTE_RSS_URL` 等から導出するか、ひとまずダミーURLで仮置き) / 利尻富士町公式サイト(→ town.rishirifuji.hokkaido.jp) |
| SNS | **将来用のスペースを確保するが、現時点ではアイコン非表示**(コンテナは用意し、中身は空または非表示) |

下部に著作権表記: 「© 2026 rishirecruit ・ 利尻富士町」(現時点ではテキストロゴのみ、画像ロゴは未確定のため使わない)

### 今回スコープ外とする項目(`docs/05-sitemap.md` §6.1, §13 より)

- ロゴ画像・キャッチコピーの掲載(保留、テキストの著作権表記のみでよい)
- サイトマップページ(/sitemap)へのリンク(含めない)
- SNSアイコンの実体(枠だけ作る、中身は実装しない)

---

## やってほしいこと

### 1. `components/layout/Footer.tsx` の新規作成

**責務:** 全ページ共通のフッター。4セクション構成 + 著作権表記。

実装内容:
- `"use client"` は不要な想定(動的な状態を持たない静的コンポーネントのため。ただし Next.js の `Link` を使うことに支障はない)
- 4セクション(サポート/コンテンツ/外部/SNS)を見出し付きで配置
- 各セクション内のリンクは `Link`(内部リンク)または `<a>` + `target="_blank"`(外部リンク)で実装
- SNSセクションは**コンテナのみ確保**し、中身(アイコン)は空にする。完全に非表示にするのではなく、将来追加しやすいようコメントで「ここにSNSアイコンを追加予定」等を残しておくこと
- 下部に著作権表記: `© 2026 rishirecruit ・ 利尻富士町`
- **本タスクでは `opacity: 1`(常に表示された状態)で実装する**。Task 07 でスクロール連動のフェード制御を追加する前提だが、今回はその仕組みを作らない(後から差し込みやすい構造にしておけば十分)

**参照モード**(このとおりでなくてOK、より良いパターンがあれば提案してください):

```tsx
import Link from "next/link";

const SUPPORT_LINKS = [
  { label: "お問い合わせ", href: "/contact" },
  { label: "プライバシーポリシー", href: "/privacy" },
  { label: "利用規約", href: "/terms" },
];

const CONTENT_LINKS = [
  { label: "求人", href: "/jobs" },
  { label: "観光地", href: "/spots" },
  { label: "イベント", href: "/events" },
  { label: "移住者の声", href: "/voices" },
  { label: "コラム", href: "/columns" },
  { label: "町からの便り", href: "/message" },
];

const EXTERNAL_LINKS = [
  { label: "Note公式", href: "https://note.com/" /* 仮置き、実URL未確定 */ },
  { label: "利尻富士町公式サイト", href: "https://town.rishirifuji.hokkaido.jp/" },
];

export function Footer() {
  return (
    <footer className="...">
      <div className="...">
        <div>
          <h3>サポート</h3>
          <ul>{/* SUPPORT_LINKS */}</ul>
        </div>
        <div>
          <h3>コンテンツ</h3>
          <ul>{/* CONTENT_LINKS */}</ul>
        </div>
        <div>
          <h3>外部</h3>
          <ul>{/* EXTERNAL_LINKS, target="_blank" rel="noopener noreferrer" */}</ul>
        </div>
        <div>
          <h3>SNS</h3>
          {/* 将来SNSアイコンを追加予定。現時点では空枠のみ */}
          <div className="..." />
        </div>
      </div>
      <div className="...">
        <p>© 2026 rishirecruit ・ 利尻富士町</p>
      </div>
    </footer>
  );
}
```

### 2. `app/layout.tsx` への統合

`Footer` を `Header` と同様に `app/layout.tsx` に配置し、**全ページ共通**で表示する(Header は全ページ、ColumnBoard はトップページ限定だったが、Footer は Header と同じ「全ページ共通」の扱い)。

**参照モード**:

```tsx
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

既存の `layout.tsx` の構造(Header配置等)は壊さず、`Footer` の追加のみ行う。

### 3. デザイントークンの適用

`docs/04-design-tokens.md` から、以下を参考に具体的なトークンを適用する:

| 用途 | 候補トークン |
|---|---|
| フッター背景色 | `--c-deep-ocean`(深海ブルー)を基調にする案を推奨。Header(暖白)・ColumnBoard(木目)とは異なるトーンにすることで、ページの「締め」を表現する。最終判断はCodexに委ねるが、選定理由をコメントに残すこと |
| 見出しテキスト色 | 背景が deep-ocean の場合、`--c-text-inverse`(暗背景上の文字)等、暗背景で読みやすい色を選ぶ |
| リンクテキスト色 | 同上、ホバー時の視覚変化があるとよい |
| セクション間の余白 | `--space-*` シリーズ |
| 角丸 | フッターは画面下部に固定されない通常のブロック要素のため、角丸は不要(0でよい)、または控えめに |

Header・ColumnBoard と同様、**見た目に関わるプロパティの適用漏れがないよう、実装後に必ずレンダリング結果を自己確認すること**(Task 04の反省点)。

### 4. アクセシビリティ対応

- 各セクションに適切な見出しタグ(`<h3>` 等)
- 外部リンクには `target="_blank"` と `rel="noopener noreferrer"` を必ずセット
- `<footer>` 要素を使用(セマンティックHTML)
- リンクのコントラスト比が十分であること(背景色とのコントラストを意識)

---

## 成果物

```
components/
└── layout/
    └── Footer.tsx          (新規)
app/
└── layout.tsx               (更新: Footer を配置)
```

---

## 制約・前提

- 4セクション(サポート/コンテンツ/外部/SNS)の内容・順序は `docs/05-sitemap.md` §6 から変更しない
- SNSセクションは枠のみ、アイコンの実装は行わない
- ロゴ画像・キャッチコピーは追加しない(テキストの著作権表記のみ)
- サイトマップページへのリンクは追加しない
- リンク先ページ(`/jobs`, `/message` 等)はまだ存在しない可能性が高いが、リンク自体は正しく実装すること(404は想定内)
- TypeScript の型エラーを出さない(`any` 禁止)
- 本タスクでは**スクロール連動のフェード制御を実装しない**(Task 07のスコープ、今回は常時 `opacity: 1` でよい)

---

## やってはいけないこと

- ❌ **フッターにロゴ画像・キャッチコピーを追加する**(保留事項、テキストのみ)
- ❌ **SNSアイコンを実装する**(枠だけ、中身は空)
- ❌ **サイトマップページへのリンクを追加する**
- ❌ **スクロール連動のフェードイン・アウト処理を実装する**(Task 07のスコープ、今回は静的表示のみ)
- ❌ **Header(Task 04)・ColumnBoard(Task 05)の実装やスタイルを変更する**
- ❌ **Task 02 のスクロール連動回転ロジック(`IslandModel.tsx`)に手を加える**
- ❌ **データ取得(WPGraphQL等)を実装する**
- ❌ **WordPress側ファイルへの変更**

---

## Git 運用ルール

コミットメッセージ例:
- `Phase 4 Task 06: Footer.tsx 新規作成(4セクション構成、静的レイアウト)`
- `Phase 4 Task 06: app/layout.tsx に Footer を統合`

---

## レビュー基準(Claude Code レビュー用チェックリスト)

### ファイル構造
- [ ] `components/layout/Footer.tsx` が存在するか
- [ ] `app/layout.tsx` が更新され、`Footer` を読み込んでいるか
- [ ] `Header.tsx`, `ColumnBoard.tsx` が変更されていないか
- [ ] `IslandCanvas.tsx`, `IslandModel.tsx` が変更されていないか
- [ ] WordPress側ファイルが変更されていないか

### コンテンツの正確性(最重要)
- [ ] サポートセクション: お問い合わせ・プライバシーポリシー・利用規約の3項目があるか
- [ ] コンテンツセクション: 求人・観光地・イベント・移住者の声・コラム・町からの便りの6項目があるか
- [ ] 外部セクション: Note公式・利尻富士町公式サイトの2項目があるか
- [ ] SNSセクション: 枠は存在するが、アイコンの実体が実装されていないか(空であることを確認)
- [ ] 著作権表記が「© 2026 rishirecruit ・ 利尻富士町」になっているか
- [ ] ロゴ画像・キャッチコピーが追加されていないか
- [ ] サイトマップページへのリンクが追加されていないか

### スコープ境界(重要)
- [ ] スクロール連動のフェード処理が実装されていないか(本タスクのスコープ外)
- [ ] `Footer` が常時 `opacity: 1` で表示される状態になっているか

### 表示制御
- [ ] `Footer` が全ページ共通で表示されるか(layout.tsx に配置)
- [ ] Header・ColumnBoard と並んで存在しても、レイアウトが崩れていないか

### アクセシビリティ
- [ ] `<footer>` 要素が使われているか
- [ ] 外部リンクに `target="_blank"` + `rel="noopener noreferrer"` があるか
- [ ] 見出しタグが各セクションに使われているか
- [ ] テキストと背景のコントラストが十分か

### デザイントークン適用
- [ ] フッター背景色にデザイントークンが使われ、選定理由がコメントされているか
- [ ] Header・ColumnBoardとは異なるビジュアルトーンになっているか
- [ ] レスポンシブ対応(モバイル幅で4セクションが縦積み等、読みやすいレイアウトになっているか)

### コード品質
- [ ] Next.js の `Link` コンポーネントを内部リンクに使用しているか
- [ ] TypeScript の型エラーがないか(`any` 未使用)

---

## 完了後の確認手順

1. `npm run dev` を起動
2. `http://localhost:3000` をブラウザで開く
3. ページ下部までスクロールし、フッターが表示されることを確認(本タスクでは常時表示なので、すぐ見えてもスクロール後でも良い)
4. 4セクション(サポート/コンテンツ/外部/SNS)がすべて表示されていることを確認
5. SNSセクションが空(枠のみ)であることを確認
6. 著作権表記が正しく表示されていることを確認
7. 各内部リンクをクリックし、正しいURLへ遷移しようとすることを確認(404は想定内)
8. 外部リンク(Note公式・町公式サイト)が新しいタブで開くことを確認
9. ブラウザ幅を縮めてモバイル表示を確認し、レイアウトが崩れていないことを確認
10. Header・ColumnBoardの表示・動作に影響がないことを確認
11. `npm run build` でビルドエラーがないことを確認

---

## 次タスク予告

**Phase 4 Task 07: フッターのスクロール連動フェード制御**

- `docs/05-sitemap.md` §3.1(/ Home のスクロール挙動)の仕様に従い、トップページでのみ以下を実装:
  - 島の回転が `±45°`(最大値)に到達したタイミングを検知
  - 検知後、Footer の `opacity` を `0 → 1` にフェードイン
  - それ以降のスクロールでは見た目上の変化なし(スクロール自体はロックしない)
- Task 02 の `IslandModel.tsx` の回転ロジックと、本タスクで作った `Footer.tsx` を接続する設計が必要(状態管理の方法は次プロンプトで検討)
- 他ページ(`/jobs` 等)では Footer は常時表示のままで良い(フェード制御はトップページ限定)
