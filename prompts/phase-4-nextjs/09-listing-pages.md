# Phase 4 - Task 09: 一覧系ページの雛形作成(ダミーデータ)

**目的:** これまでHeader・Footer・コラム看板からリンクされていながら未実装だった一覧系ページ(`/jobs`, `/spots`, `/events`, `/voices`, `/columns`)を作成する。WPGraphQL・Note RSSへの実データ接続は行わず、**各3件程度のダミーデータ**でカードグリッドの見た目を確認できる状態にする。

---

## コンテキスト

### 前提環境
- **Phase 4 Task 01-02, 04, 05, 08 完了済み**: 3D表示、Header、ColumnBoard、Footer(情報パネル)
- 現状、`/jobs` 等にアクセスすると404になる(ページ自体が存在しない)

### 必ず参照すべきドキュメント
- **`docs/03-content-schema.md`** ← 各CPTのフィールド定義(ダミーデータの形を正確に再現するため)
  - §3(job_posting)、§4(touristspot)、§5(event)、§6(testimonial)
- **`docs/05-sitemap.md` §3.1-3.2** ← 各一覧ページの役割・要素
- **`docs/04-design-tokens.md`** ← カラー・スペーシング・角丸・シャドウ
- **`docs/06-messaging.md`** ← 各ページのヒーローコピー、マイクロコピー(空状態の文言等)
- `components/layout/Header.tsx`, `Footer.tsx`(既存の実装パターン、コーディングスタイルの参考)

### 本タスクの位置づけ

カテゴリ別タスク分割の1つ目(一覧系)。後続タスクで詳細ページ(Task 10)・フォーム系(Task 11)・静的ページ(Task 12)を扱う。**本タスクでは一覧ページのみ**を作成する。

---

## やってほしいこと

### 1. 共通: ダミーデータの作成

**責務:** 各CPTのダミーデータを定数として用意する。後で実データ(WPGraphQL)に差し替えやすいよう、型を明確にしておく。

配置場所: `lib/dummy-data/` ディレクトリを新規作成し、CPTごとにファイルを分ける。

```
lib/
└── dummy-data/
    ├── jobs.ts
    ├── spots.ts
    ├── events.ts
    └── voices.ts
```

各ファイルの実装方針:
- TypeScriptの型定義(`interface` または `type`)を `docs/03-content-schema.md` のフィールド定義に**正確に**対応させる(フィールド名はGraphQLのcamelCase変換後の名前を使う、§9.2参照)
- 各3件のダミーデータを配列でエクスポート
- 画像は実ファイルがないため、`https://placehold.jp/` 等のプレースホルダー画像サービスのURLを使うか、`public/` 配下に簡易的なプレースホルダー画像を用意してパスを指定する(Codexの判断で良い方法を選んでよい)
- テキスト内容は仕様書のサンプル文言(例:「月額18.5万円〜」「主事補(一般事務)」等)を参考に、利尻富士町という設定に沿った自然な内容にする

**参照モード**(このとおりでなくてOK、より良いパターンがあれば提案してください):

```ts
// lib/dummy-data/jobs.ts
export interface DummyJobPosting {
  id: string;
  slug: string;
  title: string;
  employmentType: string;
  catchCopy: string;
  salary: string;
  workHours: string;
  pinLocation: string;
  thumbnailImage: { sourceUrl: string; altText: string } | null;
}

export const DUMMY_JOBS: DummyJobPosting[] = [
  {
    id: "1",
    slug: "honchou-jimu-2026",
    title: "主事補(一般事務)",
    employmentType: "正規職員",
    catchCopy: "島の暮らしを、窓口から支える仕事。",
    salary: "月額18.5万円〜",
    workHours: "8:30〜17:15",
    pinLocation: "town_hall",
    thumbnailImage: null,
  },
  // ...あと2件
];
```

### 2. `/jobs` 求人一覧ページ

新規ファイル: `app/jobs/page.tsx`

実装内容:
- ヒーロー: 「あなたの行き先を、ここから。」+ サブコピー「利尻富士町で募集中の仕事、すべて。」(`docs/06-messaging.md` §4より)
- `DUMMY_JOBS` をカードグリッドで表示
- 各カード: サムネイル(プレースホルダー)・職種名(title)・雇用形態(employmentType)・給与(salary)・「詳細を見る →」リンク(リンク先は `/jobs/[slug]`、Task 10で実装するため現時点では404でも構わない)
- カードのクリックでページ遷移するか、「詳細を見る」リンクのみでも良い(Codexの判断)

