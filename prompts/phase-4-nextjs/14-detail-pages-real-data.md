# Phase 4 - Task 14: 詳細ページ実データ差し替え

**目的:** `/jobs/[slug]`, `/spots/[slug]`, `/events/[slug]`, `/voices/[slug]` の詳細ページを、ダミーデータから実データ(WPGraphQL)に差し替える。`generateStaticParams` も実データのslugを返すように更新する。

---

## コンテキスト

### 前提環境
- **Phase 4 Task 13 完了済み**: `lib/wp/queries/` に各CPTのクエリ実装済み(`getJobPostings`, `getTouristspots`, `getEvents`, `getTestimonials`)
- 一覧ページ(Task 09-13)は実データ表示済み
- 詳細ページは現状ダミーデータの slug のみ対応しており、WPの実投稿のslugでは404になる

### 必ず参照すべきドキュメント
- **`lib/wp/queries/`** ← 既存のクエリ関数を再利用・拡張する
- **`lib/wp/types.ts`** ← 既存の型定義を使う
- **`docs/03-content-schema.md`** ← 各CPTの全フィールド定義
- **`docs/05-sitemap.md` §3.3** ← 求人詳細ページ内応募フォームの仕様

### WPGraphQL for ACF 2.x の注意事項(Task 13で確認済み)

| フィールドタイプ | アクセス方法 |
|---|---|
| select(single) | `field?.[0] ?? null` |
| image | `field?.node?.sourceUrl` |
| gallery | `field?.nodes?.map(...)` |
| post_object | `field?.nodes?.[0]` |

---

## やってほしいこと

### 1. `lib/wp/queries/` への詳細取得クエリ追加

Task 13 で `getJobPostingBySlug` 等を実装済みの場合はそのまま使用。未実装の場合は以下のパターンで追加する:

**`lib/wp/queries/jobs.ts` への追加(未実装の場合):**

```ts
const GET_JOB_POSTING_BY_SLUG = gql`
  query GetJobPostingBySlug($slug: ID!) {
    jobPosting(id: $slug, idType: SLUG) {
      id
      slug
      title
      jobPostingFields {
        employmentType
        catchCopy
        salary
        salaryDetail
        workHours
        workHoursDetail
        holiday
        socialInsurance
        benefits
        housingSupportAvailable
        housingSupportDetail
        smokingPolicy
        trialPeriod
        workAddress
        workAddressDetail
        pinLocation
        description
        desiredPerson
        requiredQualifications
        applicationFlow
        thumbnailImage { node { sourceUrl altText } }
        thumbnailVideoUrl
      }
    }
  }
`;

export async function getJobPostingBySlug(slug: string): Promise<JobPosting | null> {
  try {
    const data = await wpClient.request<{ jobPosting: JobPosting | null }>(
      GET_JOB_POSTING_BY_SLUG,
      { slug }
    );
    return data.jobPosting;
  } catch (error) {
    console.error('Failed to fetch job posting:', error);
    return null;
  }
}
```

同様に `getTouristspotBySlug`, `getEventBySlug`, `getTestimonialBySlug` も実装。

### 2. `app/jobs/[slug]/page.tsx` の更新

**変更内容:**
- `generateStaticParams`: `DUMMY_JOBS` → `getJobPostings()` からslugを取得
- ページ本体: `DUMMY_JOBS.find(...)` → `getJobPostingBySlug(params.slug)` に差し替え
- データが null の場合は `notFound()` を呼ぶ
- **selectフィールドは `?.[0]` で取り出す**

**参照モード:**

```tsx
import { getJobPostings, getJobPostingBySlug } from '@/lib/wp/queries/jobs';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const jobs = await getJobPostings();
  return jobs.map((job) => ({ slug: job.slug }));
}

export default async function JobDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const job = await getJobPostingBySlug(params.slug);
  if (!job) notFound();

  const fields = job.jobPostingFields;

  // selectフィールドは [0] で取り出す
  const employmentType = fields?.employmentType?.[0] ?? null;
  const pinLocation = fields?.pinLocation?.[0] ?? null;

  // 画像は node 経由でアクセス
  const thumbnailUrl = fields?.thumbnailImage?.node?.sourceUrl ?? null;

  // housingSupportDetail は housingSupportAvailable が true の時のみ表示
  const showHousingDetail = fields?.housingSupportAvailable === true;

  return (
    <>
      {/* 既存の詳細レイアウトに実データを流し込む */}
      {/* ApplyForm への jobTitle / jobSlug の受け渡しも忘れずに */}
    </>
  );
}
```

### 3. `app/spots/[slug]/page.tsx` の更新

```tsx
import { getTouristspots, getTouristspotBySlug } from '@/lib/wp/queries/spots';

export async function generateStaticParams() {
  const spots = await getTouristspots();
  return spots.map((spot) => ({ slug: spot.slug }));
}

export default async function SpotDetailPage({ params }: { params: { slug: string } }) {
  const spot = await getTouristspotBySlug(params.slug);
  if (!spot) notFound();

  const fields = spot.touristspotFields;
  const category = fields?.category?.[0] ?? null;
  const thumbnailUrl = fields?.thumbnailImage?.node?.sourceUrl ?? null;
  const galleryImages = fields?.galleryImages?.nodes ?? [];

  // ...
}
```

