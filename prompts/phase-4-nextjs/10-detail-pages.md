# Phase 4 - Task 10: 詳細系ページの雛形作成(ダミーデータ)

**目的:** Task 09 で作成した一覧ページからリンクされている詳細ページ(`/jobs/[slug]`, `/spots/[slug]`, `/events/[slug]`, `/voices/[slug]`)を実装する。Task 09 のダミーデータをそのまま使い、各CPTの全フィールドを展開したレイアウトを作る。求人詳細ページには `docs/05-sitemap.md` §7.1 で定義済みの固定CTA「応募する」を実装する。

---

## コンテキスト

### 前提環境
- **Phase 4 Task 09 完了済み**: `lib/dummy-data/`(jobs/spots/events/voices)、5つの一覧ページ、`components/ui/PageHero.tsx`, `CardGrid.tsx`, `lib/dummy-data/shared.ts`
- 一覧ページの各カードから `/jobs/[slug]` 等へのリンクが既に張られている(現状404)

### 必ず参照すべきドキュメント
- **`docs/03-content-schema.md`** ← 各CPTの全フィールド定義(詳細ページで全展開する項目の正確な把握に必須)
  - §3(job_posting、22フィールド・5タブ)、§4(touristspot)、§5(event)、§6(testimonial)
- **`docs/05-sitemap.md` §3.1** ← 各詳細ページの役割
- **`docs/05-sitemap.md` §7, §7.1** ← CTA配置戦略、求人詳細の固定CTA仕様(最重要)
- **`docs/06-messaging.md`** ← マイクロコピー、CTAラベル
- `lib/dummy-data/`(Task 09で作成済みのダミーデータ、型定義を再利用・拡張する)
- `components/ui/PageHero.tsx`(Task 09、再利用を検討)

### 確定済み:求人詳細の固定CTA仕様(`docs/05-sitemap.md` §7.1 より転記)

| 項目 | 仕様 |
|---|---|
| 形状 | 画面下部に常時表示される横長バー(モバイル)/ 右サイドバーに固定(デスクトップ) |
| 色 | 夕陽コーラル(`#FF7B5B` / `--c-pin-job`)背景・白文字 |
| テキスト | 「応募する」 |
| 挙動 | クリックで `/apply?job=[slug]` へ遷移(`/apply` は未実装のため404でよい、Task 11のスコープ) |
| スクロール時 | 常に表示(fixed/sticky) |
| モバイル | 親指届きやすい下部固定 |
| アクセシビリティ | `aria-label` 設定、フォーカス可能、十分なタップ領域(44×44px以上) |

---

## やってほしいこと

### 1. ダミーデータの拡張(詳細フィールド分)

Task 09 で作成した `lib/dummy-data/jobs.ts` 等は、一覧表示に必要な最小限のフィールドのみだった可能性が高い。詳細ページで使う残りのフィールドを各ファイルに追加する。

#### `lib/dummy-data/jobs.ts` に追加するフィールド(`docs/03-content-schema.md` §3.2 より)

Tab 2-5 の全フィールド:
- `description`(業務内容、wysiwyg相当のためダミーは複数段落のテキストでよい)
- `desiredPerson`(求める人材)
- `requiredQualifications`(必要資格)
- `salaryDetail`(給与詳細)
- `workHoursDetail`(勤務時間詳細)
- `holiday`(休日・休暇)
- `socialInsurance`(社会保険)
- `benefits`(福利厚生)
- `housingSupportAvailable`(boolean)
- `housingSupportDetail`(housingSupportAvailableがtrueの時のみ意味を持つ、ダミーでは両パターンのデータを用意するか、3件中1件のみtrueにする等で表現してよい)
- `smokingPolicy`(受動喫煙対策)
- `trialPeriod`(試用・研修期間)
- `workAddress`(勤務地住所)
- `workAddressDetail`(勤務地詳細)
- `applicationFlow`(応募後の流れ)

