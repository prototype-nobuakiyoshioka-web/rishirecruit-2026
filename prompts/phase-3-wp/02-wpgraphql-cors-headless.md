# Phase 3 - Task 02: WPGraphQL基本設定 + CORS設定 + ヘッドレス強化

**目的:** リシリクルート2026テーマで、ヘッドレス運用の核となる WPGraphQL を本格稼働させ、Next.js フロントエンドからの安全なアクセスを可能にする。同時に、WordPress 側の不要な機能を絞り、ヘッドレス運用に最適化する。

---

## コンテキスト

### 前提環境
- **Task 01 完了済み**: `style.css`, `index.php`, `functions.php`, `inc/cpt-registration.php` が存在
- 3つのCPT（`job_posting`, `touristspot`, `event`）登録済み
- WPGraphQL プラグインがインストール・有効化されている
- ACF Pro もインストール済み（ただしフィールド登録は Task 03 で実施）

### 必ず参照すべきドキュメント
- `/docs/03-content-schema.md` §2.5（CORS設定）、§2.6（WPGraphQL設定）
- `/docs/05-sitemap.md` §10.4（robots.txt の方針）
- `/docs/01-requirements.md`

### 前回（Task 01）のレビューから引き継ぐ改善点
- **textdomain ロード**: `load_theme_textdomain` が呼び出されていなかった → 今回追加
- **noindex 注入**: WordPress フロントエンドURLがインデックスされる可能性 → `wp_robots` フィルタで対応
- **hook呼び出しの徹底**: `wp_head()`, `wp_body_open()`, `wp_footer()` の呼び出しは Task 01 で対応済み（変更不要）

---

## やってほしいこと

### 1. `inc/theme-setup.php` の新規作成

**責務:** テーマの基本設定（i18n、theme supports）

実装内容:
- `after_setup_theme` フックで `load_theme_textdomain('rishirecruit2026', get_template_directory() . '/languages')` を呼ぶ
- `add_theme_support('post-thumbnails')` でサムネイル機能を有効化
- **`add_theme_support('title-tag')` は追加しない**（`index.php` で手動 `<title>` 管理中のため、二重出力回避）

### 2. `inc/graphql-config.php` の新規作成

**責務:** WPGraphQL のセキュリティ設定とパフォーマンスチューニング

実装内容:
- クエリ深さ制限（推奨10〜15、悪意あるクエリの防御）
- クエリ複雑性制限（必要に応じて）
- バッチクエリのサイズ制限
- 開発時のデバッグ設定（開発環境では introspection を有効、本番では検討）

**参照モード**（このとおりでなくてOK、より良いパターンがあれば提案してください）:

```php
add_filter('graphql_max_query_depth', function() {
    return 15;
});

add_filter('graphql_query_analyzer_enabled', '__return_true');
```

WPGraphQL の API は変わりやすいので、現行バージョンのドキュメントに合った書き方を採用してください。

### 3. `inc/cors-config.php` の新規作成

**責務:** ヘッドレス運用のための CORS ヘッダ管理

実装内容:
- 許可するオリジンを **配列で管理**（後から追加しやすくする）:
  - `http://localhost:3000` （Next.js 開発環境）
  - `https://rishirecruit.com` （本番）
  - ステージング環境は将来追加できるよう、コメントで触れておく
- 動的にオリジンを検証して `Access-Control-Allow-Origin` を出力
- `OPTIONS` リクエストへの preflight 応答
- 許可メソッド: `GET, POST, OPTIONS`
- 許可ヘッダ: `Authorization, Content-Type`

**参照モード**（このとおりでなくてOK、より良いパターンがあれば提案してください）:

```php
add_action('init', function() {
    $allowed_origins = [
        'http://localhost:3000',
        'https://rishirecruit.com',
        // 将来のステージング環境: 'https://staging.rishirecruit.com',
    ];

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, $allowed_origins, true)) {
        header("Access-Control-Allow-Origin: {$origin}");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
        header("Access-Control-Allow-Headers: Authorization, Content-Type");
        header("Access-Control-Allow-Credentials: true");
        header("Vary: Origin");
    }

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        status_header(200);
        exit;
    }
});
```

**セキュリティ重要事項:**
- `Access-Control-Allow-Origin: *` のワイルドカード許可は**絶対に避ける**
- `$_SERVER['HTTP_ORIGIN']` の値を直接 echo しない（必ず in_array で検証してから出力）

