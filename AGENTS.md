# AGENTS.md

このファイルは **Single Source of Truth** です。Codex / Claude Code / その他 AI ツールはすべてこのファイルを参照してください。
**完全仕様は `reference/rishiri_3d_site_procedure_ai_optimized.html`**（`<script id="ai-project-context">` のJSONブロックに構造化データ）。

---

## プロジェクト概要

利尻島を3Dローポリ&ポップに表現したインタラクティブサイト。
スクロールで島が左右に回転（範囲制限あり）し、ピンをクリックすると **求人 / イベント / 観光地 / コラム** の詳細が表示される。
参考: <https://haru-ni.net>

---

## AIエージェントへの役割指示

あなたは熟練のフルスタックエンジニアとして以下のように振る舞ってください。
（Andrej Karpathy のコーディング原則ベース）

### 1. Think Before Coding
- 実装前に考える。仮定を明示、不明点は質問、トレードオフを提示。
- 不確かな点は必ず確認する。

### 2. Simplicity First
- 最小限のコードで解決。余計な機能・抽象化は絶対に追加しない。
- **要求されていないものは作らない。**

### 3. Surgical Changes
- 必要な部分だけ外科的に変更。他のコードは触らない。
- 関係ないリファクタリングは禁止。

### 4. Goal-Driven Execution
- 成功条件を明確に定義し、検証しながら進める。
- 各ステップで確認しながら進捗する。

### 5. Report Honestly
- 完了したこと・していないこと・スキップしたことを正確に報告。
- ハック・仮実装・TODO は明示する。

---

## 確定済みアーキテクチャ（変更しないこと）

| 項目 | 決定 | 根拠 |
|---|---|---|
| 構成 | Headless WordPress + Next.js | 3Dを優先するためフロント分離 |
| カメラ | スクロール連動回転 + 範囲制限（左右45°目安） | 操作迷子防止 + 裏面モデリング省略 |
| モバイル | 軽量3Dを維持（2Dフォールバックしない） | ブランド体験の一貫性 |
| WPテーマ | ゼロから自作（既存テーマ流用しない） | ヘッドレス専用なので最小構成 |
| ディレクトリ | WPテーマと Next.js プロジェクトを**同一ディレクトリで共存** | 単一管理 + Local 連携を簡素化 |

---

## 技術スタックとバージョン

**フロントエンド**（実装済み: `package.json` 参照）
- Next.js 16（App Router）+ TypeScript 5
- React 19 / React DOM 19
- Tailwind CSS v4（`@tailwindcss/postcss`）
- ESLint 9 + `eslint-config-next`

**フロントエンド**（Phase 4 以降で導入予定）
- React Three Fiber / `@react-three/drei` / `@react-three/postprocessing`
- Lenis(スムーススクロール)
- Zustand(状態管理)
- TanStack Query + `graphql-request` + GraphQL Codegen
- Framer Motion(UIアニメ)

**バックエンド**
- WordPress(ヘッドレス運用、6.x 系)
- PHP 8.x 系
- WPGraphQL / ACF Pro 6.x / WPGraphQL for ACF / CPT UI

**3Dアセット**
- Blender → glTF/GLB(Draco or Meshopt 圧縮)
- 国土地理院 DEM から地形ベース
- 総ポリ目安 5〜10万 / ファイルサイズ ≤ 5MB

> 依存追加は **package.json の Phase ごと一括コミット**を原則とする。バージョンは pin で固定し、three / R3F の組み合わせ崩れを防ぐ。

### バージョン指定の読み替えルール

プロンプトや AGENTS.md でパッケージのバージョンを pin 指定している場合、**そのバージョンが実際に npm レジストリに存在するか事前に確認**してから `npm install` を実行する。

- 指定バージョンが存在しない場合 → 同系統(同じメジャー.マイナー)の最新安定版に読み替えて進めてよい
- 読み替えた場合は **コミットメッセージに理由を明記**する(例: `@react-three/drei は 10.3.3 が存在しないため 10.3.0 に読み替え`)
- 読み替えにより three / R3F / drei の組み合わせが崩れる懸念がある場合は、進める前に確認を取る

---

## ディレクトリ構造

```
/                       プロジェクトルート(WP テーマ + Next.js が共存)
├── style.css           WP テーマ必須ファイル
├── index.php           WP テーマ最小テンプレート(ヘッドレス用)
├── functions.php       WP テーマ機能ファイル(inc/* を読み込む)
├── inc/                WP 機能の分割ファイル群
│   ├── cpt-registration.php
│   ├── theme-setup.php
│   ├── graphql-config.php
│   ├── cors-config.php
│   ├── headless-config.php
│   ├── acf-local-json.php           (Task 03 で追加予定)
│   └── acf-fields-*.php              (Task 03-04 で追加予定)
├── acf-json/           ACF Local JSON 保存先(Task 03 で追加予定)
├── app/                Next.js App Router pages
├── components/
│   ├── scene/          Canvas, Island, Pins, Lighting(3D関連)
│   └── ui/             Modal, Filter, Nav(DOM側UI)
├── lib/
│   ├── wp/             GraphQLクライアントとクエリ
│   └── three/          Helpers(clamp回転、Billboard等)
├── public/
│   └── models/         island.glb / island-mobile.glb
├── store/              Zustand ストア(scene / ui / data で分離)
├── docs/               要件・スキーマ・トークン等
├── reference/          完全仕様 HTML
└── prompts/            Codex 用タスクプロンプト
```

