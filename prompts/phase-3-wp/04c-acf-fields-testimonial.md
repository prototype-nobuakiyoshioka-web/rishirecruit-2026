# Phase 3 - Task 04c: testimonial ACFフィールド登録

**目的:** `testimonial` CPT(移住者の声)の ACFフィールド群(2タブ・10フィールド)を `acf_add_local_field_group()` で登録する。今タスクの特徴は **`post_object` タイプ**(job_posting への参照フィールド)が初めて登場する点。他のフィールドは Task 04a-04b と同じパターン。

---

## コンテキスト

### 前提環境
- **Task 04a, 04b 完了済み**: touristspot・event のフィールドが登録済み
- Local JSON・functions.php の読み込み設定は完了済み
- testimonial CPT 自体は **Task 01 で登録済み**(post type slug: `testimonial`)

### 必ず参照すべきドキュメント
- **`docs/03-content-schema.md` §6(testimonial CPT)** ← 本タスクの最重要参照元
  - §6.2: ACFフィールド一覧(2タブ・10フィールド)
  - §6.3: related_job の使い方
- `AGENTS.md` の PHP/WordPress コーディング規約

### 継承ルール(Task 03-04b と同じ)
- フィールドキー: `group_testimonial`、タブは `field_tm_tab_*`、データフィールドは `field_tm_*`
- 全フィールドに `show_in_graphql => 1`
- `acf/init` フックで登録
- **choicesなし**(selectフィールドがないため今回は不要)

### testimonial の特徴(他CPTとの違い)

| 項目 | 内容 |
|---|---|
| 3Dマップのピン | **なし**(pin_location / pin_reference フィールドを持たない) |
| 専用フィールドタイプ | `post_object`(job_posting への任意参照) |
| selectフィールド | なし(choicesのキー問題は関係しない) |

---

## やってほしいこと

### 1. `inc/acf-fields-testimonial.php` の新規作成

#### フィールドグループ基本設定

```php
acf_add_local_field_group([
    'key'   => 'group_testimonial',
    'title' => '移住者の声',
    'fields' => [ /* 後述 */ ],
    'location' => [
        [
            ['param' => 'post_type', 'operator' => '==', 'value' => 'testimonial'],
        ],
    ],
    'show_in_rest'       => 1,
    'show_in_graphql'    => 1,
    'graphql_field_name' => 'testimonialFields',
]);
```

#### タブ構成(2タブ)

| タブ | ラベル | フィールド数 |
|---|---|---|
| tab_profile | プロフィール | 6 |
| tab_interview | インタビュー本文 | 4 |

#### 全フィールド一覧(§6.2 より、正確に全部含めること)

**Tab 1: プロフィール**
1. `catch_copy`(text、**必須**、instructions: 「一覧ページの見出し文。例:「子育てしながら、海の近くで働く」」)
2. `photo`(image、**必須**、`return_format => 'array'`、instructions: 「顔写真または暮らしの様子の写真」)
3. `profile_before`(text、例: 「東京都・会社員」)
4. `profile_after`(text、例: 「利尻富士町・役場勤務」)
5. `migration_year`(text、例: 「2023年」)
6. `related_job`(**post_object**、任意、下記参照)

**Tab 2: インタビュー本文**
7. `lead_text`(textarea、**必須**、instructions: 「編集側が書く導入の要約文(2-3文程度)」)
8. `interview_body`(wysiwyg、**必須**、toolbar=full、media_upload=1、instructions: 「インタビュー本文。写真を文中に挿入することも可能」)
9. `gallery_images`(gallery、任意、instructions: 「暮らしの様子の写真。複数枚可」)

**注意:** §6.2 では「10フィールド」とあるが、上記で9フィールドになっている。**`docs/03-content-schema.md` §6.2 の表を正確に数えて全フィールドを確認すること。**

#### `related_job` フィールド(post_objectタイプ、今回の最重要ポイント)

`post_object` タイプで `job_posting` CPT への任意参照を実装する:

**参照モード**(このとおりでなくてOK、より良いパターンがあれば提案してください):

```php
[
    'key'               => 'field_tm_related_job',
    'label'             => '関連求人',
    'name'              => 'related_job',
    'type'              => 'post_object',
    'post_type'         => ['job_posting'],  // job_posting CPTのみ選択可能
    'return_format'     => 'id',             // IDを返す(GraphQL側でノードとして解決される)
    'multiple'          => 0,                // 1件のみ
    'allow_null'        => 1,                // 任意(空でもOK)
    'ui'                => 1,
    'required'          => 0,
    'show_in_graphql'   => 1,
    'instructions'      => 'この移住者が応募した求人があれば選択してください。任意項目です。',
],
```

