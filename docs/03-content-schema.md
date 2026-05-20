# コンテンツスキーマ定義書

**Document version:** 1.0
**作成日:** 2026-05-20
**プロジェクト:** 利尻富士町 3Dポップ求人ポータル

---

## 1. 概要

本サイトのコンテンツアーキテクチャは **3つのWordPressカスタム投稿タイプ (CPT) + Note RSS連携** の構成で運用する。

| 構成要素 | 役割 | 編集者 |
|---|---|---|
| `job_posting` (CPT) | 求人情報 | 運営者 |
| `touristspot` (CPT) | 観光地情報 | 運営者 |
| `event` (CPT) | イベント情報 | 運営者 |
| Note RSS連携 | コラム記事の取得・表示 | 別メンバー（noteで執筆） |

column CPTは作成しない。記事コンテンツはnote側に集約し、RSSで取得して掲示板UIで表示する。

---

## 2. 共通仕様

### 2.1 命名規則

- フィールド名はすべて **`snake_case`** で統一
- 詳細系フィールドには `_detail` サフィックスを付ける
- 真偽値は `_available` サフィックスまたは `is_` プレフィックス
- URL系は `_url` サフィックス
- 画像系は `_image` サフィックス

### 2.2 WordPress標準フィールドの活用

各CPTで以下のWP標準フィールドを積極的に利用する:

| 標準フィールド | 用途 |
|---|---|
| Post Title | 投稿のメインタイトル（職種名・スポット名・イベント名） |
| Slug | URL用識別子。touristspotではピンIDとしても機能 |
| Published Date | 公開日（時系列ソート用） |
| Post Status | 下書き/公開（募集中フラグの代替として使用） |

### 2.3 サムネイル画像・動画の表示パターン（A仕様）

全CPT共通のルール:

- `thumbnail_video_url` に値がある場合 → **動画を表示**
- `thumbnail_video_url` が空の場合 → **`thumbnail_image` を表示**

これにより、編集者は「画像/動画どちらを使うか」を明示的に選択する必要がなく、入力するフィールドだけが優先される。

### 2.4 ピン位置の統一管理システム

3DマップのピンはすべてコードのPIN_POSITIONSテーブルで一元管理する。

```ts
// /lib/three/pin-positions.ts
export const PIN_POSITIONS: Record<string, { x: number; y: number; z: number }> = {
  // job_posting クラスタピン（pin_location selectの値と対応）
  town_hall:     { x:  0, y: 0.5, z:  0 },   // 役場本庁舎
  health_center: { x:  0, y: 0.5, z:  0 },   // 保健センター
  airport:       { x:  0, y: 0.5, z:  0 },   // 利尻空港
  oniwaki:       { x:  0, y: 0.5, z:  0 },   // 鬼脇地区

  // touristspot ピン（WP slugと対応、約30個）
  himenuma:        { x:  0, y: 0.5, z:  0 }, // 姫沼
  otatomari_numa:  { x:  0, y: 0.5, z:  0 }, // オタトマリ沼
  peshi_misaki:    { x:  0, y: 0.5, z:  0 }, // ペシ岬
  // ...

  // event専用ピン（event の pin_reference と対応、必要に応じて追加）
  rishirisan_opening: { x:  0, y: 0.5, z:  0 }, // 利尻山開きまつり
};
```

座標値はBlenderモデル完成後に微調整する。すべて初期値は `{ 0, 0.5, 0 }`。

### 2.5 CPTごとのピン参照方式

| CPT | 参照方式 | フィールド名 | 理由 |
|---|---|---|---|
| `job_posting` | クラスタselect | `pin_location` | 複数の求人が同じ場所に集まるため |
| `touristspot` | WP slug | （フィールド不要、slugを使用） | 1対1で固有の場所と紐づくため |
| `event` | text指定 | `pin_reference` | 既存ピンの再利用または独自ピンの両方に対応 |

### 2.6 WordPress / WPGraphQL 設定

すべてのCPT共通で以下を設定:

```php
register_post_type('xxx', [
  'public'              => true,
  'show_in_rest'        => true,    // 必須
  'show_in_graphql'     => true,    // 必須
  'graphql_single_name' => 'xxx',
  'graphql_plural_name' => 'xxxs',
  'supports'            => ['title', 'editor', 'thumbnail'],
]);
```

