# Phase 3 - Task 04a: touristspot ACFフィールド登録

**目的:** `touristspot` CPT の ACFフィールド群(3タブ・13フィールド)を `acf_add_local_field_group()` で登録する。Task 03 で確立したパターンを踏襲し、Local JSON・命名規則・GraphQL公開の方針を継承する。

---

## コンテキスト

### 前提環境
- **Task 03 完了済み**: `inc/acf-local-json.php`(Local JSON設定)、`inc/acf-fields-job-posting.php`(job_posting 22フィールド)が存在
- `acf-json/` ディレクトリ存在・書き込み権限あり
- ACF Pro 6.x、WPGraphQL for ACF 2.x インストール・有効化済み

### 必ず参照すべきドキュメント
- **`docs/03-content-schema.md` §4(touristspot CPT)** ← 本タスクの最重要参照元
  - §4.2: ACFフィールド一覧(3タブ・13フィールド)
  - §4.3: category 選択肢(英語スラッグ → 日本語ラベル)
- `AGENTS.md` の PHP/WordPress コーディング規約

### Task 03 からの継承ルール

- フィールドキー命名: `group_touristspot`、タブは `field_ts_tab_*`、データフィールドは `field_ts_*`
- **choicesのキーは必ず英語スラッグ**(`docs/03-content-schema.md` §4.3 に既に英語スラッグで定義済み、そのまま使う)
- 全フィールドに `show_in_graphql => 1`
- `acf/init` フックで登録
- 無名関数、PSR-12インデント、日本語コメント、ABSPATH ガード

---

## やってほしいこと

### 1. `inc/acf-fields-touristspot.php` の新規作成

`docs/03-content-schema.md` §4.2 に従って、3タブ・13フィールドを登録する。

#### フィールドグループ基本設定

```php
acf_add_local_field_group([
    'key'   => 'group_touristspot',
    'title' => '観光地情報',
    'fields' => [ /* 後述 */ ],
    'location' => [
        [
            ['param' => 'post_type', 'operator' => '==', 'value' => 'touristspot'],
        ],
    ],
    'show_in_rest'       => 1,
    'show_in_graphql'    => 1,
    'graphql_field_name' => 'touristspotFields',
]);
```

#### タブ構成(3タブ)

| タブ | ラベル | フィールド数 |
|---|---|---|
| tab_basic | 基本情報 | 4 |
| tab_detail | 詳細・解説 | 3 |
| tab_visit | 訪問情報 | 6 |

#### 全フィールド一覧(§4.2 より、正確に全部含めること)

**Tab 1: 基本情報**
1. `category`(select、**必須**、choicesは§4.3の英語スラッグ→日本語ラベルの形式)
2. `catch_copy`(text)
3. `thumbnail_image`(image、**必須**、`return_format => 'array'`)
4. `thumbnail_video_url`(url)

**Tab 2: 詳細・解説**
5. `description`(wysiwyg、**必須**、toolbar=full、media_upload=1)
6. `gallery_images`(gallery、任意)
7. `best_season`(text、例: 「夏(7-8月)」)

**Tab 3: 訪問情報**
8. `address`(text)
9. `access_info`(textarea、例: 「鴛泊港から車で15分」)
10. `open_hours`(text、例: 「常時開放」)
11. `closed_days`(text)
12. `price`(text、例: 「無料」「大人500円」)
13. `phone`(text)

**注意:** `website_url` はスキーマ定義では13フィールド目として記載されているが、上記で13フィールドになっているか確認すること。`docs/03-content-schema.md` §4.2 の表を正確にカウントして全フィールドを漏れなく登録する。

#### category の choices(`docs/03-content-schema.md` §4.3 より、英語スラッグ必須)

```php
'choices' => [
    'nature'     => '自然・景観',
    'onsen'      => '温泉',
    'gourmet'    => 'グルメ',
    'lodging'    => '宿泊',
    'experience' => '体験・アクティビティ',
    'culture'    => '文化・歴史',
    'view'       => '公園・展望',
],
```

