# Phase 4 - Task 13: WPGraphQL クライアントセットアップ + 実データ接続

**目的:** `graphql-request` を導入してWPGraphQLクライアントを構築し、各ページのダミーデータを実データ(WordPress)に差し替える。GraphQL Codegen と TanStack Query は本タスクでは導入しない(スコープを絞る)。**まず動くこと**を優先し、型の自動生成は Task 14 以降で対応する。

---

## コンテキスト

### 前提環境
- **Phase 3 全タスク完了**: 全4CPT(job_posting/touristspot/event/testimonial)のACFフィールドがGraphQL経由で取得可能
- **Phase 4 Task 09-12 完了**: ダミーデータで一覧・詳細・フォーム・静的ページが揃っている
- WordPress はローカル(`http://rishirecruit-2026.local`)で稼働中
- Next.js は `http://localhost:3000` で稼働中

### 必ず参照すべきドキュメント
- **`docs/03-content-schema.md`** ← 全フィールド定義、GraphQL camelCase変換表(§9.2)
- **`AGENTS.md`** の技術スタック(graphql-request、lib/wp/queries/ の配置)
- **`AGENTS.md`** のよくあるエラー「フロントから WP API が叩けない → CORS 設定確認」

### WPGraphQL for ACF 2.x の重要な仕様

**Task 05 で判明した事項(必ず反映すること):**

| フィールドタイプ | GraphQLの返り値 | フロント側の対応 |
|---|---|---|
| select(single) | `[String]`(配列) | `field?.[0] ?? null` で取り出す |
| image | `{ node: { sourceUrl, altText } }` | `field?.node?.sourceUrl` でアクセス |
| gallery | `{ nodes: [{ sourceUrl }] }` | `field?.nodes?.map(...)` でアクセス |
| post_object | `{ nodes: [{ ...on JobPosting { id slug title } }] }` | Union型で解決 |

---

## やってほしいこと

### 1. パッケージの追加

```json
"dependencies": {
  "graphql-request": "7.1.2",
  "graphql": "16.10.0"
}
```

バージョンは AGENTS.md の「バージョン指定の読み替えルール」に従い、事前にレジストリ存在確認をすること。存在しない場合は同系統最新安定版に読み替えてコミットメッセージに明記。

### 2. GraphQLクライアントの設定

**新規ファイル:** `lib/wp/client.ts`

```ts
import { GraphQLClient } from 'graphql-request';

const WP_GRAPHQL_URL = process.env.NEXT_PUBLIC_WP_GRAPHQL_URL
  ?? 'http://rishirecruit-2026.local/graphql';

export const wpClient = new GraphQLClient(WP_GRAPHQL_URL);
```

**新規ファイル:** `.env.local`(存在しなければ作成、既存なら追記)

```env
NEXT_PUBLIC_WP_GRAPHQL_URL=http://rishirecruit-2026.local/graphql
```

### 3. 型定義の作成

**新規ファイル:** `lib/wp/types.ts`

Phase 3 で確認した実際の返り値の形に合わせて型を定義する。GraphQL Codegen は使わず手書きで作成(Task 14 以降で自動生成に移行予定)。

**参照モード**(このとおりでなくてOK、より良いパターンがあれば提案してください):

```ts
// 画像フィールド(WPGraphQL for ACF 2.x の接続型)
export interface WPImageNode {
  node: {
    sourceUrl: string;
    altText: string;
    mediaDetails?: { width: number; height: number };
  } | null;
}

// ギャラリーフィールド
export interface WPGalleryNodes {
  nodes: Array<{ sourceUrl: string; altText?: string }>;
}

// job_posting
export interface JobPosting {
  id: string;
  slug: string;
  title: string;
  jobPostingFields: {
    employmentType: string[] | null;      // [String] で返る、[0]で取り出す
    catchCopy: string | null;
    salary: string | null;
    salaryDetail: string | null;
    workHours: string | null;
    workHoursDetail: string | null;
    holiday: string | null;
    socialInsurance: string | null;
    benefits: string | null;
    housingSupportAvailable: boolean | null;
    housingSupportDetail: string | null;
    smokingPolicy: string | null;
    trialPeriod: string | null;
    workAddress: string | null;
    workAddressDetail: string | null;
    pinLocation: string[] | null;         // [String] で返る、[0]で取り出す
    description: string | null;
    desiredPerson: string | null;
    requiredQualifications: string | null;
    applicationFlow: string | null;
    thumbnailImage: WPImageNode | null;
    thumbnailVideoUrl: string | null;
  } | null;
}

// touristspot
export interface Touristspot {
  id: string;
  slug: string;
  title: string;
  touristspotFields: {
    category: string[] | null;            // [String] で返る
    catchCopy: string | null;
    description: string | null;
    bestSeason: string | null;
    address: string | null;
    accessInfo: string | null;
    openHours: string | null;
    closedDays: string | null;
    price: string | null;
    phone: string | null;
    websiteUrl: string | null;
    thumbnailImage: WPImageNode | null;
    thumbnailVideoUrl: string | null;
    galleryImages: WPGalleryNodes | null;
  } | null;
}

// event
export interface Event {
  id: string;
  slug: string;
  title: string;
  eventFields: {
    category: string[] | null;            // [String] で返る
    catchCopy: string | null;
    startDatetime: string | null;
    endDatetime: string | null;
    isRecurring: boolean | null;
    recurrenceNote: string | null;
    organizer: string | null;
    description: string | null;
    venueName: string | null;
    address: string | null;
    accessInfo: string | null;
    pinReference: string | null;
    price: string | null;
    registrationUrl: string | null;
    contact: string | null;
    thumbnailImage: WPImageNode | null;
    thumbnailVideoUrl: string | null;
    galleryImages: WPGalleryNodes | null;
  } | null;
}

// testimonial
export interface Testimonial {
  id: string;
  slug: string;
  title: string;
  testimonialFields: {
    catchCopy: string | null;
    photo: WPImageNode | null;
    profileBefore: string | null;
    profileAfter: string | null;
    migrationYear: string | null;
    leadText: string | null;
    interviewBody: string | null;
    galleryImages: WPGalleryNodes | null;
    relatedJob: {
      nodes: Array<{
        __typename: 'JobPosting';
        id: string;
        slug: string;
        title: string;
      }>;
    } | null;
  } | null;
}
```

