# Phase 3 - Task 03: ACF Local JSON 設定 + job_posting フィールド登録

**目的:** ACF Pro の Local JSON 機能を有効化し、`job_posting` CPT のACFフィールド群（5タブ・19データフィールド）をコード管理する。フィールド定義をGit管理することで、フィールド変更履歴の追跡と他環境への展開を可能にする。

---

## コンテキスト

### 前提環境
- **Task 01 完了済み**: 3CPT登録（job_posting / touristspot / event）
- **Task 02 完了済み**: WPGraphQL + CORS + ヘッドレス強化
- WPGraphQL プラグインがインストール・有効化されている
- **ACF Pro** がインストール・有効化されている（バージョン6.x推奨）
- **WPGraphQL for ACF** プラグインがインストール・有効化されている（フィールドをGraphQLに公開するため必須）

### 必ず参照すべきドキュメント
- **`/docs/03-content-schema.md` §3（job_posting CPT）** ← **本タスクの最重要参照元**
  - §3.2: ACFフィールド一覧（5タブ・全フィールド定義）
  - §3.3: pin_location 選択肢
  - §3.4: 既存ACFからの移行マッピング（参考、本タスクは新規実装）
- `/docs/03-content-schema.md` §2.1（命名規則）、§2.6（WPGraphQL設定）
- `/docs/03-content-schema.md` §8（実装時の注意点）

### 前回（Task 01, 02）の学び
- スコープ境界は **ファイル名レベルで明示**
- 「参照モード」のコード例を活用（より良いパターンの提案を歓迎）
- セキュリティ・命名規則の細部はレビュー基準に明記
- Git運用は論理単位でコミット分割

---

## やってほしいこと

### 1. ACF Local JSON の有効化

ACF Local JSON 機能を有効化し、フィールド定義をテーマ内の `acf-json/` ディレクトリに保存・読み込みできるようにする。

#### 1-1. ディレクトリ作成
- `acf-json/` ディレクトリをテーマルート（`rishirecruit2026/acf-json/`）に作成
- 空ディレクトリでもGit管理されるよう、`.gitkeep` を配置
- ACFが自動でJSONを生成・上書きするため、ディレクトリの書き込み権限を確保

#### 1-2. ACF Local JSON 設定（PHP）

新規ファイル: `inc/acf-local-json.php`

実装内容:
- `acf/settings/save_json` フィルタで保存先を `acf-json/` に指定
- `acf/settings/load_json` フィルタで読み込み元を `acf-json/` に指定
- デフォルトの load パスは保持（プラグイン拡張への配慮）

**参照モード**（より良いパターンがあれば提案を）:

```php
// JSON保存先を指定
add_filter('acf/settings/save_json', function($path) {
    return get_stylesheet_directory() . '/acf-json';
});

// JSON読み込み元を指定（既存のパスは保持して追加）
add_filter('acf/settings/load_json', function($paths) {
    $paths[] = get_stylesheet_directory() . '/acf-json';
    return $paths;
});
```

### 2. job_posting のACFフィールド登録（PHP）

新規ファイル: `inc/acf-fields-job-posting.php`

`/docs/03-content-schema.md` §3.2 に従って、5タブ構成のフィールドグループを `acf_add_local_field_group()` で登録する。

#### 2-1. フィールドグループの基本設定

```php
acf_add_local_field_group([
    'key' => 'group_job_posting',
    'title' => '求人情報',
    'fields' => [ /* 後述 */ ],
    'location' => [
        [
            ['param' => 'post_type', 'operator' => '==', 'value' => 'job_posting'],
        ],
    ],
    'show_in_rest' => 1,
    'show_in_graphql' => 1,
    'graphql_field_name' => 'jobPostingFields',
]);
```

#### 2-2. タブ構成（5タブ）

| タブ番号 | タブラベル | フィールド数 |
|---|---|---|
| Tab 1 | 募集の基本 | 4 |
| Tab 2 | 業務内容 | 3 |
| Tab 3 | 条件・待遇 | 11 |
| Tab 4 | 勤務地・表示位置 | 3 |
| Tab 5 | 応募 | 1 |

各タブは `'type' => 'tab'` + `'placement' => 'top'` のフィールドとして実装。

#### 2-3. 全フィールドの正確な定義

`/docs/03-content-schema.md` §3.2 を**正確に**参照すること。以下は確認用の全フィールド一覧（誤りなく全部含むこと）:

**Tab 1: 募集の基本**
1. `employment_type` (select, required)
2. `catch_copy` (text)
3. `thumbnail_image` (image)
4. `thumbnail_video_url` (url)