#### `lib/dummy-data/spots.ts` に追加するフィールド(`docs/03-content-schema.md` §4.2 より)

- `description`, `galleryImages`(配列、ダミーは2-3枚分のプレースホルダー), `bestSeason`, `address`, `accessInfo`, `openHours`, `closedDays`, `price`, `phone`, `websiteUrl`

#### `lib/dummy-data/events.ts` に追加するフィールド(`docs/03-content-schema.md` §5.2 より)

- `description`, `galleryImages`, `venueName`, `address`, `accessInfo`, `price`, `registrationUrl`, `contact`, `isRecurring`, `recurrenceNote`, `organizer`

#### `lib/dummy-data/voices.ts` に追加するフィールド(`docs/03-content-schema.md` §6.2 より)

- `leadText`(リード文)、`interviewBody`(インタビュー本文、複数段落のダミーテキスト)、`galleryImages`(任意)、`relatedJob`(任意、`jobs.ts` のいずれか1件のslugを参照する形でダミーを作ってもよい)

### 2. `app/jobs/[slug]/page.tsx`

**責務:** 求人詳細。ACFフィールド全展開 + 固定CTA。

実装内容:
- Next.js の動的ルート(`params.slug`)で `DUMMY_JOBS` から該当データを検索
- 該当データがない場合は `notFound()`(Next.jsの仕組み)を呼ぶ
- タブごとに見出しを立てて情報を整理して表示(募集の基本/業務内容/条件・待遇/勤務地/応募、`docs/03-content-schema.md` §3.2 のタブ構成に対応)
- `housingSupportAvailable` が true の時のみ `housingSupportDetail` を表示する条件分岐(WP側のconditional logicと同じロジックをフロントでも再現)
- **固定CTA「応募する」を実装**(`components/layout/StickyApplyCta.tsx` として新規切り出すことを推奨。`docs/05-sitemap.md` の想定コンポーネント名と一致させる)
  - クリックで `/apply?job=${slug}` へ遷移
  - デスクトップ: 右サイドバーに固定、モバイル: 画面下部に固定
  - 夕陽コーラル背景、`docs/04-design-tokens.md` の `--shadow-pop-coral` 等を活用して「押せる感」を出す

**参照モード**(このとおりでなくてOK、より良いパターンがあれば提案してください):

```tsx
// components/layout/StickyApplyCta.tsx
"use client";
import Link from "next/link";

export function StickyApplyCta({ jobSlug }: { jobSlug: string }) {
  return (
    <Link
      href={`/apply?job=${jobSlug}`}
      aria-label="この求人に応募する"
      className="fixed bottom-0 inset-x-0 md:bottom-auto md:top-1/2 md:right-6 md:inset-x-auto md:-translate-y-1/2 ..."
    >
      応募する
    </Link>
  );
}
```

```tsx
// app/jobs/[slug]/page.tsx
import { notFound } from "next/navigation";
import { DUMMY_JOBS } from "@/lib/dummy-data/jobs";
import { StickyApplyCta } from "@/components/layout/StickyApplyCta";

export default function JobDetailPage({ params }: { params: { slug: string } }) {
  const job = DUMMY_JOBS.find((j) => j.slug === params.slug);
  if (!job) notFound();

  return (
    <>
      {/* タブごとのセクション展開 */}
      <StickyApplyCta jobSlug={job.slug} />
    </>
  );
}
```

### 3. `app/spots/[slug]/page.tsx`

**責務:** 観光地詳細。

実装内容:
- 動的ルートでダミーデータを検索、`notFound()` 対応
- ヒーロー画像/動画相当の表示(プレースホルダー)
- 説明文・ギャラリー画像・訪問情報(住所・アクセス・営業時間・定休日・料金・電話・公式サイト)を展開
- 末尾に「現在募集中の求人を見る → (/jobs)」リンク(`docs/05-sitemap.md` §7のCTA戦略)

### 4. `app/events/[slug]/page.tsx`