### 3. `/spots` 観光地一覧ページ

新規ファイル: `app/spots/page.tsx`

実装内容:
- ヒーロー: 「島を、知る。」+ サブコピー「あなたが暮らす島の、見どころを巡る。」
- `DUMMY_SPOTS` をカードグリッドで表示
- 各カード: サムネイル・スポット名・カテゴリ・「詳細を見る →」

### 4. `/events` イベント一覧ページ

新規ファイル: `app/events/page.tsx`

実装内容:
- ヒーロー: 「今、この島で起きていること。」+ サブコピー「開催中・予定のイベントをまとめて。」
- `DUMMY_EVENTS` をカードグリッドで表示
- 各カード: サムネイル・イベント名・開催日・会場・「詳細を見る →」
- (任意)「開催中」「予定」のバッジ表示。本タスクでは日付の動的判定ロジックは実装せず、ダミーデータ側にステータスを仮で持たせる程度でよい

### 5. `/voices` 移住者の声一覧ページ

新規ファイル: `app/voices/page.tsx`

実装内容:
- ヒーロー: (`docs/06-messaging.md` に明記がないため、`docs/05-sitemap.md` の役割からCodexが適切なコピーを考案してよい。例:「ここに来た人たちの、リアルな声。」等。ブランドトーン(`docs/06-messaging.md` §6, §7のNG表現リストに注意)に従うこと)
- `DUMMY_VOICES` をカードグリッドで表示
- 各カード: メイン写真・キャッチコピー・移住年・「詳細を見る →」

### 6. `/columns` コラム一覧ページ

新規ファイル: `app/columns/page.tsx`

実装内容:
- ヒーロー: 「島から、声をのせて。」+ サブコピー「Noteで連載中の島ぐらしコラム。」
- 本タスクでは**Note RSSへの実接続は行わない**(別タスクのスコープ)。代わりに、コラム記事のダミーデータ(タイトル・抜粋・投稿日)を3件用意し、カード表示する
- 各カードのリンクは外部リンク想定(`target="_blank"`)だが、ダミーデータのため実際には `https://note.com/` 等の仮URLで構わない
- 末尾に「求人を見る →」CTA(`docs/05-sitemap.md` §7のCTA配置戦略に従う)

### 7. 共通コンポーネントの検討

5ページとも「ヒーロー(タイトル+サブコピー)」「カードグリッド」という似た構造を持つ。重複を避けるため、以下のような共通コンポーネントを作ることを推奨する(必須ではない、Codexの判断):

```
components/
└── ui/
    ├── PageHero.tsx       (ヒーロータイトル+サブコピーの共通レイアウト)
    └── CardGrid.tsx        (カードグリッドのレイアウト枠、中身は各ページで渡す)
```

無理に共通化せず、各ページで個別に実装してもよいが、その場合はコードの重複が大きくならないよう注意すること。

---

## 成果物

```
lib/
└── dummy-data/
    ├── jobs.ts          (新規)
    ├── spots.ts         (新規)
    ├── events.ts        (新規)
    └── voices.ts         (新規)
app/
├── jobs/
│   └── page.tsx          (新規)
├── spots/
│   └── page.tsx          (新規)
├── events/
│   └── page.tsx          (新規)
├── voices/
│   └── page.tsx          (新規)
└── columns/
    └── page.tsx           (新規)
components/
└── ui/                    (任意、共通化する場合)
    ├── PageHero.tsx
    └── CardGrid.tsx
```

---

## 制約・前提

- **WPGraphQLへの実接続・データ取得は行わない**(本タスクのスコープ外、将来のタスクで対応)
- **Note RSSへの実接続は行わない**(`/columns` も同様にダミーデータ)
- ダミーデータの型は `docs/03-content-schema.md` のフィールド定義(camelCase変換後)に正確に対応させる(将来の実データ差し替えを楽にするため)
- 各ページのヒーローコピーは `docs/06-messaging.md` の指定がある場合はそれに**正確に**従う(`/voices` のみ指定なし、Codexが考案)
- TypeScript の型エラーを出さない(`any` 禁止)
- 既存の Header・Footer・ColumnBoard・3D表示(`app/page.tsx`)には影響を与えない
- デザイントークン(`docs/04-design-tokens.md`)を適用し、ピン色(求人=コーラル/観光地=ゴールド/イベント=ピンク)をカテゴリバッジ等で活用できると統一感が出る(任意)

---

## やってはいけないこと