### 4. `inc/headless-config.php` の新規作成

**責務:** ヘッドレス運用に特化した不要機能の無効化と SEO 制御

実装内容:
- **`wp_robots` フィルタで全ページに `noindex, nofollow` を注入**
  - Next.js 側で正式なSEO制御を行うため、WordPress 側はインデックスさせない
- **emoji スクリプト無効化**（ヘッドレスでは不要、パフォーマンス改善）
- **RSSフィードリンクの自動出力を無効化**（`feed_links` 関連）
- **oEmbed の自動出力を無効化**（任意、必要なら触る）

**参照モード**（robots部分、このとおりでなくてOK）:

```php
add_filter('wp_robots', function($robots) {
    $robots['noindex'] = true;
    $robots['nofollow'] = true;
    return $robots;
});
```

### 5. `functions.php` の更新

既存の `functions.php` に4ファイルの `require_once` を追加。読み込み順序の推奨:

1. `inc/theme-setup.php`（テーマの基本設定が最優先）
2. `inc/cpt-registration.php`（既存、変更なし）
3. `inc/graphql-config.php`
4. `inc/cors-config.php`
5. `inc/headless-config.php`

---

## 成果物

```
rishirecruit2026/
├── style.css                     (既存、変更なし)
├── index.php                     (既存、変更なし)
├── functions.php                 (更新: require_once 追加)
└── inc/
    ├── cpt-registration.php      (既存、変更なし)
    ├── theme-setup.php           (新規)
    ├── graphql-config.php        (新規)
    ├── cors-config.php           (新規)
    └── headless-config.php       (新規)
```

---

## 制約・前提

- **WordPress 6.x 系互換**
- **PHP 8.x 系互換**
- すべてのPHPファイル先頭に `if (!defined('ABSPATH')) exit;` を必ず入れる
- **日本語コメントを各関数・主要ブロックに付ける**（後で見返した時に意図が分かるように）
- インデント: スペース4つ（PSR-12準拠）
- 命名規則: スネークケース（関数）
- グローバル汚染回避のため、無名関数で `add_action/add_filter` を実行
- Task 01 のコードスタイル（PHPDoc風コメント、整形）を踏襲

---

## やってはいけないこと

- ❌ **本タスクのスコープ外ファイルを予告なく削除しない**
  - もし削除が必要な場合は、コミットメッセージで削除理由を1行明記
  - 例: `remove front-page.php (Phase 1 仮UI、Phase 3でindex.phpに集約のため不要)`
- ❌ **既存ファイル `index.php` の修正**（Task 01で完成済み、触らない）
- ❌ **既存ファイル `inc/cpt-registration.php` の修正**（Task 01の成果物、触らない）
- ❌ **ACFフィールドの登録**（次のタスク Task 03 で担当）
- ❌ **プラグインファイルのコード変更**（プラグインは触らない、フィルタ・アクションで対応）
- ❌ **デバッグ用の `var_dump` / `print_r` / `error_log` をプロダクションコードに残す**
- ❌ **コアファイル（wp-config.php, wp-includes, wp-admin）の編集**
- ❌ **`Access-Control-Allow-Origin: *` のワイルドカード許可**（セキュリティリスク）
- ❌ **`$_SERVER['HTTP_ORIGIN']` の値を直接出力**（XSS / ヘッダインジェクションのリスク）

---

## Git運用ルール

- コミットメッセージの最初の行: `Phase 3 Task 02: WPGraphQL + CORS + ヘッドレス強化`
- 複数ファイルの追加があるため、論理的に分けてコミットすることを推奨:
  - 例 1: `theme-setup.php 追加（textdomain + theme supports）`
  - 例 2: `graphql-config.php 追加（クエリ深さ制限）`
  - 例 3: `cors-config.php 追加（許可オリジン制御）`
  - 例 4: `headless-config.php 追加（noindex + 不要機能無効化）`
  - 例 5: `functions.php 更新（4ファイルの読み込み）`
- ファイル削除を伴う場合、削除理由を本文に明記
- 動作確認用のデバッグコードは別コミットで管理（後で revert しやすく）

---

## レビュー基準（Claude Codeレビュー用チェックリスト）

