# Phase 3 - Task 01: テーマ基盤セットアップ + CPT登録

**目的:** リシリクルート（rishirecruit.com）のWordPressヘッドレス運用のための、カスタムテーマ「rishirecruit2026」の最小基盤を作成し、3つのCustom Post Typeを登録する。

---

## コンテキスト

### 前提環境
- WordPress（Localで稼働中）の `wp-content/themes/rishirecruit2026/` ディレクトリで作業
- ACF Pro と WPGraphQL は別途インストール想定（このタスクでは触らない）
- このテーマは**ヘッドレス運用前提**（フロントエンドはNext.jsで別途構築）

### 必ず参照すべきドキュメント
- `/docs/03-content-schema.md` の §2（共通仕様）、§3（job_posting）、§4（touristspot）、§5（event）
  - 特に各CPTの `graphql_single_name`, `graphql_plural_name`, `supports` の正確な値
- `/docs/01-requirements.md` の §2（プロジェクト概要）

---

## やってほしいこと

### 1. テーマ基盤ファイルの作成

以下のファイルが存在しなければ新規作成、存在すれば適切に更新する。

#### `style.css`（WordPress必須）

```css
/*
Theme Name: Rishirecruit 2026
Theme URI: https://rishirecruit.com
Author: [運営者名（後で更新する想定）]
Description: ヘッドレス運用のカスタムテーマ。リシリクルート専用。WPGraphQL経由でNext.jsフロントエンドにデータを供給する。
Version: 1.0.0
Requires at least: 6.0
Requires PHP: 8.0
Text Domain: rishirecruit2026
*/
```

#### `index.php`

ヘッドレス運用のため**最小限**の内容。フロントエンドアクセスは原則禁止されるべきで、API経由のみ使用する。
ただしWordPressの仕様上、index.phpは存在しないとテーマとして認識されないため、簡素なメッセージを表示するだけにする。

#### `functions.php`

以下の構造で:
- ファイル先頭にコメントで責務を明記
- `if (!defined('ABSPATH')) exit;` でセキュリティチェック
- `require_once` で `/inc/` 配下のファイルを読み込む構成

### 2. CPT登録

新規ファイル: `inc/cpt-registration.php`

`/docs/03-content-schema.md` の仕様に従って、3つのCPTを登録する。

#### job_posting
- post_type slug: `job_posting`
- graphql_single_name: `jobPosting`
- graphql_plural_name: `jobPostings`
- public: true
- show_in_rest: true
- show_in_graphql: true
- supports: `['title', 'editor', 'thumbnail']`
- menu_icon: `dashicons-businessperson`（または適切なもの）

#### touristspot
- post_type slug: `touristspot`
- graphql_single_name: `touristspot`
- graphql_plural_name: `touristspots`
- supports: `['title', 'editor', 'thumbnail']`
- menu_icon: `dashicons-location`

#### event
- post_type slug: `event`
- graphql_single_name: `event`
- graphql_plural_name: `events`
- supports: `['title', 'editor', 'thumbnail']`
- menu_icon: `dashicons-calendar-alt`

各CPTの管理画面表示用ラベル（labels配列）も日本語で適切に設定:
- job_posting: 求人 / 求人一覧 / 新規追加 など
- touristspot: 観光地 / 観光地一覧 など
- event: イベント / イベント一覧 など

`register_post_type` のフックは `'init'` で実行する。

---

## 成果物

以下のファイル構造になっていること:

```
rishirecruit2026/
├── style.css                     ← 新規 or 更新
├── index.php                     ← 新規 or 更新（最小限）
├── functions.php                 ← 新規 or 更新（構造化）
└── inc/
    └── cpt-registration.php      ← 新規（3CPT登録）
```

---

## 制約・前提

- **WordPress 6.x 系互換**
- **PHP 8.x 系互換**
- `register_post_type` のみ使用（カスタム実装は不要）
- テキストドメインは `'rishirecruit2026'` で統一
- セキュリティ: PHPファイル先頭に必ず `if (!defined('ABSPATH')) exit;` を入れる
- コメント: 各関数・主要ブロックに**日本語コメント**を付ける（保守性のため）
- インデント: スペース4つ（PSR-12準拠）

---

## Git運用ルール
- コミットメッセージの最初の行はタスク名を含める
  - 例: `Phase 3 Task 01: テーマ基盤 + 3CPT登録`
- ファイル削除を伴う場合、削除理由を本文に明記
- 1コミット = 1論理的変更（小分けに）

---

## やってはいけないこと

- ❌ ACFフィールドの登録（次のタスクで担当）
- ❌ WPGraphQL設定の細部・カスタマイズ（次のタスクで担当）
- ❌ CORS設定（次のタスクで担当）
- ❌ フロントエンドのテンプレート作成（header.php, footer.php, single-*.php等は不要）
- ❌ enqueue_scripts / enqueue_styles でのフロントエンドアセット読み込み（jQuery、Bootstrap等）
- ❌ 本タスクのスコープ外のファイル（既存テンプレートファイル等）を予告なく削除
   - 削除する必要がある場合は、コミットメッセージで削除理由を1行明記
   - 例:「remove front-page.php (Phase 1 仮UI、Phase 3でindex.phpに集約のため不要)」
- ❌ ドキュメントに記載されていないCPTを追加すること

---

## レビュー基準（Claude Codeでのレビュー時に使うチェックリスト）

### ファイル構造
- [ ] `style.css` が存在し、テーマヘッダコメントが正しいか
- [ ] `index.php` が存在するが最小限の内容か
- [ ] `functions.php` が存在し、`inc/cpt-registration.php` を読み込んでいるか
- [ ] `inc/cpt-registration.php` が存在するか

### セキュリティ・規約
- [ ] すべてのPHPファイル先頭に `if (!defined('ABSPATH')) exit;` があるか
- [ ] テキストドメインが `rishirecruit2026` で統一されているか
- [ ] PHPの開始タグ `<?php` で適切に始まっているか

### CPT登録
- [ ] 3つのCPT（job_posting / touristspot / event）すべてが登録されているか
- [ ] 各CPTに `show_in_graphql: true` が設定されているか
- [ ] graphql_single_name / graphql_plural_name が `/docs/03-content-schema.md` と一致するか
- [ ] supports に `'title'`, `'editor'`, `'thumbnail'` が含まれているか
- [ ] `register_post_type` が `'init'` アクションフックで呼ばれているか
- [ ] 管理画面用ラベル（labels）が日本語で設定されているか

### コード品質
- [ ] 日本語コメントが付けられているか
- [ ] 不要なフロントエンド処理（enqueue, template_partsなど）が混入していないか
- [ ] PHP 8.x の構文エラーがないか

---

## 完了後の確認手順

1. WordPress管理画面（`/wp-admin/`）にログイン
2. 左サイドメニューに「求人」「観光地」「イベント」の3項目が表示されているか確認
3. 「外観 > テーマ」で「Rishirecruit 2026」がアクティブになっていることを確認
4. （WPGraphQLが入っていれば）GraphiQL IDE で `{ jobPostings { nodes { id } } }` がエラーなく実行できるか確認

---

## 次タスク予告

このタスク完了後、以下のタスクを順次行う:
- **Task 02:** WPGraphQL基本設定 + CORS設定
- **Task 03:** ACF Local JSON 設定 + job_posting のACFフィールド登録
- **Task 04:** touristspot / event のACFフィールド登録
- **Task 05:** WPGraphQL for ACF の設定確認