### 4. GraphQLクエリの実装

**新規ディレクトリ:** `lib/wp/queries/`

各CPTのクエリを別ファイルに分けて実装する。

**`lib/wp/queries/jobs.ts`:**

```ts
import { gql } from 'graphql-request';
import { wpClient } from '../client';
import type { JobPosting } from '../types';

const GET_JOB_POSTINGS = gql`
  query GetJobPostings {
    jobPostings(first: 100, where: { status: PUBLISH }) {
      nodes {
        id
        slug
        title
        jobPostingFields {
          employmentType
          catchCopy
          salary
          workHours
          pinLocation
          thumbnailImage { node { sourceUrl altText } }
          thumbnailVideoUrl
        }
      }
    }
  }
`;

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

export async function getJobPostings(): Promise<JobPosting[]> {
  const data = await wpClient.request<{ jobPostings: { nodes: JobPosting[] } }>(
    GET_JOB_POSTINGS
  );
  return data.jobPostings.nodes;
}

export async function getJobPostingBySlug(slug: string): Promise<JobPosting | null> {
  const data = await wpClient.request<{ jobPosting: JobPosting | null }>(
    GET_JOB_POSTING_BY_SLUG,
    { slug }
  );
  return data.jobPosting;
}
```

同様のパターンで以下も実装:
- `lib/wp/queries/spots.ts`(getTouristspots, getTouristspotBySlug)
- `lib/wp/queries/events.ts`(getEvents, getEventBySlug)
- `lib/wp/queries/voices.ts`(getTestimonials, getTestimonialBySlug)

### 5. 各ページへの実データ差し替え

ダミーデータを使っている各ページを順番に実データに切り替える。

#### `app/jobs/page.tsx`

```ts
// Before
import { DUMMY_JOBS } from '@/lib/dummy-data/jobs';
const jobs = DUMMY_JOBS;

// After
import { getJobPostings } from '@/lib/wp/queries/jobs';
const jobs = await getJobPostings();
```

**selectフィールドの取り出し(必須):**

```ts
// employmentType / pinLocation は [String] で返るため
const employmentType = job.jobPostingFields?.employmentType?.[0] ?? null;
const pinLocation = job.jobPostingFields?.pinLocation?.[0] ?? null;
```

同様に `/spots`, `/events`, `/voices` の各一覧・詳細ページも差し替える。

#### `generateStaticParams` の更新

詳細ページ(`/jobs/[slug]` 等)の `generateStaticParams` をダミーデータから実データに切り替える:

```ts
// app/jobs/[slug]/page.tsx
export async function generateStaticParams() {
  const jobs = await getJobPostings();
  return jobs.map((job) => ({ slug: job.slug }));
}
```

### 6. エラーハンドリング

各クエリ関数に try-catch を追加し、WPGraphQL が応答しない場合(ローカル環境未起動等)にも graceful degradation するようにする:

```ts
export async function getJobPostings(): Promise<JobPosting[]> {
  try {
    const data = await wpClient.request<{ jobPostings: { nodes: JobPosting[] } }>(
      GET_JOB_POSTINGS
    );
    return data.jobPostings.nodes;
  } catch (error) {
    console.error('Failed to fetch job postings:', error);
    return [];  // エラー時は空配列を返す
  }
}
```

---

## 成果物

