# Phase 3 - Task 05: WPGraphQL for ACF 動作確認

**目的:** Task 03-04c で登録した全4CPT(job_posting / touristspot / event / testimonial)のACFフィールドが WPGraphQL 経由で正しく取得できることを確認する。実装作業ではなく**検証タスク**。問題があれば修正案を提示すること。

---

## コンテキスト

### 前提環境
- **Task 03-04c 完了済み**: 全4CPTのACFフィールドが `inc/acf-fields-*.php` で登録済み
- WPGraphQL・WPGraphQL for ACF インストール・有効化済み
- ACF Local JSON: `acf-json/` 配下に各グループのJSONが生成済みのはず

### 確認方法

WordPress管理画面 → 「GraphQL」→「GraphiQL IDE」でクエリを実行する。Claude Code はファイルの読み取り・確認を行い、実際のGraphQL実行は人間が GraphiQL IDE で行う想定。

---

## やってほしいこと

### 1. acf-json/ の生成確認

以下のファイルが存在することを確認する:

```
acf-json/
├── group_job_posting.json    (Task 03)
├── group_touristspot.json    (Task 04a)
├── group_event.json           (Task 04b)
└── group_testimonial.json    (Task 04c)
```

存在しない場合: 管理画面 → 「ACF」→ 該当フィールドグループを開いて「保存」すると生成される。

### 2. GraphiQL IDE での動作確認クエリ

以下のクエリを GraphiQL IDE で順番に実行し、エラーなく結果が返ることを確認する。各CPTに**テスト投稿を1件以上作成してから**実行すること(投稿がないと `nodes` が空配列になり、フィールドが正常でも確認できない)。

#### 2-1. job_posting の確認

```graphql
{
  jobPostings(first: 1) {
    nodes {
      id
      title
      slug
      jobPostingFields {
        employmentType
        catchCopy
        salary
        workHours
        smokingPolicy
        workAddress
        pinLocation
        housingSupportAvailable
        housingSupportDetail
        applicationFlow
        thumbnailImage {
          sourceUrl
          altText
        }
      }
    }
  }
}
```

**確認ポイント:**
- `employmentType` が英語スラッグ(例: `"regular"`)で返ってくるか(日本語の「正規職員」ではない)
- `pinLocation` が英語スラッグ(例: `"town_hall"`)で返ってくるか
- `thumbnailImage` がオブジェクトとして返ってくるか(`sourceUrl` / `altText` が含まれるか)

#### 2-2. touristspot の確認

```graphql
{
  touristspots(first: 1) {
    nodes {
      id
      title
      slug
      touristspotFields {
        category
        catchCopy
        description
        bestSeason
        address
        accessInfo
        openHours
        price
        thumbnailImage {
          sourceUrl
        }
        galleryImages {
          sourceUrl
        }
      }
    }
  }
}
```

**確認ポイント:**
- `category` が英語スラッグ(例: `"nature"`)で返ってくるか
- `galleryImages` が配列として返ってくるか

#### 2-3. event の確認

```graphql
{
  events(first: 1) {
    nodes {
      id
      title
      eventFields {
        category
        startDatetime
        endDatetime
        organizer
        venueName
        pinReference
        isRecurring
        description
        price
      }
    }
  }
}
```

**確認ポイント:**
- `startDatetime` / `endDatetime` が文字列として返ってくるか
- `isRecurring` が boolean として返ってくるか
- `pinReference` が文字列として返ってくるか

#### 2-4. testimonial の確認

```graphql
{
  testimonials(first: 1) {
    nodes {
      id
      title
      testimonialFields {
        catchCopy
        photo {
          sourceUrl
          altText
        }
        profileBefore
        profileAfter
        migrationYear
        leadText
        interviewBody
        relatedJob {
          ... on JobPosting {
            id
            slug
            title
          }
        }
      }
    }
  }
}
```

**確認ポイント:**
- `photo` がオブジェクトとして返ってくるか
- `relatedJob` の Union型(`... on JobPosting`)が正しく解決されるか
- `relatedJob` が null でも エラーにならないか(任意項目のため)