**責務:** イベント詳細。

実装内容:
- 動的ルートでダミーデータを検索、`notFound()` 対応
- 日時・会場・主催・参加費・申込URL(あれば外部リンク)・問い合わせ先を展開
- 説明文・ギャラリー画像
- 末尾に「求人一覧 → (/jobs)」リンク

### 5. `app/voices/[slug]/page.tsx`

**責務:** 移住者の声詳細。

実装内容:
- 動的ルートでダミーデータを検索、`notFound()` 対応
- メイン写真 → プロフィール(移住前/移住後)→ リード文 → インタビュー本文 → (該当データがあれば)関連求人カード、という順序(`docs/03-content-schema.md` §6.4)
- `relatedJob` が設定されているダミーデータの場合のみ関連求人カードを表示する条件分岐
- 末尾に「関連する求人を見る →」(relatedJobがある場合)または「求人一覧 →」(ない場合)

### 6. パンくずリストの実装(任意・推奨)

`docs/05-sitemap.md` §12 にパンくず仕様がある:

```
ホーム > 求人 > 主事補(一般事務)
ホーム > 観光地 > 姫沼
ホーム > イベント > 鬼脇まつり
ホーム > 移住者の声 > 鈴木さん(2023年移住)
```

各詳細ページの先頭に配置することを推奨するが、必須ではない(時間があれば実装、なければ次タスク以降でも良い)。

---

## 成果物

```
lib/
└── dummy-data/
    ├── jobs.ts          (更新: 詳細フィールド追加)
    ├── spots.ts         (更新: 詳細フィールド追加)
    ├── events.ts        (更新: 詳細フィールド追加)
    └── voices.ts         (更新: 詳細フィールド追加)
app/
├── jobs/
│   └── [slug]/
│       └── page.tsx      (新規)
├── spots/
│   └── [slug]/
│       └── page.tsx      (新規)
├── events/
│   └── [slug]/
│       └── page.tsx      (新規)
└── voices/
    └── [slug]/
        └── page.tsx       (新規)
components/
└── layout/
    └── StickyApplyCta.tsx (新規)
```

---

## 制約・前提

- WPGraphQLへの実接続は行わない(本タスクのスコープ外)
- 既存の一覧ページ(Task 09)からのリンク先(`/jobs/${slug}` 等)と、本タスクで実装するスラッグが一致すること
- `docs/03-content-schema.md` のフィールド名(camelCase変換後)に正確に対応させる
- `housingSupportDetail` の表示条件(`housingSupportAvailable === true`の時のみ)を必ず実装する(WP側のconditional logicと同じ挙動)
- 固定CTA「応募する」は `docs/05-sitemap.md` §7.1 の仕様(色・配置・テキスト・タップ領域)に正確に従う
- TypeScript の型エラーを出さない(`any` 禁止)
- 既存の一覧ページ・Header・Footer・ColumnBoard・3D表示には影響を与えない

---

## やってはいけないこと

- ❌ **WPGraphQLクライアントの実装・実際のAPI呼び出し**
- ❌ **`/apply` ページ自体の実装**(Task 11のスコープ、リンクを張るだけでよい)
- ❌ **固定CTAの色・テキストを `docs/05-sitemap.md` の指定から変更する**(「応募する」「夕陽コーラル」は確定仕様)
- ❌ **`housingSupportDetail` を条件分岐なしで常に表示する**(WP側の仕様と矛盾する)
- ❌ **Task 09 で作成した一覧ページのレイアウト・コンテンツを変更する**(ダミーデータファイルへのフィールド追加は可、page.tsx自体の変更は不要)
- ❌ **Header.tsx, Footer.tsx, ColumnBoard.tsx, IslandModel.tsx, IslandCanvas.tsx の変更**
- ❌ **WordPress側ファイルへの変更**

---

## Git 運用ルール