ACFフィールドも `show_in_graphql: 1` を全フィールドに設定。

---

## 3. job_posting CPT

### 3.1 基本設定

| 項目 | 値 |
|---|---|
| Post type slug | `job_posting` |
| GraphQL single name | `jobPosting` |
| GraphQL plural name | `jobPostings` |
| Supports | title, editor, thumbnail |
| Title 用途 | 職種名（例: 「主事補（一般事務）」） |

### 3.2 ACFフィールド一覧（19フィールド）

#### Tab 1: 募集の基本

| name | label | type | required | options/notes |
|---|---|---|---|---|
| `employment_type` | 雇用形態 | select | ✓ | 正規職員 / 会計年度任用（フル） / 会計年度任用（パート） / 嘱託職員 / 任期付職員 / 臨時職員 |
| `catch_copy` | キャッチコピー | text | | モーダル冒頭の一行 |
| `thumbnail_image` | サムネイル画像 | image | | A仕様：動画URLがない時に表示 |
| `thumbnail_video_url` | サムネイル動画URL | url | | YouTube/Vimeo URL。優先表示 |

#### Tab 2: 業務内容

| name | label | type | required | options/notes |
|---|---|---|---|---|
| `description` | 業務内容 | wysiwyg | ✓ | リッチエディタ |
| `desired_person` | 求める人材 | textarea | | |
| `required_qualifications` | 必要資格 | textarea | | 例「普通自動車免許」 |

#### Tab 3: 条件・待遇

| name | label | type | required | options/notes |
|---|---|---|---|---|
| `salary` | 給与 | text | ✓ | 一覧表示用「月額18.5万円〜」 |
| `salary_detail` | 給与詳細 | textarea | | モーダル詳細用 |
| `work_hours` | 勤務時間 | text | ✓ | 「8:30〜17:15」 |
| `work_hours_detail` | 勤務時間詳細 | textarea | | |
| `holiday` | 休日・休暇 | textarea | | |
| `social_insurance` | 社会保険 | text | | 「各種完備」等 |
| `benefits` | 福利厚生 | textarea | | 住居サポート以外 |
| `housing_support_available` | 住居サポートあり | true_false | | チェックボックス |
| `housing_support_detail` | 住居サポート詳細 | textarea | | 上のチェックON時のみ表示（conditional logic） |
| `smoking_policy` | 受動喫煙対策 | text | ✓ | **法的要件** |
| `trial_period` | 試用・研修期間 | text | | |

#### Tab 4: 勤務地・表示位置

| name | label | type | required | options/notes |
|---|---|---|---|---|
| `work_address` | 勤務地住所 | text | ✓ | 「北海道利尻郡利尻富士町〇〇」 |
| `work_address_detail` | 勤務地詳細 | textarea | | 建物名・部署・フロア等 |
| `pin_location` | 表示するピン位置 | select | ✓ | 下記参照 |

#### Tab 5: 応募

| name | label | type | required | options/notes |
|---|---|---|---|---|
| `application_flow` | 応募後の流れ | wysiwyg | ✓ | 役場への正式手続き含む |

### 3.3 pin_location 選択肢

| value | label（編集者が最適化） | 現状求人数 |
|---|---|---|
| `town_hall` | 役場本庁舎 | 3 |
| `health_center` | 保健センター | 2 |
| `airport` | 利尻空港 | 1 |
| `oniwaki` | 鬼脇地区 | 13 |

選択肢は将来必要に応じてACFと PIN_POSITIONS の両方に追加する。

### 3.4 既存ACFからの移行マッピング

立て直しのため、既存の `求人情報` グループから新スキーマへの変換ルール:

| 既存 name | 新 name | 備考 |
|---|---|---|
| `event_address`（住所） | （廃止） | `work_address` に統合 |
| `event_latitude`（label「経度」） | （廃止） | `pin_location` で代替 |
| `event_longitude`（label「緯度」） | （廃止） | `pin_location` で代替 |
| `description` | `description` | type を `textarea` → `wysiwyg` に昇格 |
| `salary` | `salary` | 変更なし |
| `salary_detail` | `salary_detail` | 変更なし |
| `event_address`（勤務地、重複） | `work_address` | 命名衝突を解消 |
| `location_detail` | `work_address_detail` | リネーム |
| `employment` | `employment_type` | type を `text` → `select` に変更 |
| `time` | `work_hours` | リネーム |
| `work_time_detail` | `work_hours_detail` | リネーム |
| `holiday_detail` | `holiday` | リネーム + type を `text` → `textarea` |
| `social_insurances` | `social_insurance` | 単数形に統一 |
| `benefits` | `benefits` | 変更なし |
| `prevent_smoke` | `smoking_policy` | リネーム |
| `trial_detail` | `trial_period` | リネーム |
| `desired_person` | `desired_person` | 変更なし |
| `apply_enviroment_detail` | `application_flow` | typo修正 + リネーム |
| `catch_copy` | `catch_copy` | 変更なし |
| — | `required_qualifications` | 新規追加 |
| — | `housing_support_available` | 新規追加 |
| — | `housing_support_detail` | 新規追加 |
| — | `thumbnail_image` | 新規追加 |
| — | `thumbnail_video_url` | 新規追加 |
| — | `pin_location` | 新規追加（緯度経度の代替） |

---

## 4. touristspot CPT

### 4.1 基本設定

| 項目 | 値 |
|---|---|
| Post type slug | `touristspot` |
| GraphQL single name | `touristspot` |
| GraphQL plural name | `touristspots` |
| Supports | title, editor, thumbnail |
| Title 用途 | スポット名（例: 「姫沼」） |
| Slug 用途 | **ピンIDとしても利用**（PIN_POSITIONSのキーと一致させる） |

### 4.2 ACFフィールド一覧（13フィールド）

#### Tab 1: 基本情報

| name | label | type | required | options/notes |
|---|---|---|---|---|
| `category` | カテゴリ | select | ✓ | 下記参照 |
| `catch_copy` | キャッチコピー | text | | |
| `thumbnail_image` | サムネイル画像 | image | ✓ | A仕様 |
| `thumbnail_video_url` | サムネイル動画URL | url | | A仕様で優先 |

#### Tab 2: 詳細・解説

| name | label | type | required | options/notes |
|---|---|---|---|---|
| `description` | 説明文 | wysiwyg | ✓ | スポットの魅力 |
| `gallery_images` | ギャラリー画像 | gallery | | 複数枚、v1では任意 |
| `best_season` | おすすめ季節 | text | | 「夏（7-8月）」等 |

#### Tab 3: 訪問情報

| name | label | type | required | options/notes |
|---|---|---|---|---|
| `address` | 住所 | text | | |
| `access_info` | アクセス情報 | textarea | | 「鴛泊港から車で15分」等 |
| `open_hours` | 営業時間・開放時間 | text | | 自然系は「常時開放」 |
| `closed_days` | 定休日 | text | | |
| `price` | 料金 | text | | 「無料」「大人500円」等 |
| `phone` | 電話番号 | text | | |
| `website_url` | 公式サイトURL | url | | |

### 4.3 カテゴリ選択肢

| value | label |
|---|---|
| `nature` | 自然・景観 |
| `onsen` | 温泉 |
| `gourmet` | グルメ |
| `lodging` | 宿泊 |
| `experience` | 体験・アクティビティ |
| `culture` | 文化・歴史 |
| `view` | 公園・展望 |

### 4.4 slug = ピンID の運用ルール

- slug は **英小文字 + アンダースコアのみ**（例: `himenuma`, `otatomari_numa`, `peshi_misaki`）
- 一度公開した投稿のslugは原則変更しない（変更すると3Dマップからピンが消える）
- 新スポット追加時のフロー:
  1. WPで投稿作成、slugを命名（例: `kamuiumi_park`）
  2. `/lib/three/pin-positions.ts` に1行追加（`kamuiumi_park: { x, y, z }`）
  3. デプロイ

---

## 5. event CPT

### 5.1 基本設定

| 項目 | 値 |
|---|---|
| Post type slug | `event` |
| GraphQL single name | `event` |
| GraphQL plural name | `events` |
| Supports | title, editor, thumbnail |
| Title 用途 | イベント名（例: 「鬼脇まつり」） |