**Tab 2: 業務内容**
5. `description` (wysiwyg, required)
6. `desired_person` (textarea)
7. `required_qualifications` (textarea)

**Tab 3: 条件・待遇**
8. `salary` (text, required)
9. `salary_detail` (textarea)
10. `work_hours` (text, required)
11. `work_hours_detail` (textarea)
12. `holiday` (textarea)
13. `social_insurance` (text)
14. `benefits` (textarea)
15. `housing_support_available` (true_false)
16. `housing_support_detail` (textarea, **conditional**: `housing_support_available == 1` の時のみ表示)
17. `smoking_policy` (text, required)
18. `trial_period` (text)

**Tab 4: 勤務地・表示位置**
19. `work_address` (text, required)
20. `work_address_detail` (textarea)
21. `pin_location` (select, required)

**Tab 5: 応募**
22. `application_flow` (wysiwyg, required)

注: フィールド総数22個（タブ自体は5個別途）。スキーマ文書 §3.2 冒頭は「19フィールド」と記載されているが、実際の表を数えると上記22フィールドが正。**スキーマ表に書かれているフィールドをすべて登録すること**。

#### 2-4. select フィールドの選択肢

**`employment_type` の choices:**
- 正規職員
- 会計年度任用（フル）
- 会計年度任用（パート）
- 嘱託職員
- 任期付職員
- 臨時職員

**`pin_location` の choices**（schema doc §3.3 より）:
- `town_hall` → 役場本庁舎
- `health_center` → 保健センター
- `airport` → 利尻空港
- `oniwaki` → 鬼脇地区

ACFの choices 形式: `'value' => 'label'`

```php
'choices' => [
    'town_hall' => '役場本庁舎',
    'health_center' => '保健センター',
    'airport' => '利尻空港',
    'oniwaki' => '鬼脇地区',
],
```

#### 2-5. フィールド共通設定

全フィールドに以下を設定:
- `show_in_graphql' => 1`
- `graphql_field_name` は ACFのcamelCase自動変換に任せる（明示不要、ただし疑問があればコメントで）
- 必須フィールドは `'required' => 1`
- 各フィールドに `'instructions'` で日本語ヘルプテキストを入れる（管理画面で編集者が迷わないように）

#### 2-6. フィールドキーの命名規則

ACFのフィールドキー（`field_xxx`）の命名規則:
- フィールドグループキー: `group_job_posting`
- タブキー: `field_jp_tab_basic`, `field_jp_tab_description`, `field_jp_tab_conditions`, `field_jp_tab_location`, `field_jp_tab_apply`
- データフィールドキー: `field_jp_{フィールド名}`（例: `field_jp_employment_type`, `field_jp_catch_copy`）

ACFキーは**変更すると既存データとの紐付けが切れる**ため、初期設定で慎重に決めて固定する。

#### 2-7. 個別フィールドの注意点

**`thumbnail_image` (image):**
- `'return_format' => 'array'`（headless運用のため、URL/alt/dimensions等を取得）
- `'preview_size' => 'medium'`

**`thumbnail_video_url` (url):**
- バリデーション: URLパターン

**`description`, `application_flow` (wysiwyg):**
- `'toolbar' => 'full'`
- `'media_upload' => 1`

**`housing_support_available` (true_false):**
- `'ui' => 1`（トグルUI）
- `'default_value' => 0`

**`housing_support_detail` (textarea) — conditional logic:**
```php
'conditional_logic' => [
    [
        [
            'field' => 'field_jp_housing_support_available',
            'operator' => '==',
            'value' => '1',
        ],
    ],
],
```

### 3. `functions.php` の更新

既存の `functions.php` に2ファイルの読み込みを追加:
- `inc/acf-local-json.php`
- `inc/acf-fields-job-posting.php`

読み込み順序（既存ファイルとの統合）:

```
1. inc/theme-setup.php (既存)
2. inc/cpt-registration.php (既存)
3. inc/graphql-config.php (既存)
4. inc/cors-config.php (既存)
5. inc/headless-config.php (既存)
6. inc/acf-local-json.php (新規)         ← Local JSON設定が先
7. inc/acf-fields-job-posting.php (新規)  ← フィールド登録は後
```

---

## 成果物

```
rishirecruit2026/
├── style.css                          (既存)
├── index.php                          (既存)
├── functions.php                      (更新: require_once 2行追加)
├── acf-json/                          (新規ディレクトリ)
│   └── .gitkeep                       (新規)
└── inc/
    ├── cpt-registration.php           (既存)
    ├── theme-setup.php                (既存)
    ├── graphql-config.php             (既存)
    ├── cors-config.php                (既存)
    ├── headless-config.php            (既存)
    ├── acf-local-json.php             (新規)
    └── acf-fields-job-posting.php     (新規)
```

