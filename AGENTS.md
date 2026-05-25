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

---

## 技術スタックとバージョン

**フロントエンド**（実装済み: `package.json` 参照）
- Next.js 16（App Router）+ TypeScript 5
- React 19 / React DOM 19
- Tailwind CSS v4（`@tailwindcss/postcss`）
- ESLint 9 + `eslint-config-next`

**フロントエンド**（Phase 4 以降で導入予定）
- React Three Fiber / `@react-three/drei` / `@react-three/postprocessing`
- Lenis（スムーススクロール）
- Zustand（状態管理）
- TanStack Query + `graphql-request` + GraphQL Codegen
- Framer Motion（UIアニメ）

**バックエンド**
- WordPress（ヘッドレス運用）
- WPGraphQL / ACF Pro / ACF for WPGraphQL / CPT UI

**3Dアセット**
- Blender → glTF/GLB（Draco or Meshopt 圧縮）
- 国土地理院 DEM から地形ベース
- 総ポリ目安 5〜10万 / ファイルサイズ ≤ 5MB

> 依存追加は **package.json の Phase ごと一括コミット**を原則とする。バージョンは pin で固定し、three / R3F の組み合わせ崩れを防ぐ。

---

## ディレクトリ構造

```
/                       WordPress テーマルート（style.css / index.php / front-page.php / functions.php）
/app                    Next.js App Router pages
/components
  /scene                Canvas, Island, Pins, Lighting（3D関連）
  /ui                   Modal, Filter, Nav（DOM側UI）
/lib
  /wp                   GraphQLクライアントとクエリ
  /three                Helpers（clamp回転、Billboard等）
/public
  /models               island.glb / island-mobile.glb
/store                  Zustand ストア（scene / ui / data で分離）
/docs                   要件・スキーマ・トークン等
/reference              完全仕様 HTML
```

---

## コーディング規約

- **3D関連コンポーネントは必ず `"use client"`** を冒頭に書く（R3F は Server Component に置けない）
- **`useFrame` 内で重い処理を書かない**（オブジェクト生成・配列再生成 NG、ref 経由で書き換える）
- **状態は責務分離**: 3Dシーン状態 / UI状態 / データ状態 を別ストアで管理
- **型は GraphQL Codegen から生成**したものを使う（手書きしない）
- 命名: コンポーネント PascalCase、フック `use` プレフィックス、ストア `<Name>Store`
- コメントは「なぜ」を書く。「何を」はコードで表現する。

---

## 重要な実装パターン

### スクロール連動回転（clamp → damp の順）

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

---

## やってはいけないこと（禁止事項）

- ❌ R3F コンポーネントを Server Component に置く
- ❌ 島の裏側（回転制限外）をモデリング・実装で考慮する（工数の無駄）
- ❌ ピン座標 (X/Y/Z) を ACF の素の数値フィールドだけで完結させる → 編集者がまず入力できない
- ❌ Three.js と R3F のバージョンを噛み合わないものにする（`package.json` で pin）
- ❌ WP 側でテーマの表示テンプレを作り込む（ヘッドレスなので不要）
- ❌ GLB にテクスチャをベイクして容量を膨らませる → 単色＋バーテックスカラー基本

---

## スクリプト

`package.json` に定義された実コマンド:

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | Next.js 開発サーバ（`http://localhost:3000`） |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番起動（ビルド後） |
| `npm run lint` | ESLint |

> テスト: ランナー未導入。Phase 5 以降で Vitest + Playwright を検討。
> GraphQL Codegen / Lighthouse は Phase 4 で `codegen` / `lh` スクリプトを追加予定。

---

## よくあるエラーと初手対応

| 症状 | まず確認 |
|---|---|
| フロントから WP API が叩けない | CORS 設定（`functions.php` の Allow-Origin） |
| GLB が読み込めない/キャッシュされない | サーバーの MIME `model/gltf-binary` |
| iOS Safari で 3D がカクつく/落ちる | dpr 下げ、影オフ、LOD モデルに切替 |
| スクロール量がズレる | Lenis と native scroll の干渉、Lenis に一元化 |
| 回転がカクつく | clamp→damp の順序、`useFrame` 内の重い処理 |
| WP プレビューが動かない | Next.js Draft Mode + 専用プレビューエンドポイント |

---

## よく使うタスク

### 新しいピン種別を追加する
1. `docs/03-content-schema.md` に CPT / ACF フィールド定義を追記
2. WP 側で CPT UI + ACF にスキーマ登録
3. `lib/wp/queries/` に GraphQL クエリを追加 → `npm run codegen`
4. `components/scene/Pins/` にピンコンポーネントを追加
5. `store/uiStore.ts` のモーダル type に追記

### 新しい 3D コンポーネントを追加する
1. `"use client"` を冒頭に書く
2. `components/scene/` 配下に配置
3. `useFrame` を使う場合、内部でアロケーション禁止（`useRef` で外に出す）
4. `<Canvas>` の子に置く前に Drei の `<Suspense>` で囲む

### 依存パッケージを追加する
1. Phase 範囲を AGENTS.md の「技術スタック」と突合
2. バージョンは固定（`^` を最小限）
3. `package.json` 編集 → `npm install` → `package-lock.json` も commit
4. three / R3F 系は組み合わせ表で確認してから

---

## 現在のフェーズ

<!-- 作業を進めるたびにここを更新する -->
- [ ] Phase 1: 要件定義・設計
- [ ] Phase 2: 3Dアセット制作
- [ ] Phase 3: WordPress 構築
- [ ] Phase 4: フロントエンド基盤
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
8. **参考サイト** → <https://haru-ni.net>