### 4. `app/events/[slug]/page.tsx` の更新

```tsx
import { getEvents, getEventBySlug } from '@/lib/wp/queries/events';

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((event) => ({ slug: event.slug }));
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const event = await getEventBySlug(params.slug);
  if (!event) notFound();

  const fields = event.eventFields;
  const category = fields?.category?.[0] ?? null;

  // startDate / endDate は 'Y-m-d' 形式の文字列で返ってくる
  const startDate = fields?.startDatetime ?? null;
  const endDate = fields?.endDatetime ?? null;
  // ...
}
```

### 5. `app/voices/[slug]/page.tsx` の更新

```tsx
import { getTestimonials, getTestimonialBySlug } from '@/lib/wp/queries/voices';

export async function generateStaticParams() {
  const testimonials = await getTestimonials();
  return testimonials.map((t) => ({ slug: t.slug }));
}

export default async function VoiceDetailPage({ params }: { params: { slug: string } }) {
  const testimonial = await getTestimonialBySlug(params.slug);
  if (!testimonial) notFound();

  const fields = testimonial.testimonialFields;
  const photoUrl = fields?.photo?.node?.sourceUrl ?? null;

  // relatedJob は nodes[0] で取り出す(post_object の接続型)
  const relatedJob = fields?.relatedJob?.nodes?.[0] ?? null;
  // ...
}
```

---

## 成果物

```
lib/
└── wp/
    └── queries/
        ├── jobs.ts      (更新: getJobPostingBySlug 追加 or 確認)
        ├── spots.ts     (更新: getTouristspotBySlug 追加 or 確認)
        ├── events.ts    (更新: getEventBySlug 追加 or 確認)
        └── voices.ts    (更新: getTestimonialBySlug 追加 or 確認)
app/
├── jobs/[slug]/page.tsx      (更新: 実データに差し替え)
├── spots/[slug]/page.tsx     (更新: 実データに差し替え)
├── events/[slug]/page.tsx    (更新: 実データに差し替え)
└── voices/[slug]/page.tsx    (更新: 実データに差し替え)
```

---

## 制約・前提

- selectフィールドは必ず `?.[0]` で取り出す
- 画像は `field?.node?.sourceUrl` でアクセス
- ギャラリーは `field?.nodes?.map(...)` でアクセス
- post_object(relatedJob)は `field?.nodes?.[0]` で取り出す
- `housingSupportDetail` は `housingSupportAvailable === true` の時のみ表示
- `lib/dummy-data/` は削除しない
- TypeScript の型エラーを出さない(`any` 禁止)
- WordPress側ファイルへの変更は行わない

---

## やってはいけないこと

- ❌ **selectフィールドを配列のまま使う**(`[0]` で取り出すこと)
- ❌ **画像を `field.sourceUrl` で直接アクセスする**
- ❌ **`lib/dummy-data/` を削除する**
- ❌ **エラーハンドリングなしでクエリを実装する**
- ❌ **WordPress側ファイルへの変更**

---

## Git 運用ルール

コミットメッセージ例:
- `Phase 4 Task 14: 詳細クエリ関数追加(getJobPostingBySlug 等)`
- `Phase 4 Task 14: /jobs/[slug] 実データに差し替え`
- `Phase 4 Task 14: /spots/[slug] /events/[slug] /voices/[slug] 実データ差し替え`

---

## レビュー基準(Claude Code レビュー用チェックリスト)

### generateStaticParams
- [ ] 4ページとも実データからslugを取得しているか(ダミーデータを参照していないか)

### データ取得
- [ ] 各ページで null チェック + `notFound()` が実装されているか
- [ ] selectフィールドの `[0]` 取り出しが行われているか
- [ ] 画像が `field?.node?.sourceUrl` 形式でアクセスされているか
- [ ] `relatedJob` が `field?.nodes?.[0]` で取り出されているか

### 求人詳細固有
- [ ] `housingSupportDetail` が `housingSupportAvailable === true` の時のみ表示されているか
- [ ] `ApplyForm` に実データの `jobTitle` / `jobSlug` が渡されているか

### コード品質
- [ ] TypeScript の型エラーがないか
- [ ] `npm run build` が通るか

---

## 完了後の確認手順

1. `npm run dev` を起動
2. `/jobs` の一覧から求人カードをクリックし、詳細ページが404でなく表示されることを確認
3. 求人詳細ページで全フィールド(業務内容・給与・勤務時間等)が実データで表示されることを確認
4. 「応募する」固定ボタンをクリックし、フォームへ誘導されることを確認
5. `/spots`, `/events`, `/voices` の一覧からカードをクリックし、各詳細ページが表示されることを確認
6. `housingSupportAvailable` が false の求人で `housingSupportDetail` が表示されないことを確認
7. `npm run build` でビルドエラーがないことを確認

---

## 次タスク予告

**Phase 5: 3Dピン実装**

- トップページの3Dマップ上に求人・観光地・イベントのピンを配置
- WPGraphQLから取得した `pinLocation`(求人)・`slug`(観光地)・`pinReference`(イベント)を `PIN_POSITIONS` と照合してピンを表示
- ピンクリックでモーダル(求人プレビュー等)を表示