---

## 制約・前提

- **WordPress 6.x 系互換**
- **PHP 8.x 系互換**
- **ACF Pro 6.x 系互換**
- **WPGraphQL for ACF 互換**
- すべてのPHPファイル先頭に `if (!defined('ABSPATH')) exit;`
- 日本語コメントを各フィールドに付ける（編集者が管理画面で迷わないように `'instructions'` 設定）
- インデント: スペース4つ（PSR-12準拠）
- フックは `acf/init` を使う（`init` ではなく `acf/init` の方がACF初期化後の安全なタイミング）
- 関数定義は無名関数推奨（グローバル汚染回避）
- Task 01, 02 のコードスタイル（PHPDoc風コメント、整形）を踏襲

---

## やってはいけないこと

- ❌ **本タスクのスコープ外ファイルを予告なく削除しない**
  - 削除する場合はコミットメッセージで削除理由を1行明記
- ❌ **既存ファイル `index.php`, `inc/cpt-registration.php`, `inc/theme-setup.php`, `inc/graphql-config.php`, `inc/cors-config.php`, `inc/headless-config.php` の修正**
  - 例外: `functions.php` のみ require_once 追加のため更新
- ❌ **touristspot や event のACFフィールド登録**（次のタスク Task 04 で担当）
- ❌ **コアファイル（wp-config.php, wp-includes, wp-admin）の編集**
- ❌ **`/docs/03-content-schema.md` §3.2 の表にないフィールドを勝手に追加**
- ❌ **表にあるフィールドを勝手に省略**
- ❌ **フィールド名のtypo**（特に`apply_enviroment_detail`のような既存typoの再現は厳禁、schema docは修正版が正）
- ❌ **`show_in_graphql' => 0` 設定**（headless運用のため全フィールド公開）
- ❌ **ACFキーの命名規則違反**（後で変更すると既存データが切れる）
- ❌ **デバッグ用の `var_dump` / `print_r` / `error_log` の本番混入**
- ❌ **`acf-json/` 配下のJSONを手作りする**（ACFが自動生成するため、コードでは触らない）

---

## Git運用ルール

- コミットメッセージの最初の行: `Phase 3 Task 03: ACF Local JSON + job_posting フィールド登録`
- 推奨コミット分割:
  - 例 1: `acf-local-json.php 追加 + acf-json/ ディレクトリ作成`
  - 例 2: `acf-fields-job-posting.php 追加（22フィールド + 5タブ）`
  - 例 3: `functions.php 更新（acf関連2ファイルの読み込み）`
- ファイル削除を伴う場合、削除理由を本文に明記
- デバッグコードは別コミットで管理

---

## レビュー基準（Claude Codeレビュー用チェックリスト）

### ファイル構造
- [ ] `acf-json/` ディレクトリが存在し、`.gitkeep` が配置されているか
- [ ] `inc/acf-local-json.php` が存在し、`functions.php` が読み込んでいるか
- [ ] `inc/acf-fields-job-posting.php` が存在し、`functions.php` が読み込んでいるか
- [ ] 既存ファイル（style.css, index.php, inc/ 配下の既存5ファイル）が**変更されていない**か
- [ ] `functions.php` の require_once 順序が正しいか（local-json → fields の順）

### セキュリティ
- [ ] すべてのPHPファイル先頭に `if (!defined('ABSPATH')) exit;` があるか
- [ ] 無名関数で add_filter / add_action / acf_add_local_field_group が実行されているか
- [ ] グローバル変数の汚染がないか

### Local JSON設定
- [ ] `acf/settings/save_json` フィルタが設定されているか
- [ ] `acf/settings/load_json` フィルタが設定されているか
- [ ] 保存先・読み込み元が `get_stylesheet_directory() . '/acf-json'` か
- [ ] デフォルトの load パスを破壊していないか

### フィールド登録（最重要）
- [ ] フィールドグループキーが `group_job_posting` か
- [ ] フィールドグループの `show_in_graphql => 1` が設定されているか
- [ ] `graphql_field_name` が `jobPostingFields` か
- [ ] location が `post_type == job_posting` で限定されているか
- [ ] **5タブすべて存在するか**: 募集の基本 / 業務内容 / 条件・待遇 / 勤務地・表示位置 / 応募
- [ ] 各タブが `'type' => 'tab'`, `'placement' => 'top'` で設定されているか