コミットメッセージ例:
- `Phase 4 Task 10: ダミーデータに詳細フィールドを追加`
- `Phase 4 Task 10: StickyApplyCta.tsx 新規作成`
- `Phase 4 Task 10: /jobs/[slug] 詳細ページ実装`
- `Phase 4 Task 10: /spots/[slug] 詳細ページ実装`
- `Phase 4 Task 10: /events/[slug] 詳細ページ実装`
- `Phase 4 Task 10: /voices/[slug] 詳細ページ実装`

---

## レビュー基準(Claude Code レビュー用チェックリスト)

### ファイル構造
- [ ] 4つの `[slug]/page.tsx` が存在するか
- [ ] `StickyApplyCta.tsx` が存在するか
- [ ] ダミーデータファイルが詳細フィールドを含むよう更新されているか
- [ ] Task 09 の一覧ページ・Header・Footer・ColumnBoard・3D関連が変更されていないか
- [ ] WordPress側ファイルが変更されていないか

### コンテンツ正確性(最重要)
- [ ] 求人詳細: 5タブ相当の全フィールドが展開されているか(`docs/03-content-schema.md` §3.2 と照合)
- [ ] `housingSupportDetail` が `housingSupportAvailable === true` の時のみ表示されるか
- [ ] 観光地詳細: 訪問情報(住所・アクセス・営業時間・定休日・料金・電話・サイト)が展開されているか
- [ ] イベント詳細: 日時・会場・主催・参加費・申込・問い合わせが展開されているか
- [ ] 移住者の声詳細: メイン写真→プロフィール→リード文→本文→関連求人(任意)の順序になっているか

### 固定CTA(最重要)
- [ ] 「応募する」のテキストが正確か
- [ ] 背景色が夕陽コーラル(`#FF7B5B` / `--c-pin-job`)か(Task 09で追加したCSS変数を再利用しているか)
- [ ] クリックで `/apply?job=${slug}` へ遷移しようとするか
- [ ] デスクトップでサイドバー固定、モバイルで下部固定になっているか
- [ ] `aria-label` が設定されているか
- [ ] タップ領域が44×44px以上か

### データ整合性
- [ ] `notFound()` が存在しないslugアクセス時に呼ばれるか
- [ ] 一覧ページ(Task 09)からのリンク先slugと、詳細ページで検索するslugが一致するか
- [ ] `relatedJob` がある場合のみ関連求人カードが表示されるか(voices詳細)

### コード品質
- [ ] TypeScript の型エラーがないか(`any` 未使用)
- [ ] デザイントークンが適用されているか
- [ ] レスポンシブ対応

---

## 完了後の確認手順

1. `npm run dev` を起動
2. `/jobs` から任意の求人カードをクリックし、`/jobs/[slug]` に正しく遷移、詳細が表示されることを確認
3. 求人詳細ページで固定CTA「応募する」が画面に表示され続けることを確認(スクロールしても消えない)
4. CTAをクリックし、`/apply?job=[slug]` へ遷移しようとすることを確認(404でよい)
5. 住居サポートありの求人とそうでない求人で、`housingSupportDetail` の表示有無が切り替わることを確認
6. `/spots`, `/events`, `/voices` からも同様にカードをクリックし、各詳細ページが表示されることを確認
7. 移住者の声で `relatedJob` ありのデータの場合、関連求人カードが表示されることを確認
8. 存在しないslug(例: `/jobs/nonexistent-slug`)にアクセスし、404相当の表示になることを確認
9. モバイル幅で固定CTAが画面下部に表示され、タップしやすいサイズであることを確認
10. `npm run build` でビルドエラーがないことを確認

---

## 次タスク予告

**Phase 4 Task 11: フォーム系ページの雛形作成**

- `/apply`, `/apply/thanks`, `/contact` の実装
- `docs/05-sitemap.md` §3.3 のフォーム項目定義に従う
- 送信処理(WordPress連携等)は本タスクでは行わず、UIとクライアント側バリデーションまでを範囲とする想定