```
lib/
├── wp/
│   ├── client.ts          (新規)
│   ├── types.ts            (新規)
│   └── queries/
│       ├── jobs.ts         (新規)
│       ├── spots.ts        (新規)
│       ├── events.ts       (新規)
│       └── voices.ts       (新規)
└── dummy-data/             (既存、削除はしない。段階的な移行のため残す)
.env.local                  (新規 or 更新)
package.json                (更新: graphql-request, graphql 追加)
app/
├── jobs/page.tsx           (更新: 実データに差し替え)
├── jobs/[slug]/page.tsx    (更新: 実データに差し替え)
├── spots/page.tsx          (更新)
├── spots/[slug]/page.tsx   (更新)
├── events/page.tsx         (更新)
├── events/[slug]/page.tsx  (更新)
├── voices/page.tsx         (更新)
└── voices/[slug]/page.tsx  (更新)
```

---

## 制約・前提

- **GraphQL Codegen・TanStack Query は導入しない**(本タスクのスコープ外、Task 14 以降)
- `lib/dummy-data/` は削除しない(段階的移行、動作確認の参考として残す)
- **selectフィールドは必ず `?.[0]` で取り出す**(WPGraphQL for ACF 2.x の仕様)
- **画像フィールドは `field?.node?.sourceUrl` でアクセス**(接続型)
- エラー時は空配列・null を返して graceful degradation する
- TypeScript の型エラーを出さない(`any` 禁止)
- `.env.local` は `.gitignore` に含まれていることを確認すること

---

## やってはいけないこと

- ❌ **`lib/dummy-data/` を削除する**(段階的移行のため残す)
- ❌ **selectフィールドを文字列として直接使う**(`[0]` で取り出すこと)
- ❌ **画像フィールドを `field.sourceUrl` で直接アクセスする**(`field.node.sourceUrl` が正しい)
- ❌ **GraphQL Codegen・TanStack Query を導入する**(次タスク以降)
- ❌ **`.env.local` を `.gitignore` なしでコミットする**
- ❌ **WordPress側ファイルへの変更**
- ❌ **エラーハンドリングなしでクエリを実装する**

---

## Git 運用ルール

コミットメッセージ例:
- `Phase 4 Task 13: graphql-request 導入 + WPGraphQLクライアント設定`
- `Phase 4 Task 13: lib/wp/types.ts 型定義作成`
- `Phase 4 Task 13: lib/wp/queries/ 各CPTクエリ実装`
- `Phase 4 Task 13: /jobs 一覧・詳細を実データに差し替え`
- `Phase 4 Task 13: /spots /events /voices を実データに差し替え`

---

## レビュー基準(Claude Code レビュー用チェックリスト)

### ファイル構造
- [ ] `lib/wp/client.ts` が存在するか
- [ ] `lib/wp/types.ts` が存在するか
- [ ] `lib/wp/queries/` 配下に4ファイルが存在するか
- [ ] `.env.local` に `NEXT_PUBLIC_WP_GRAPHQL_URL` があるか
- [ ] `lib/dummy-data/` が削除されていないか
- [ ] WordPress側ファイルが変更されていないか

### 型定義の正確性(最重要)
- [ ] selectフィールド(`employmentType`, `pinLocation`, `category`)が `string[] | null` 型になっているか
- [ ] 画像フィールドが `WPImageNode`(node プロパティを持つ接続型)になっているか
- [ ] ギャラリーフィールドが `WPGalleryNodes`(nodes 配列を持つ接続型)になっているか
- [ ] `relatedJob` が Union型(`... on JobPosting`)で解決される形になっているか

### データ取得の正確性
- [ ] 各ページで `[0]` による select フィールドの取り出しが行われているか
- [ ] 画像アクセスが `field?.node?.sourceUrl` 形式になっているか
- [ ] エラーハンドリング(try-catch)が各クエリ関数にあるか
- [ ] `generateStaticParams` が実データから slug を取得しているか

### コード品質
- [ ] TypeScript の型エラーがないか(`any` 未使用)
- [ ] `npm run build` が通るか

---

## 完了後の確認手順

1. WordPress ローカル環境(`http://rishirecruit-2026.local`)が起動していることを確認
2. `npm run dev` を起動
3. `/jobs` にアクセスし、WordPressに登録した実際の求人データが表示されることを確認
4. 求人詳細ページで全フィールドが表示されることを確認
5. `housingSupportAvailable` が false の求人で `housingSupportDetail` が表示されないことを確認
6. `/spots`, `/events`, `/voices` も同様に実データが表示されることを確認
7. WordPress を停止した状態で `/jobs` にアクセスし、エラーではなく空一覧が表示されることを確認(graceful degradation)
8. `npm run build` でビルドエラーがないことを確認

---

## 次タスク予告

**Phase 4 Task 14: GraphQL Codegen 導入(型の自動生成)**

- `@graphql-codegen/cli` 等の導入
- 手書き型(`lib/wp/types.ts`)を自動生成型に置き換え
- `npm run codegen` スクリプトの追加

または

**Phase 5: 3Dピン実装**

- トップページの3Dマップ上にピンを配置
- WPGraphQLから取得した実データ(pinLocation / slug)を PIN_POSITIONS と照合してピンを表示