WordPress 側はこのディレクトリをテーマとして認識し、Next.js 側は `app/` `package.json` 等を起点に動作する。両者は干渉しない。

---

## コーディング規約

### TypeScript / React(Phase 4 以降中心)

- **3D関連コンポーネントは必ず `"use client"`** を冒頭に書く(R3F は Server Component に置けない)
- **`useFrame` 内で重い処理を書かない**(オブジェクト生成・配列再生成 NG、ref 経由で書き換える)
- **状態は責務分離**: 3Dシーン状態 / UI状態 / データ状態 を別ストアで管理
- **型は GraphQL Codegen から生成**したものを使う(手書きしない)
- 命名: コンポーネント PascalCase、フック `use` プレフィックス、ストア `<Name>Store`
- コメントは「なぜ」を書く。「何を」はコードで表現する。

### PHP / WordPress(Phase 3 中心)

- すべての PHP ファイル先頭に `if (!defined('ABSPATH')) exit;`
- インデント: スペース4つ(PSR-12 準拠)
- 命名: 関数 snake_case / クラス PascalCase
- 各ファイル先頭に PHPDoc 風コメントで責務を明記
- 関数・主要ブロックに **日本語コメント**を付ける(後で見返した時に意図が分かるように)
- 無名関数で `add_action` / `add_filter` を実行(グローバル汚染回避)
- テキストドメイン: `'rishirecruit2026'`
- **WordPress 6.x / PHP 8.x 互換**
- すべての CPT・ACF フィールドに `show_in_graphql => 1`
- ACF フィールド名は snake_case(WPGraphQL が camelCase に自動変換)
- フックは適切なタイミングを使う(`init`, `acf/init`, `after_setup_theme`, `graphql_*` 等)

---

## 重要な実装パターン

### スクロール連動回転(clamp → damp の順)

```ts
"use client";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";

const MAX = Math.PI / 4; // ±45°

useFrame((_, dt) => {
  if (!ref.current) return;
  const target = THREE.MathUtils.clamp(
    (scroll.offset - 0.5) * 2 * MAX,
    -MAX, MAX
  );
  ref.current.rotation.y = THREE.MathUtils.damp(
    ref.current.rotation.y, target, 4, dt
  );
});
```

**順序を間違えるとカクつく**: 必ず `clamp` → `damp` の順。

### モバイル時の GLB 切替

デバイス判定で `island.glb` ↔ `island-mobile.glb` を切り替える。`dpr` も `[1, 1.5]` に制限し、影とポストエフェクトはオフ。

### ACF フィールドキーの命名規則

- フィールドグループキー: `group_<post_type>` (例: `group_job_posting`)
- タブキー: `field_<prefix>_tab_<section>` (例: `field_jp_tab_basic`)
- データフィールドキー: `field_<prefix>_<name>` (例: `field_jp_employment_type`)

prefix は post_type のイニシャル(`job_posting → jp`, `touristspot → ts`, `event → ev`)。
**ACF キーは一度公開したデータと紐付くため、変更しない**。

---

## やってはいけないこと(禁止事項)

### 共通

- ❌ コアファイル(wp-config.php, wp-includes, wp-admin)の編集
- ❌ プラグイン本体のコード変更(フィルタ・アクションで対応)
- ❌ デバッグコード(`var_dump`, `print_r`, `error_log`)の本番混入
- ❌ スコープ外ファイルの予告なし削除(削除時はコミットメッセージで理由を1行明記)
- ❌ Three.js と R3F のバージョンを噛み合わないものにする(`package.json` で pin)

### Phase 3(WordPress 構築)固有

- ❌ WP 側でテーマの表示テンプレを作り込む(ヘッドレスなので不要)
- ❌ `Access-Control-Allow-Origin: *` のワイルドカード許可
- ❌ `$_SERVER['HTTP_ORIGIN']` の直接出力(XSS / ヘッダインジェクションのリスク)
- ❌ ACF フィールド名の typo(既存の typo の再現も厳禁、schema doc 修正版が正)
- ❌ ACF キーの命名規則違反(既存データとの紐付けが切れる)
- ❌ ピン座標 (X/Y/Z) を ACF の素の数値フィールドだけで完結させる → 編集者がまず入力できない(`pin_location` select で扱う)

### Phase 4-5(フロント・3D)固有