### 5.2 ACFフィールド一覧（14フィールド）

#### Tab 1: 基本情報

| name | label | type | required | options/notes |
|---|---|---|---|---|
| `category` | カテゴリ | select | ✓ | 下記参照 |
| `catch_copy` | キャッチコピー | text | | |
| `thumbnail_image` | サムネイル画像 | image | ✓ | A仕様 |
| `thumbnail_video_url` | サムネイル動画URL | url | | A仕様で優先 |

#### Tab 2: スケジュール・開催情報

| name | label | type | required | options/notes |
|---|---|---|---|---|
| `start_datetime` | 開始日時 | datetime | ✓ | |
| `end_datetime` | 終了日時 | datetime | ✓ | 単日でも入力必須 |
| `is_recurring` | 毎年開催 | true_false | | |
| `recurrence_note` | 開催パターン | text | | 「毎年7月最終週」等 |
| `organizer` | 主催 | text | ✓ | 利尻富士町 / 〇〇実行委員会 等 |

#### Tab 3: 詳細・解説

| name | label | type | required | options/notes |
|---|---|---|---|---|
| `description` | 説明文 | wysiwyg | ✓ | |
| `gallery_images` | ギャラリー画像 | gallery | | 過去開催の様子も |

#### Tab 4: 会場・申込

| name | label | type | required | options/notes |
|---|---|---|---|---|
| `venue_name` | 会場名 | text | ✓ | 「鬼脇地区会館」等 |
| `address` | 住所 | text | | |
| `access_info` | アクセス情報 | textarea | | |
| `pin_reference` | ピン位置の参照 | text | ✓ | PIN_POSITIONSのキーを指定 |
| `price` | 参加費 | text | | 「無料」「500円」等 |
| `registration_url` | 申込先URL | url | | 外部フォーム等 |
| `contact` | 問い合わせ先 | text | | |

### 5.3 カテゴリ選択肢

| value | label |
|---|---|
| `festival` | まつり・伝統行事 |
| `workshop` | 体験・ワークショップ |
| `seminar` | セミナー・講演会 |
| `recruitment` | 募集・ボランティア |
| `sports` | スポーツ |
| `culture` | 文化・芸術 |

### 5.4 pin_reference の使い方

イベントは既存ピン（touristspot or job_posting cluster）を再利用するか、event専用ピンを新規追加するかを選べる:

| パターン | 例 | pin_reference の値 |
|---|---|---|
| touristspot ピンを再利用 | 姫沼ハイキング | `himenuma` |
| job_posting クラスタピンを再利用 | 鬼脇まつり | `oniwaki` |
| event専用ピンを新規追加 | 利尻山開きまつり | `rishirisan_opening`（PIN_POSITIONSに追加） |

### 5.5 イベント表示ロジック（フロント側）

ACFには「開催中/終了」フラグを持たせず、フロント側で動的に判定する:

| 状態 | 判定条件 | 3Dマップ上の表示 |
|---|---|---|
| 開催前（予告） | `start_datetime > now` | ピン表示、「予告」バッジ |
| 開催中 | `start_datetime <= now <= end_datetime` | ピン表示、「開催中」バッジ |
| 終了済み | `end_datetime < now` | ピン非表示、アーカイブページのみ |

WPGraphQLクエリ側でフィルタ条件を組み込む実装方針。

---

## 6. Note RSS連携（column代替）

### 6.1 構成概要

| 項目 | 内容 |
|---|---|
| 執筆者 | 別メンバー（noteアカウント所有） |
| 執筆場所 | note.com |
| 取得方法 | RSS購読 |
| 取得元URL | `https://note.com/{ユーザー名 or マガジン名}/rss` |
| 取得側 | Next.js（フロントエンド） |
| キャッシュ | ISR（1時間ごとなどの再生成） |
| 表示UI | 「掲示板」型UIコンポーネント |
| 表示位置 | サイトTOP、求人モーダル内などで再利用可能 |

### 6.2 環境変数

```env
# /.env.local（Next.js）
NEXT_PUBLIC_NOTE_RSS_URL=https://note.com/USERNAME_OR_MAGAZINE/rss
```

### 6.3 推奨ライブラリ

- `rss-parser` または `fast-xml-parser`

### 6.4 実装方針

