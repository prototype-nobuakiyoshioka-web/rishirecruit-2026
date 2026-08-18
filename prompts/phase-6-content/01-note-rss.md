# Phase 6 Task 01: Note RSS連携の実装

## 目的

/columns ページで表示しているダミーデータを、
note.com の実際の記事(RSS経由)に差し替える。

## 前提

- note アカウント: `ample_bear2942`
- RSS URL: `https://note.com/ample_bear2942/rss`
- 取得対象: ユーザーの全記事
- 設計は `docs/03-content-schema.md` §7 に記載済み

## 要件

### 環境変数

`.env.local` に以下を追加:

NEXT_PUBLIC_NOTE_RSS_URL=https://note.com/ample_bear2942/rss


`.env.local` が `.gitignore` に含まれているか確認すること。

### RSSパーサーの導入

`rss-parser` または `fast-xml-parser` を使用する。
どちらを採用するかは実装者の判断に委ねる。

バージョンは AGENTS.md の「バージョン指定の読み替えルール」に従い、
事前にレジストリ存在確認をすること。

### 取得する項目

RSSの各記事から以下を取得する:

| 項目 | 用途 |
|---|---|
| title | 記事タイトル |
| link | note.com の記事URL |
| pubDate | 投稿日 |
| contentSnippet または description | 抜粋テキスト |
| 本文中の画像URL | サムネイル(取得できる場合) |

note の RSS は `<content:encoded>` に本文HTMLが入っている場合がある。
そこから最初の画像URLを抽出できれば、サムネイルとして使用する。
取得できない場合は画像なしで表示する。

### 実装場所

新規ファイル: `lib/note/fetch-articles.ts`

エクスポートする関数:
```ts
export interface NoteArticle {
  title: string;
  link: string;
  publishedAt: string;
  excerpt: string | null;
  imageUrl: string | null;
}

export async function fetchNoteArticles(): Promise<NoteArticle[]>
```

### エラーハンドリング

- RSS取得に失敗した場合は空配列を返す
- console.error でログを出す
- ページがエラーで落ちないようにする

### キャッシュ設定

Next.js の ISR を使用し、1時間ごとに再生成する。

`app/columns/page.tsx` に以下を追加:
```ts
export const revalidate = 3600;
```

### /columns ページの更新

- ダミーデータの参照を削除し、`fetchNoteArticles()` に差し替える
- 既存のカードレイアウトはそのまま使用する
- 各カードのリンクは `target="_blank"` + `rel="noopener noreferrer"`
- 記事が0件の場合の表示を用意する
- 末尾の「求人を見る →」CTAは維持する

### 日付のフォーマット

pubDate は RFC822 形式で返るため、
「2026年8月14日」のような日本語表記に変換する。

## 制約

### 変更してよいファイル
- lib/note/fetch-articles.ts(新規)
- app/columns/page.tsx
- .env.local
- package.json(RSSパーサー追加)

### 変更してはいけないファイル
- 3D関連ファイル全て
- Header.tsx / Footer.tsx / ColumnBoard.tsx
- 他のページファイル
- WordPress側ファイル全て

### その他
- `lib/dummy-data/` は削除しない
- TypeScript の型エラーを出さない(any 禁止)
- next/image を使う場合、note.com のドメインを
  next.config.ts の remotePatterns に追加すること

## セルフ検証

### 1. RSS取得の確認

実装後、実際に記事が取得できるか確認する。
一時的にログを出力し、以下を確認:

- 取得できた記事数
- 各記事の title / link / pubDate が正しいか
- imageUrl が取得できているか

確認後、ログは削除すること。

### 2. 表示確認

/columns ページで以下を確認:
- 記事一覧が表示されるか
- タイトル・日付・抜粋が正しく表示されるか
- サムネイル画像が表示されるか(取得できた場合)
- リンクをクリックして note.com の記事が開くか

### 3. エラー時の挙動確認

環境変数を一時的に不正な値にして、
ページがエラーで落ちずに空表示になるか確認する。
確認後、正しい値に戻すこと。

## 受け入れ条件

- [ ] /columns で note の実記事が表示される
- [ ] 記事タイトルが正しく表示される
- [ ] 投稿日が日本語形式で表示される
- [ ] 抜粋テキストが表示される
- [ ] リンクが note.com の記事URLを指している
- [ ] リンクが新しいタブで開く
- [ ] RSS取得失敗時にページが落ちない
- [ ] npm run build が通る

## 完了報告テンプレート

```md
## 完了報告

### 採用したライブラリ
（rss-parser / fast-xml-parser のどちらか + バージョン + 選定理由）

### 対象ファイル
（変更した全ファイルを列挙）

### 制約遵守
- 変更禁止ファイルに触れていない: ✅/❌
- .env.local が .gitignore に含まれている: ✅/❌

### セルフ検証結果

#### RSS取得
- 取得できた記事数: ?件
- title 取得: ✅/❌
- link 取得: ✅/❌
- pubDate 取得: ✅/❌
- imageUrl 取得: ✅/❌(取得できた記事数 / 全記事数)

#### 表示
- 一覧表示: ✅/❌
- リンク動作: ✅/❌

#### エラー時
- 空表示になる: ✅/❌

### 自動ゲート
- npm run lint       → 結果
- npm run typecheck  → 結果
- npm run build      → 成功/失敗

### 受け入れ条件
（チェックリストを ✅/❌ で回答）

### スクリーンショット
（/columns ページ、PC・SP）

### 未実装・TODO・妥協点
（正直に列挙）
```

━━━━━━━━━━━━━━━━━━━━━━

ファイル作成 → 内容を読む → 実行 の順で進めてください。
セルフ検証(実際のRSS取得確認)を必ず実施してから報告してください。