- ❌ **WPGraphQLクライアントの実装・実際のAPI呼び出し**(本タスクはダミーデータのみ)
- ❌ **Note RSSパーサーの実装・実際のフェッチ処理**
- ❌ **詳細ページ(`/jobs/[slug]` 等)の実装**(Task 10のスコープ)
- ❌ **`/apply`, `/contact` 等のフォームページの実装**(Task 11のスコープ)
- ❌ **`docs/06-messaging.md` §7 のNG表現を使う**(「夢を叶える」「絶対」「あなたを変える」等)
- ❌ **Header.tsx, Footer.tsx, ColumnBoard.tsx, IslandModel.tsx, IslandCanvas.tsx の変更**
- ❌ **WordPress側ファイルへの変更**
- ❌ **ヒーローコピーを `docs/06-messaging.md` の指定から変更する**(`/voices` 以外)

---

## Git 運用ルール

コミットメッセージ例:
- `Phase 4 Task 09: ダミーデータ(jobs/spots/events/voices) 新規作成`
- `Phase 4 Task 09: /jobs 一覧ページ実装`
- `Phase 4 Task 09: /spots 一覧ページ実装`
- `Phase 4 Task 09: /events 一覧ページ実装`
- `Phase 4 Task 09: /voices 一覧ページ実装`
- `Phase 4 Task 09: /columns 一覧ページ実装(ダミーコラムデータ)`

ページ単位でコミットを分けることを推奨(後から特定ページだけ調整しやすくするため)。

---

## レビュー基準(Claude Code レビュー用チェックリスト)

### ファイル構造
- [ ] `lib/dummy-data/` 配下に4ファイル(jobs/spots/events/voices)が存在するか
- [ ] `app/jobs/page.tsx`, `app/spots/page.tsx`, `app/events/page.tsx`, `app/voices/page.tsx`, `app/columns/page.tsx` が存在するか
- [ ] Header・Footer・ColumnBoard・3D関連ファイルが変更されていないか
- [ ] WordPress側ファイルが変更されていないか

### コンテンツ正確性
- [ ] 各ページのヒーローコピーが `docs/06-messaging.md` の指定と一致しているか(該当ページ)
- [ ] NG表現(`docs/06-messaging.md` §7)が使われていないか
- [ ] 各CPTのダミーデータが `docs/03-content-schema.md` のフィールド定義と整合しているか(フィールド名・型)

### 機能
- [ ] 各ページが5ページとも `http://localhost:3000/xxx` でアクセスでき、404にならないか
- [ ] 各3件程度のダミーデータがカードグリッドで表示されるか
- [ ] 「詳細を見る →」等のリンクが適切な詳細ページURLを指しているか(リンク先が現状404でも、URL自体は正しいか)
- [ ] `/columns` の各カードが外部リンク想定の実装になっているか(`target="_blank"`)

### コード品質
- [ ] ダミーデータの型定義が明確か(`any` 未使用)
- [ ] デザイントークンが適用されているか(色・スペーシング・角丸)
- [ ] レスポンシブ対応(モバイル幅でカードグリッドが崩れないか)
- [ ] Header・Footerが他ページ同様に正しく表示されるか(全ページ共通レイアウトとして機能しているか)

---

## 完了後の確認手順

1. `npm run dev` を起動
2. `http://localhost:3000/jobs` にアクセスし、ヒーロー + 3件のダミー求人カードが表示されることを確認
3. `http://localhost:3000/spots` にアクセスし、同様に観光地カードを確認
4. `http://localhost:3000/events` にアクセスし、同様にイベントカードを確認
5. `http://localhost:3000/voices` にアクセスし、同様に移住者の声カードを確認
6. `http://localhost:3000/columns` にアクセスし、ダミーコラム記事カードを確認
7. 各ページでHeader・Footerが正しく表示されることを確認(他ページ共通レイアウトとして機能しているか)
8. ブラウザ幅をモバイルに縮小し、各ページのレイアウトが崩れないことを確認
9. `npm run build` でビルドエラーがないことを確認

---

## 次タスク予告

**Phase 4 Task 10: 詳細系ページの雛形作成(ダミーデータ)**

- `/jobs/[slug]`, `/spots/[slug]`, `/events/[slug]`, `/voices/[slug]` の動的ルートページ
- 本タスクで作成したダミーデータの1件を使い、詳細レイアウトを確認
- 求人詳細ページには固定CTA「応募する」(`docs/05-sitemap.md` §7.1)の実装も含む想定
