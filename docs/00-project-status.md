# リシリクルート 現状確認ノート

**作成日:** 2026-05-20
**プロジェクト:** リシリクルート(rishirecruit.com)
**運営:** 1人運営、AI主体コーディング + Claude Code レビュー

---

## 1. 決まったこと

### 1.1 プロジェクト基本情報

- **サイト名(日本語):** リシリクルート
- **英字表記:** rishirecruit(全小文字・一語)
- **ドメイン:** rishirecruit.com
- **コンセプト:** 利尻富士町の3Dポップ求人ポータル(民間運営)
- **参考サイト:** haru-ni.net
- **運営体制:** 1人運営
- **予算:** 月額 ¥10,000〜30,000
- **スケジュール:** 6ヶ月(じっくり方針)
- **タグライン:** 「行き先は、自分で決める。」
- **サブコピー:** 「利尻富士のふもとで、新しい仕事と暮らしを。」

### 1.2 ターゲット優先度

1. 移住検討者(最優先)
2. 求職者
3. 一般読者
4. 観光客

**主要KPI:** 求人応募フォームの送信数

### 1.3 確定アーキテクチャ

| 項目 | 決定 |
|---|---|
| 構成 | Headless WordPress + Next.js |
| カメラ | スクロール連動回転 + 範囲制限(左右45°) |
| モバイル | 軽量3Dを維持(2Dフォールバックしない) |
| WPテーマ | ゼロから自作 |
| ディレクトリ | WPテーマと Next.js を**同一ディレクトリで共存** |

### 1.4 技術スタック

**フロント(導入済):** Next.js 16(App Router), TypeScript 5, React 19, Tailwind CSS v4, ESLint 9
**フロント(導入予定):** React Three Fiber, drei, Lenis, Zustand, TanStack Query, graphql-request, Framer Motion
**バック:** WordPress 6.x / PHP 8.x / WPGraphQL / ACF Pro 6.x / WPGraphQL for ACF / CPT UI
**3D:** Blender → glTF/GLB(Draco/Meshopt 圧縮)、国土地理院 DEM ベース、5〜10万ポリ、≤5MB

### 1.5 コンテンツ設計

**3つのCPT + Note RSS連携:**

- `job_posting`(求人、22フィールド・5タブ)
- `touristspot`(観光地、13フィールド・3タブ)
- `event`(イベント、14フィールド・4タブ)
- コラムは Note の RSS を `/columns` で取得(`column` CPT は作らない)

**運用ルール:**
- サムネイル: 動画URL優先、なければ画像(A仕様)
- ピン位置: コード側 `PIN_POSITIONS` で一元管理
- 求人クラスタ: 役場本庁舎(3件) / 保健センター(2件) / 利尻空港(1件) / 鬼脇地区(13件)

### 1.6 デザインシステム

**カラー(3レイヤー構造):**
- Layer 1: コア(深海ブルー / 海 / 空 / 純白 / 暖白)
- Layer 2: 季節変動(山頂・中腹・麓 × 春夏秋冬の4パターン)
- Layer 3: アクセント(夕陽コーラル / 昆布の金 / 桜貝ピンク)

**ピン色:**
- 求人 = 夕陽コーラル `#FF7B5B`
- 観光地 = 昆布の金 `#F4B942`
- イベント = 桜貝ピンク `#FF8FB1`

**スペーシング:** 4pxベース・13段階
**角丸:** sm 4px / md 8px / lg 12px / xl 20px / 2xl 32px / full
**シャドウ:** 標準5段階(深海ブルー基調) + Popシャドウ5種(ブロック影)

### 1.7 サイトマップ

13ルート + 法的・補助ページ:

- `/` (Home / 3Dマップ)
- `/jobs`, `/jobs/[slug]`
- `/spots`, `/spots/[slug]`
- `/events`, `/events/[slug]`
- `/columns` (Note RSS)
- `/message` (町からの便り、/about ではない)
- `/apply`, `/apply/thanks`
- `/contact`
- `/privacy`, `/terms`

**ヘッダーナビ(CTAなし):** 求人 / 観光地 / イベント / コラム / 町からの便り
**主要CTA配置:** 求人詳細ページに固定 `[応募する]`(夕陽コーラル + popシャドウ)

### 1.8 メッセージング

- ボイス: 落ち着いた確信、視座は高く、表現は素朴
- 各ページのヒーローコピー定義済み
- CTAラベル定義済み(主要・副次)
- NG表現リスト整備済み
- マイクロコピー集(エラー・空状態・フォーム等)整備済み

### 1.9 ドキュメント体系(整備完了)

```
/
├── AGENTS.md / CLAUDE.md / README.md  (整備済み、AGENTS.mdをSSoT化)
├── docs/
│   ├── 01-requirements.md
│   ├── 03-content-schema.md
│   ├── 04-design-tokens.md (v2)
│   ├── 05-sitemap.md
│   └── 06-messaging.md
├── reference/
│   ├── rishiri_3d_site_procedure_ai_optimized.html
│   └── blender-roadmap.html
└── prompts/phase-3-wp/
    ├── 01-theme-bootstrap-and-cpt.md
    └── 02-wpgraphql-cors-headless.md
```

### 1.10 ワークフロー

- **コーディング:** Codex
- **レビュー:** Claude Code
- **戦略・プロンプト設計:** Claude.ai
- **プロンプト管理:** `prompts/phase-X-XX/` 配下に Git 管理