#### 2-5. 全CPT一括確認(最終チェック)

```graphql
{
  jobPostings(first: 1) { nodes { id jobPostingFields { employmentType } } }
  touristspots(first: 1) { nodes { id touristspotFields { category } } }
  events(first: 1) { nodes { id eventFields { category } } }
  testimonials(first: 1) { nodes { id testimonialFields { catchCopy } } }
}
```

これが1クエリでエラーなく返れば全4CPTの基本動作が確認できたことになる。

### 3. よくある問題と対処法

| 症状 | 原因 | 対処 |
|---|---|---|
| `Cannot query field "jobPostingFields"` 等のエラー | `show_in_graphql => 1` の設定漏れ、またはWPGraphQL for ACF が正しく認識していない | 該当フィールドグループのPHPを確認、WPGraphQL for ACF を無効化→再有効化 |
| フィールドが null で返る | テスト投稿でフィールドに値を入力していない | 管理画面でテスト投稿を編集し、各フィールドに値を入力して保存 |
| `relatedJob` が null でエラー | allow_null が設定されていない | `inc/acf-fields-testimonial.php` の related_job に `allow_null => 1` を確認 |
| `galleryImages` が配列でない | gallery タイプの return_format 設定 | ACF の gallery フィールドはデフォルトで配列を返すはずだが、設定を確認 |
| camelCase 変換が期待と違う | WPGraphQL の自動変換ルール | `work_address` → `workAddress`、`is_recurring` → `isRecurring` 等、snake_case → camelCase の変換が正しいか確認 |

### 4. テスト投稿の作成

各CPTに最低1件のテスト投稿を作成する。必須フィールドを入力すれば十分。

| CPT | 管理画面の場所 | 最低限入力するフィールド |
|---|---|---|
| job_posting | 求人 → 新規追加 | 雇用形態・業務内容・給与・勤務時間・受動喫煙対策・勤務地住所・ピン位置・応募後の流れ |
| touristspot | 観光地 → 新規追加 | カテゴリ・サムネイル画像・説明文 |
| event | イベント → 新規追加 | カテゴリ・サムネイル画像・開始日時・終了日時・主催・説明文・会場名・ピン位置参照 |
| testimonial | 移住者の声 → 新規追加 | キャッチコピー・メイン写真・リード文・インタビュー本文 |

---

## 確認チェックリスト

### acf-json/ の確認
- [ ] `acf-json/group_job_posting.json` が存在するか
- [ ] `acf-json/group_touristspot.json` が存在するか
- [ ] `acf-json/group_event.json` が存在するか
- [ ] `acf-json/group_testimonial.json` が存在するか

### GraphQLクエリ動作確認
- [ ] job_posting のクエリがエラーなく返るか
- [ ] `employmentType` が英語スラッグで返るか
- [ ] `pinLocation` が英語スラッグで返るか
- [ ] touristspot のクエリがエラーなく返るか
- [ ] `category`(touristspot)が英語スラッグで返るか
- [ ] `galleryImages` が配列で返るか
- [ ] event のクエリがエラーなく返るか
- [ ] `category`(event)が英語スラッグで返るか
- [ ] testimonial のクエリがエラーなく返るか
- [ ] `relatedJob` の Union型(`... on JobPosting`)が解決されるか
- [ ] `relatedJob` が null でもエラーにならないか
- [ ] 全CPT一括クエリがエラーなく返るか

---

## 完了後の状態

Task 05 が完了すると:

- **Phase 3 が完了**(WordPress側の実装が全て完了)
- **Phase 4 のダミーデータを実データに差し替える準備が整う**
- 次フェーズ: Phase 4 の `lib/dummy-data/` を WPGraphQL クライアントに差し替える実装(Phase 4 Task 13 以降)

---

## 次タスク予告

**Phase 4 Task 13: WPGraphQL クライアントのセットアップ**

- `graphql-request` + `GraphQL Codegen` の導入
- 各CPTのクエリを `lib/wp/queries/` に実装
- `lib/dummy-data/` のダミーデータを実データに順次差し替え