- ❌ R3F コンポーネントを Server Component に置く
- ❌ 島の裏側(回転制限外)をモデリング・実装で考慮する(工数の無駄)
- ❌ GLB にテクスチャをベイクして容量を膨らませる → 単色＋バーテックスカラー基本

---

## スクリプト

`package.json` に定義された実コマンド:

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | Next.js 開発サーバ(`http://localhost:3000`) |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番起動(ビルド後) |
| `npm run lint` | ESLint |

> テスト: ランナー未導入。Phase 5 以降で Vitest + Playwright を検討。
> GraphQL Codegen / Lighthouse は Phase 4 で `codegen` / `lh` スクリプトを追加予定。

---

## よくあるエラーと初手対応

| 症状 | まず確認 |
|---|---|
| フロントから WP API が叩けない | CORS 設定(`inc/cors-config.php` の許可オリジン) |
| GraphQL で ACF フィールドが返ってこない | フィールドの `show_in_graphql => 1` 設定、WPGraphQL for ACF 有効化 |
| GLB が読み込めない/キャッシュされない | サーバーの MIME `model/gltf-binary` |
| iOS Safari で 3D がカクつく/落ちる | dpr 下げ、影オフ、LOD モデルに切替 |
| スクロール量がズレる | Lenis と native scroll の干渉、Lenis に一元化 |
| 回転がカクつく | clamp→damp の順序、`useFrame` 内の重い処理 |
| WP プレビューが動かない | Next.js Draft Mode + 専用プレビューエンドポイント |

---

## よく使うタスク

### 新しいピン種別を追加する
1. `docs/03-content-schema.md` に CPT / ACF フィールド定義を追記
2. `inc/cpt-registration.php` に CPT 登録を追加
3. `inc/acf-fields-<post_type>.php` を新規作成して ACF フィールドを登録
4. `lib/wp/queries/` に GraphQL クエリを追加 → `npm run codegen`
5. `components/scene/Pins/` にピンコンポーネントを追加
6. `store/uiStore.ts` のモーダル type に追記

### 新しい 3D コンポーネントを追加する
1. `"use client"` を冒頭に書く
2. `components/scene/` 配下に配置
3. `useFrame` を使う場合、内部でアロケーション禁止(`useRef` で外に出す)
4. `<Canvas>` の子に置く前に Drei の `<Suspense>` で囲む

### 依存パッケージを追加する
1. Phase 範囲を AGENTS.md の「技術スタック」と突合
2. バージョンは固定(`^` を最小限)
3. `package.json` 編集 → `npm install` → `package-lock.json` も commit
4. three / R3F 系は組み合わせ表で確認してから

### 新しい Codex タスクを追加する
1. `prompts/phase-X-<name>/NN-<task>.md` を作成
2. プロンプトには共通ルール(PHP規約等)を再記述しない(AGENTS.md 参照を促す)
3. タスク固有の内容・成果物・レビュー基準・確認手順に集中する

---

## 現在のフェーズ

<!-- 作業を進めるたびにここを更新する -->
- [x] **Phase 1: 要件定義・設計** — 完了(`docs/` 配下 5 ファイル + `reference/` の HTML)
- [ ] **Phase 2: 3Dアセット制作** — ロードマップあり、Blender 作業中(`reference/blender-roadmap.html`)
- [ ] **Phase 3: WordPress 構築** — 進行中
  - [x] Task 01: テーマ基盤 + 3CPT 登録
  - [x] Task 02: WPGraphQL + CORS + ヘッドレス強化
  - [ ] Task 03: ACF Local JSON + job_posting フィールド登録 ← **次やる**
  - [ ] Task 04: touristspot / event フィールド登録
  - [ ] Task 05: WPGraphQL for ACF 動作確認
- [ ] **Phase 4: フロントエンド基盤** — 進行中
  - [x] Task 01: R3F 最小シーン + 島 GLB 表示
  - [ ] Task 02: スクロール連動回転(clamp → damp、Lenis 導入) ← **次やる**
- [ ] Phase 5: 3D シーン実装
- [ ] Phase 6: ピン・コンテンツ実装
- [ ] Phase 7: モバイル最適化
- [ ] Phase 8: テスト・デプロイ

---

## 困ったときの参照先

1. **このプロジェクトの完全仕様** → `reference/rishiri_3d_site_procedure_ai_optimized.html`
2. **Blender作業** → `reference/blender-roadmap.html`
3. **要件定義** → `docs/01-requirements.md`
4. **コンテンツスキーマ** → `docs/03-content-schema.md`
5. **デザイントークン (v2)** → `docs/04-design-tokens.md`
6. **サイトマップ・情報設計** → `docs/05-sitemap.md`
7. **メッセージング・コピー** → `docs/06-messaging.md`
8. **Codex タスクプロンプト** → `prompts/phase-*/`
9. **参考サイト** → <https://haru-ni.net>