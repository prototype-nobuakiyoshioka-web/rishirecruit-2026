# Phase 3 - Task 04b: event ACFフィールド登録

**目的:** `event` CPT の ACFフィールド群(4タブ・14フィールド)を `acf_add_local_field_group()` で登録する。Task 04a(touristspot)と同じパターンを踏襲する。

---

## コンテキスト

### 前提環境
- **Task 04a 完了済み**: `inc/acf-fields-touristspot.php` 存在
- Local JSON・functions.php の読み込み設定は完了済み

### 必ず参照すべきドキュメント
- **`docs/03-content-schema.md` §5(event CPT)** ← 本タスクの最重要参照元
  - §5.2: ACFフィールド一覧(4タブ・14フィールド)
  - §5.3: category 選択肢(英語スラッグ → 日本語ラベル)
  - §5.4: pin_reference の使い方(instructions に記載するため)
- `AGENTS.md` の PHP/WordPress コーディング規約

### 継承ルール(Task 03-04a と同じ)
- フィールドキー: `group_event`、タブは `field_ev_tab_*`、データフィールドは `field_ev_*`
- **choicesのキーは必ず英語スラッグ**(確定ルール)
- 全フィールドに `show_in_graphql => 1`
- `acf/init` フックで登録

---

## やってほしいこと

### 1. `inc/acf-fields-event.php` の新規作成

#### フィールドグループ基本設定

```php
acf_add_local_field_group([
    'key'   => 'group_event',
    'title' => 'イベント情報',
    'fields' => [ /* 後述 */ ],
    'location' => [
        [
            ['param' => 'post_type', 'operator' => '==', 'value' => 'event'],
        ],
    ],
    'show_in_rest'       => 1,
    'show_in_graphql'    => 1,
    'graphql_field_name' => 'eventFields',
]);
```

#### タブ構成(4タブ)

| タブ | ラベル | フィールド数 |
|---|---|---|
| tab_basic | 基本情報 | 4 |
| tab_schedule | スケジュール・開催情報 | 5 |
| tab_detail | 詳細・解説 | 2 |
| tab_venue | 会場・申込 | 7 |

#### 全フィールド一覧(§5.2 より、正確に全部含めること)

**Tab 1: 基本情報**
1. `category`(select、**必須**、choicesは§5.3の英語スラッグ)
2. `catch_copy`(text)
3. `thumbnail_image`(image、**必須**、`return_format => 'array'`)
4. `thumbnail_video_url`(url)

**Tab 2: スケジュール・開催情報**
5. `start_datetime`(datetime、**必須**)
6. `end_datetime`(datetime、**必須**、instructions: 「単日イベントでも終了日時は必須入力」)
7. `is_recurring`(true_false、ui=1、default_value=0)
8. `recurrence_note`(text、例: 「毎年7月最終週」)
9. `organizer`(text、**必須**、例: 「利尻富士町」「〇〇実行委員会」)

**Tab 3: 詳細・解説**
10. `description`(wysiwyg、**必須**、toolbar=full、media_upload=1)
11. `gallery_images`(gallery、任意、instructions: 「過去開催の様子の写真も可」)

**Tab 4: 会場・申込**
12. `venue_name`(text、**必須**、例: 「鬼脇地区会館」)
13. `address`(text)
14. `access_info`(textarea)
15. `pin_reference`(text、**必須**、instructions: 「PIN_POSITIONSのキーを入力。例: himenuma / oniwaki / rishirisan_opening」)
16. `price`(text、例: 「無料」「500円」)
17. `registration_url`(url、外部申込フォームURL)
18. `contact`(text、問い合わせ先)

**注意:** §5.2 の表では「14フィールド」とあるが、Tab 4 を数えると7フィールドで合計18になる可能性がある。**`docs/03-content-schema.md` §5.2 の表を正確にカウントして、スキーマドキュメントに記載されているフィールドをすべて登録すること。省略しない。**

#### category の choices(§5.3 より、英語スラッグ必須)