### 1.11 Phase 3 実装進捗

- ✅ Task 01: テーマ基盤 + 3CPT 登録
- ✅ Task 02: WPGraphQL + CORS + ヘッドレス強化(レビューでNG 0件)
- ✅ Next.js 16 雛形(`app/page.tsx` 等)

---

## 2. 保留・作業中

### 2.1 ビジュアル制作(自分で並行作業中)

- 🎨 **ロゴ制作**(Figma/Illustrator で自分でデザイン)
- 🎨 **フォント選定**(自分で探して後で添削依頼予定)

### 2.2 Phase 2: Blender 3D アセット制作

- 🏗️ Blender 学習(`reference/blender-roadmap.html` 参照、6ステップ・10週間目安)
- 🏗️ プロトタイプ作成中(基本的な山シルエットの試作段階)

### 2.3 Phase 3 残タスク

- ⏳ **Task 03: ACF Local JSON + job_posting フィールド登録** ← **次に着手**
  - プロンプト作成済み(`prompts/phase-3-wp/03-acf-local-json-and-job-posting.md`)
  - AGENTS.md 更新後、短縮版のプロンプトに改訂予定
- ⏳ Task 04: touristspot / event フィールド登録
- ⏳ Task 05: WPGraphQL for ACF 動作確認

### 2.4 Phase 4: フロントエンド基盤

- 🏗️ Next.js 16 雛形は作成済み(`app/page.tsx`)
- ⏸️ 本格実装はこれから

### 2.5 任意改善リスト(将来検討)

Task 02 レビューで挙がった任意改善項目:

- CORS の発火スコープを GraphQL のみに限定(`graphql_response_headers_to_send` フィルタ)
- `max_query_depth` の直接フィルタを併記
- `Access-Control-Allow-Credentials: true` の必要性再検証(Phase 4 で確定)
- `add_theme_support('title-tag')` 導入時の `<title>` 二重出力対策

---

## 3. これから決めること

### 3.1 ライセンス・購入関連

- 💰 **ACF Pro Personal($49/年)購入**(推奨確定、未購入)

### 3.2 Phase 2 完了に向けて

- 🗺️ 国土地理院 DEM の具体的取得・変換手順
- 🗺️ ピン配置マップ(2D版) → Blender進捗待ち、後の `02-pin-map.md` 作成

### 3.3 Phase 3 終盤(Task 06 以降想定)

- ❓ Custom Post Type UI(CPT UI プラグイン)を使うか、PHP登録のままで進めるか
- ❓ WordPress プレビューの実装方針(Next.js Draft Mode 経由)

### 3.4 Phase 4 関連

- ❓ 環境変数の管理方針(`NOTE_RSS_URL`, `WP_GRAPHQL_URL`, `WP_PREVIEW_SECRET` 等)
- ❓ Zustand ストアの分割設計細部
- ❓ Tailwind v4 と デザイントークンの統合方法

### 3.5 Phase 5+ 関連

- ❓ アニメーション・トランジション(duration / easing)のトークン化 → デザイントークン v3
- ❓ 季節切替時のアニメーション仕様(瞬時切替 or トランジション)
- ❓ アイコンセット選定(Tabler / Phosphor / Lucide 等)
- ❓ モーダル・ナビのインタラクション細部

### 3.6 コンテンツ・運用

- 📝 `/message` ページの本文(町長メッセージ的なもの) → 役場との連携が必要
- 📝 プライバシーポリシー / 利用規約の文面(法的レビュー要)
- 📝 メール返信テンプレート(応募完了・お問い合わせ受付)
- 📝 Note 連携の運用フロー(誰が・いつ・何を書くか)
- 📝 各CPTの初期データ投入(20件程度の求人・観光地・イベント)

### 3.7 インフラ・デプロイ

- ☁️ WordPress 本番ホスティング業者の選定
- ☁️ Next.js のデプロイ先(Vercel が筆頭候補)
- ☁️ ステージング環境の用意
- ☁️ ドメイン取得(rishirecruit.com)
- ☁️ SSL 設定

### 3.8 法的・公的合意

- ⚖️ 「リシリクルート」の商標確認(リクルートHDとの関係)
- ⚖️ 利尻富士町(自治体)との連携合意の正式化
- ⚖️ 個人情報取り扱いの体制整備

### 3.9 ブランド資産の最終形

- 🎨 ロゴ完成 → `04-design-tokens.md` に「ロゴアセット」セクション追記
- 🎨 フォント確定 → `04-design-tokens.md` に「タイポグラフィ」セクション追記
- 🎨 OGP 画像のデザイン(季節パレット反映)
- 🎨 ファビコン(セカンダリマーク・ピン型)

### 3.10 テスト・QA

- 🧪 テストランナーの導入(Phase 5 以降、Vitest + Playwright)
- 🧪 アクセシビリティ監査(WCAG AA 目標)
- 🧪 Lighthouse スコアの目標値設定
- 🧪 多デバイス動作確認(iOS Safari、Android Chrome 等)

---

## 補足: 次の一手

**Task 03 のプロンプトを AGENTS.md 反映版(短縮版)に書き直してから着手予定。**

Phase 1 はほぼ完了状態にあり、Phase 3 が進行中。Phase 2(Blender)は並行で進める想定。
ボトルネックは Phase 2 の 3D アセット完成と、外部依存(ACF Pro 購入・自治体連携)が中心。