### フィールドの網羅性（22個全部あるか）
- [ ] Tab 1: employment_type, catch_copy, thumbnail_image, thumbnail_video_url
- [ ] Tab 2: description, desired_person, required_qualifications
- [ ] Tab 3: salary, salary_detail, work_hours, work_hours_detail, holiday, social_insurance, benefits, housing_support_available, housing_support_detail, smoking_policy, trial_period
- [ ] Tab 4: work_address, work_address_detail, pin_location
- [ ] Tab 5: application_flow

### 必須フィールドの required 設定
- [ ] employment_type: required = 1
- [ ] description: required = 1
- [ ] salary: required = 1
- [ ] work_hours: required = 1
- [ ] smoking_policy: required = 1（**法的要件、超重要**）
- [ ] work_address: required = 1
- [ ] pin_location: required = 1
- [ ] application_flow: required = 1

### 個別フィールド設定
- [ ] `thumbnail_image` の return_format が 'array' か
- [ ] `housing_support_available` がトグルUI（ui = 1）か、default_value = 0 か
- [ ] `housing_support_detail` に conditional_logic が設定され、`housing_support_available == 1` の時のみ表示か
- [ ] `description`, `application_flow` が wysiwyg で toolbar=full, media_upload=1 か
- [ ] `employment_type` の choices が schema doc §3.2 と一致するか（6項目）
- [ ] `pin_location` の choices が schema doc §3.3 と一致するか（4項目、value/label両方）

### GraphQL公開
- [ ] **すべてのフィールド**に `show_in_graphql => 1` があるか（タブも含めて）
- [ ] フィールド名がschema doc §3.2 と完全一致するか（typo・命名規則違反なし）

### コード品質
- [ ] 各フィールドに instructions（日本語ヘルプ）が付いているか
- [ ] フィールドキーが `field_jp_*` 命名規則に従っているか
- [ ] PHPDoc風のファイルレベルコメントが先頭にあるか
- [ ] デバッグコード（var_dump, print_r, error_log）が残っていないか

---

## 完了後の確認手順

### 1. 管理画面確認
- WordPress管理画面の「カスタムフィールド > フィールドグループ」に「求人情報」が表示されている
- 「求人」の新規追加画面で5タブ構成（募集の基本 / 業務内容 / 条件・待遇 / 勤務地・表示位置 / 応募）が表示される

### 2. フィールドの動作確認
- 「住居サポートあり」をONにすると「住居サポート詳細」が表示される（OFFで非表示）
- 「雇用形態」のドロップダウンに6項目が表示される
- 「表示するピン位置」のドロップダウンに4項目（役場本庁舎/保健センター/利尻空港/鬼脇地区）が表示される
- 必須フィールドを空のまま保存しようとするとエラーになる

### 3. Local JSONの確認
- 「カスタムフィールド > フィールドグループ」で「求人情報」を編集→保存
- `acf-json/group_job_posting.json` が自動生成されている
- このファイルが他環境への展開で使われる

### 4. WPGraphQL確認
- GraphiQL IDE で次のクエリが動く:
  ```graphql
  {
    jobPostings {
      nodes {
        id
        title
        jobPostingFields {
          employmentType
          catchCopy
          salary
          workHours
          pinLocation
          thumbnailImage {
            sourceUrl
            altText
          }
          thumbnailVideoUrl
          smokingPolicy
          housingSupportAvailable
          housingSupportDetail
          applicationFlow
        }
      }
    }
  }
  ```
  全フィールドがエラーなく取得できること

### 5. テスト投稿で動作確認
- 求人を1件作成して保存
- すべてのフィールドが正常に保存される
- GraphQL で取得して値が一致する

---

## 次タスク予告

**Task 04: touristspot / event のACFフィールド登録**

- Task 03 が安定したら着手
- `/docs/03-content-schema.md` §4（touristspot, 13フィールド・3タブ）
- `/docs/03-content-schema.md` §5（event, 14フィールド・4タブ）
- Local JSON は Task 03 で設定済みなので、フィールド登録のみ

ファイル分割推奨:
- `inc/acf-fields-touristspot.php`
- `inc/acf-fields-event.php`

---

## 補足: ACF + WPGraphQL のフィールド名変換について

ACF の field name は snake_case で定義するが、WPGraphQL は自動で camelCase に変換する:

| ACF name | GraphQL field name |
|---|---|
| `employment_type` | `employmentType` |
| `pin_location` | `pinLocation` |
| `thumbnail_video_url` | `thumbnailVideoUrl` |
| `housing_support_available` | `housingSupportAvailable` |
| `housing_support_detail` | `housingSupportDetail` |

フロント（Next.js）からのクエリは camelCase で書く。本タスクではACF側は snake_case で統一する（schema doc §2.1 に記載）。