```php
'choices' => [
    'festival'    => 'まつり・伝統行事',
    'workshop'    => '体験・ワークショップ',
    'seminar'     => 'セミナー・講演会',
    'recruitment' => '募集・ボランティア',
    'sports'      => 'スポーツ',
    'culture'     => '文化・芸術',
],
```

### 2. `functions.php` の更新

```
inc/acf-local-json.php           (既存)
inc/acf-fields-job-posting.php    (既存)
inc/acf-fields-touristspot.php    (既存)
inc/acf-fields-event.php          (新規追加)
```

---

## 成果物

```
inc/
└── acf-fields-event.php   (新規)
functions.php               (更新: require_once 1行追加)
```

---

## 制約・前提

- `docs/03-content-schema.md` §5.2 の全フィールドを漏れなく登録する
- **choicesのキーは英語スラッグ**(確定ルール)
- フィールドキーは `field_ev_*` 命名規則に統一
- 既存ファイルは変更しない(`inc/acf-fields-touristspot.php` 等)
- AGENTS.md の PHP/WordPress コーディング規約をすべて遵守

---

## やってはいけないこと

- ❌ **choicesのキーを日本語にする**
- ❌ **フィールドを省略する**
- ❌ **`show_in_graphql => 0` にする**
- ❌ **既存ファイルの変更**
- ❌ **WordPress側コアファイルへの変更**

---

## Git 運用ルール

- `Phase 3 Task 04b: acf-fields-event.php 追加(4タブ・全フィールド)`
- `Phase 3 Task 04b: functions.php 更新(event フィールド読み込み追加)`

---

## レビュー基準(Claude Code レビュー用チェックリスト)

### ファイル構造
- [ ] `inc/acf-fields-event.php` が存在するか
- [ ] `functions.php` が読み込んでいるか
- [ ] 既存ファイルが変更されていないか

### フィールドグループ
- [ ] `group_event` / `graphql_field_name => 'eventFields'`
- [ ] location が `post_type == event` か

### タブ構成
- [ ] 4タブ(基本情報・スケジュール開催情報・詳細解説・会場申込)が存在するか

### フィールド網羅性
- [ ] Tab 1: category, catch_copy, thumbnail_image, thumbnail_video_url
- [ ] Tab 2: start_datetime, end_datetime, is_recurring, recurrence_note, organizer
- [ ] Tab 3: description, gallery_images
- [ ] Tab 4: venue_name, address, access_info, pin_reference, price, registration_url, contact

### 必須フィールドの required 設定
- [ ] category, thumbnail_image, start_datetime, end_datetime, organizer, description, venue_name, pin_reference: required = 1

### 個別フィールド設定
- [ ] `thumbnail_image` の return_format が 'array' か
- [ ] `is_recurring` が true_false で ui=1, default_value=0 か
- [ ] `description` が wysiwyg で toolbar=full, media_upload=1 か
- [ ] `gallery_images` が gallery タイプか
- [ ] `category` の choices が英語スラッグ→日本語ラベルの形式か(6項目)
- [ ] `pin_reference` に instructions(PIN_POSITIONSのキーを入力する旨)があるか
- [ ] 全フィールドに `show_in_graphql => 1` があるか

### コード品質
- [ ] ABSPATH ガードがあるか
- [ ] 日本語コメントがあるか
- [ ] フィールドキーが `field_ev_*` 命名規則に従っているか

---

## 完了後の確認手順

1. 管理画面 → 「イベント」→「新規追加」を開く
2. 4タブが表示されることを確認
3. カテゴリのドロップダウンに6項目が表示されることを確認
4. `acf-json/group_event.json` が自動生成されていることを確認
5. GraphiQL IDE で以下が動作することを確認:
```graphql
{
  events {
    nodes {
      id
      title
      eventFields {
        category
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

## 次タスク予告

**Phase 3 Task 04c: testimonial ACFフィールド登録**
- フィールドキープレフィックス: `field_tm_*`
- 2タブ・10フィールド(ピンなし、post_object で job_posting への参照あり)
- `docs/03-content-schema.md` §6 参照