### ファイル構造
- [ ] `inc/theme-setup.php` が存在し、`functions.php` が読み込んでいるか
- [ ] `inc/graphql-config.php` が存在し、`functions.php` が読み込んでいるか
- [ ] `inc/cors-config.php` が存在し、`functions.php` が読み込んでいるか
- [ ] `inc/headless-config.php` が存在し、`functions.php` が読み込んでいるか
- [ ] 既存ファイル（style.css, index.php, inc/cpt-registration.php）が**変更されていない**か

### セキュリティ
- [ ] すべてのPHPファイル先頭に `if (!defined('ABSPATH')) exit;` があるか
- [ ] CORS設定でワイルドカード（`*`）を使っていないか
- [ ] 許可するオリジンが配列で管理され、`in_array(..., true)`（厳密比較）で照合しているか
- [ ] `$_SERVER['HTTP_ORIGIN']` を直接出力していないか（必ず検証後に変数経由）
- [ ] `Vary: Origin` ヘッダが出力されているか（CDNキャッシュ対策）

### 機能
- [ ] `load_theme_textdomain` が `after_setup_theme` フックで呼ばれているか
- [ ] `add_theme_support('post-thumbnails')` が呼ばれているか
- [ ] `add_theme_support('title-tag')` が**呼ばれていない**か（index.php の手動 title と二重になるため）
- [ ] `wp_robots` フィルタで noindex/nofollow が注入されているか
- [ ] CORS の Access-Control-Allow-Origin が動的に設定されているか
- [ ] OPTIONS リクエストに対する preflight 応答（status_header(200) + exit）があるか
- [ ] WPGraphQL のクエリ深さ制限が設定されているか
- [ ] emoji スクリプトが無効化されているか

### コード品質
- [ ] 日本語コメントが付けられているか
- [ ] 各ファイルの責務が明確（混在していないか）
- [ ] 無名関数で add_action/add_filter が実行されているか（グローバル汚染回避）
- [ ] PHP 8.x の構文エラーがないか
- [ ] デバッグコード（var_dump, print_r, error_log）が残っていないか
- [ ] PHPDoc風のファイルレベルコメントが各ファイル先頭にあるか（Task 01の style.css や index.php と同様）

### ヘッドレス特化
- [ ] WordPress のフロントエンドにアクセスしても、メタタグで `noindex,nofollow` が出力されるか
- [ ] 不要なフロントエンド機能（emoji, oEmbed, feed_links 等）が適切に無効化されているか
- [ ] 管理画面（wp-admin）の機能には影響していないか

---

## 完了後の確認手順

1. **管理画面確認**: 「外観 > テーマ」で「Rishirecruit 2026」が引き続きアクティブ
2. **CPT表示確認**: 左メニューに「求人」「観光地」「イベント」が表示されている
3. **GraphQL動作確認**: GraphiQL IDE（`/wp-admin/admin.php?page=graphiql-ide`）で以下が成功:
   ```graphql
   {
     jobPostings {
       nodes {
         id
         title
       }
     }
   }
   ```
4. **CORS確認**: 別オリジンからのフェッチがCORSエラーにならない:
   ```bash
   curl -X OPTIONS \
        -H "Origin: http://localhost:3000" \
        -H "Access-Control-Request-Method: POST" \
        -i \
        http://your-local-site.local/graphql
   ```
   レスポンスヘッダに以下が含まれること:
   - `Access-Control-Allow-Origin: http://localhost:3000`
   - `Access-Control-Allow-Methods: GET, POST, OPTIONS`
   - `Vary: Origin`
5. **noindex確認**: WordPress のフロントURL（例: `http://your-local-site.local/`）にアクセスし、ソース表示で `<meta name="robots" content="noindex, nofollow, max-image-preview:large">` 等が出力されている
6. **不正オリジン拒否確認**:
   ```bash
   curl -X OPTIONS \
        -H "Origin: https://malicious.example.com" \
        -i \
        http://your-local-site.local/graphql
   ```
   `Access-Control-Allow-Origin` ヘッダが**返らない**こと

---

## 次タスク予告

**Task 03: ACF Local JSON 設定 + job_posting のACFフィールド登録**

- Task 02 が安定したら着手
- `/docs/03-content-schema.md` §3.2 に従って19フィールド（5タブ構成）を登録
- ACF Local JSON 機能を有効化して、フィールド定義をコード管理可能にする