### 2. `functions.php` の更新

既存の読み込み順に追加:

```
inc/acf-local-json.php        (既存)
inc/acf-fields-job-posting.php (既存)
inc/acf-fields-touristspot.php  (新規追加)
```

---

## 成果物

```
inc/
└── acf-fields-touristspot.php   (新規)
functions.php                     (更新: require_once 1行追加)
```

---

## 制約・前提

- `AGENTS.md` の PHP/WordPress コーディング規約をすべて遵守
- フィールドキーは `field_ts_*` 命名規則に統一
- **choicesのキーは英語スラッグ**(Task 03 の employment_type で確立したルール)
- `docs/03-content-schema.md` §4.2 の全13フィールドを漏れなく登録する
- `inc/acf-local-json.php` は**変更しない**(Local JSON設定は既に完了)
- 既存ファイル(`inc/acf-fields-job-posting.php`等)は変更しない

---

## やってはいけないこと

- ❌ **choicesのキーを日本語にする**(Task 03のレビューで指摘、英語スラッグに統一)
- ❌ **フィールドを省略する**(`docs/03-content-schema.md` §4.2 の全13フィールドを登録)
- ❌ **`show_in_graphql => 0` にする**
- ❌ **`inc/acf-local-json.php` を変更する**
- ❌ **WordPress側コアファイルへの変更**

---

## Git 運用ルール

- `Phase 3 Task 04a: acf-fields-touristspot.php 追加(3タブ・13フィールド)`
- `Phase 3 Task 04a: functions.php 更新(touristspot フィールド読み込み追加)`

---

## レビュー基準(Claude Code レビュー用チェックリスト)

### ファイル構造
- [ ] `inc/acf-fields-touristspot.php` が存在するか
- [ ] `functions.php` が読み込んでいるか
- [ ] 既存ファイルが変更されていないか

### フィールドグループ
- [ ] `group_touristspot` / `graphql_field_name => 'touristspotFields'`
- [ ] location が `post_type == touristspot` か
- [ ] `show_in_graphql => 1` がグループに設定されているか

### タブ構成
- [ ] 3タブ(基本情報・詳細解説・訪問情報)が存在するか

### フィールド網羅性(13フィールド全部あるか)
- [ ] Tab 1: category, catch_copy, thumbnail_image, thumbnail_video_url
- [ ] Tab 2: description, gallery_images, best_season
- [ ] Tab 3: address, access_info, open_hours, closed_days, price, phone, website_url

### 必須フィールドの required 設定
- [ ] category: required = 1
- [ ] thumbnail_image: required = 1
- [ ] description: required = 1

### 個別フィールド設定
- [ ] `thumbnail_image` の return_format が 'array' か
- [ ] `description` が wysiwyg で toolbar=full, media_upload=1 か
- [ ] `gallery_images` が gallery タイプか(ACF Pro機能)
- [ ] `category` の choices が英語スラッグ→日本語ラベルの形式か(7項目)
- [ ] 全フィールドに `show_in_graphql => 1` があるか

### コード品質
- [ ] ABSPATH ガードがあるか
- [ ] 日本語コメントがあるか
- [ ] フィールドキーが `field_ts_*` 命名規則に従っているか

---

## 完了後の確認手順

1. WordPress管理画面 → 「観光地」→「新規追加」を開く
2. 3タブ(基本情報・詳細・解説・訪問情報)が表示されることを確認
3. カテゴリのドロップダウンに7項目が表示されることを確認
4. `acf-json/group_touristspot.json` が自動生成されていることを確認
5. GraphiQL IDE で以下が動作することを確認:
```graphql
{
  touristspots {
    nodes {
      id
      title
      touristspotFields {
        category
        catchCopy
        thumbnailImage { sourceUrl }
        description
      }
    }
  }
}
```

---

## 次タスク予告

**Phase 3 Task 04b: event ACFフィールド登録**
- フィールドキープレフィックス: `field_ev_*`
- 4タブ・14フィールド
- `docs/03-content-schema.md` §5 参照