```ts
// /lib/note/fetch-articles.ts (概念図)
import Parser from 'rss-parser';

export async function fetchNoteArticles() {
  const parser = new Parser();
  const feed = await parser.parseURL(process.env.NEXT_PUBLIC_NOTE_RSS_URL!);
  
  return feed.items.map(item => ({
    title:        item.title,
    link:         item.link,
    publishedAt:  item.pubDate,
    excerpt:      item.contentSnippet,
    image:        extractImage(item.content), // 本文からog:image相当を抽出
  }));
}
```

### 6.5 表示UI仕様（概要）

- **掲示板スタイル**: 直近5〜10件をカード形式で表示
- 各カード: サムネイル / タイトル / 投稿日 / 抜粋
- クリック時: `target="_blank"` で note.com の元記事に遷移
- 「もっと見る」ボタン: noteのトップページ（執筆者ページ）へ遷移

### 6.6 求人応募KPIへの寄与（動線設計）

columnのCPT化を見送ったため、求人応募への動線は以下の手段で代替する:

| 手段 | 実装場所 |
|---|---|
| 求人モーダル内に「先輩職員の声」セクション | job_posting詳細表示時、関連note記事のリンクを手動で貼る運用 |
| TOPページに大きなnote記事掲示板 | TOP画面の重要位置に配置 |
| note記事本文内で求人サイトへ逆リンク | 執筆者に依頼（運用ルール化） |

---

## 7. WPGraphQL クエリ例

### 7.1 job_postings 一覧取得

```graphql
query AllJobPostings {
  jobPostings(first: 100, where: { status: PUBLISH }) {
    nodes {
      id
      title
      slug
      featuredImage { node { sourceUrl } }
      jobPostingFields {
        employmentType
        catchCopy
        salary
        workHours
        pinLocation
        thumbnailImage { sourceUrl }
        thumbnailVideoUrl
        # ...他フィールド
      }
    }
  }
}
```

### 7.2 touristspots 一覧取得（ピン用）

```graphql
query AllTouristspots {
  touristspots(first: 100, where: { status: PUBLISH }) {
    nodes {
      id
      title
      slug   # ← これがピンID
      touristspotFields {
        category
        catchCopy
        thumbnailImage { sourceUrl }
      }
    }
  }
}
```

### 7.3 イベント絞り込み（開催中・開催予定のみ）

```graphql
query ActiveEvents($now: String!) {
  events(
    first: 50
    where: { 
      status: PUBLISH
      metaQuery: { 
        metaArray: [
          { key: "end_datetime", value: $now, compare: GREATER_THAN_OR_EQUAL_TO }
        ]
      }
    }
  ) {
    nodes {
      id
      title
      eventFields {
        startDatetime
        endDatetime
        venueName
        pinReference
      }
    }
  }
}
```

---

## 8. 実装時の注意点

### 8.1 ACFをコード管理する場合

ACF Pro の Local JSON 機能を有効化し、`/wp-content/themes/your-theme/acf-json/` にフィールド定義をJSON保存。Gitで管理可能になる。

### 8.2 GraphQL用のフィールド名

WPGraphQLは ACFフィールド名を **camelCase に自動変換** する:

| ACF name | GraphQL field name |
|---|---|
| `employment_type` | `employmentType` |
| `pin_location` | `pinLocation` |
| `thumbnail_video_url` | `thumbnailVideoUrl` |

フロント側のクエリ・型定義はcamelCaseで書くことに注意。

### 8.3 画像フィールドのGraphQL取得

ACF画像フィールドは `return_format: array` で設定。GraphQLで以下のように取得:

```graphql
thumbnailImage {
  sourceUrl
  altText
  mediaDetails { width height }
}
```

### 8.4 CORS設定

ヘッドレス運用のため、WPの `functions.php` で本番ドメインに対する CORS ヘッダを設定:

```php
add_action('init', function() {
  $allowed = ['https://your-frontend.vercel.app'];
  $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
  if (in_array($origin, $allowed, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Credentials: true");
  }
});
```

---

## 9. 改訂履歴

| Version | 日付 | 内容 |
|---|---|---|
| 1.0 | 2026-05-20 | 初版作成（3CPT + Note RSS連携の構成で確定） |