**`return_format` について:**
- `'id'` を推奨。WPGraphQL for ACF が post_object フィールドを自動的に対応するPost typeのノードとして解決する
- `'object'` にすると PHP オブジェクトが返るが、GraphQL での扱いが複雑になるため避ける

### 2. `functions.php` の更新

```
inc/acf-local-json.php             (既存)
inc/acf-fields-job-posting.php      (既存)
inc/acf-fields-touristspot.php      (既存)
inc/acf-fields-event.php            (既存)
inc/acf-fields-testimonial.php      (新規追加)
```

---

## 成果物

```
inc/
└── acf-fields-testimonial.php   (新規)
functions.php                     (更新: require_once 1行追加)
```

---

## 制約・前提

- `docs/03-content-schema.md` §6.2 の全フィールドを漏れなく登録する
- フィールドキーは `field_tm_*` 命名規則に統一
- `related_job` は `post_object` タイプ、`post_type => ['job_posting']`、`allow_null => 1`(任意)
- 既存ファイルは変更しない
- AGENTS.md の PHP/WordPress コーディング規約をすべて遵守

---

## やってはいけないこと

- ❌ **`related_job` を text や number タイプにする**(post_object タイプで実装する)
- ❌ **`related_job` を必須にする**(任意項目、`allow_null => 1` が必要)
- ❌ **`related_job` の `post_type` を job_posting 以外に広げる**
- ❌ **pin_location / pin_reference フィールドを追加する**(testimonial はピンを持たない)
- ❌ **フィールドを省略する**
- ❌ **`show_in_graphql => 0` にする**
- ❌ **既存ファイルの変更**

---

## Git 運用ルール

- `Phase 3 Task 04c: acf-fields-testimonial.php 追加(2タブ・post_object含む)`
- `Phase 3 Task 04c: functions.php 更新(testimonial フィールド読み込み追加)`

---

## レビュー基準(Claude Code レビュー用チェックリスト)

### ファイル構造
- [ ] `inc/acf-fields-testimonial.php` が存在するか
- [ ] `functions.php` が読み込んでいるか
- [ ] 既存ファイルが変更されていないか

### フィールドグループ
- [ ] `group_testimonial` / `graphql_field_name => 'testimonialFields'`
- [ ] location が `post_type == testimonial` か

### タブ構成
- [ ] 2タブ(プロフィール・インタビュー本文)が存在するか

### フィールド網羅性
- [ ] Tab 1: catch_copy, photo, profile_before, profile_after, migration_year, related_job
- [ ] Tab 2: lead_text, interview_body, gallery_images

### 必須フィールドの required 設定
- [ ] catch_copy, photo, lead_text, interview_body: required = 1
- [ ] related_job: required = **0**(任意)

### `related_job` フィールド(最重要)
- [ ] type が `post_object` か(`text` や `number` になっていないか)
- [ ] `post_type` が `['job_posting']` に限定されているか
- [ ] `allow_null => 1` になっているか(任意のため)
- [ ] `return_format => 'id'` になっているか
- [ ] `show_in_graphql => 1` があるか

### 個別フィールド設定
- [ ] `photo` の return_format が 'array' か
- [ ] `interview_body` が wysiwyg で toolbar=full, media_upload=1 か
- [ ] `gallery_images` が gallery タイプか
- [ ] 全フィールドに `show_in_graphql => 1` があるか

### コード品質
- [ ] ABSPATH ガードがあるか
- [ ] 日本語コメントがあるか
- [ ] フィールドキーが `field_tm_*` 命名規則に従っているか

---

## 完了後の確認手順

1. 管理画面 → 「移住者の声」→「新規追加」を開く(左メニューに「移住者の声」があるか確認)
2. 2タブ(プロフィール・インタビュー本文)が表示されることを確認
3. 「関連求人」フィールドが求人の選択UIになっていること、空でも保存できることを確認
4. `acf-json/group_testimonial.json` が自動生成されていることを確認
5. GraphiQL IDE で以下が動作することを確認:
```graphql
{
  testimonials {
    nodes {
      id
      title
      testimonialFields {
        catchCopy
        photo { sourceUrl }
        profileBefore
        profileAfter
        migrationYear
        leadText
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

---

## 次タスク予告

**Phase 3 Task 05: WPGraphQL for ACF 動作確認**

- 全4CPT(job_posting / touristspot / event / testimonial)のGraphQLクエリが正常に動作するか確認
- `related_job`(Union型 `... on JobPosting`)の解決が正しく動くか確認
- acf-json/ に4ファイルのJSONが生成されていることを確認
- 確認完了後、Phase 4 のダミーデータを実データに差し替える準備が整う
