# CLAUDE.md

このファイルは Claude Code がこのリポジトリで作業するときに自動で読み込まれます。
**完全仕様は `reference/rishiri_3d_site_procedure_ai_optimized.html` を参照してください。**
（特に `<script id="ai-project-context">` のJSONブロックにプロジェクト全体の構造化データがあります）

---

## プロジェクト概要

利尻島を3Dローポリ&ポップに表現したインタラクティブサイト。スクロールで島が左右に回転（範囲制限あり）し、ピンをクリックすると **求人 / イベント / 観光地 / コラム** の詳細が表示される。参考: `haru-ni.net`。

---

## 確定済みアーキテクチャ（変更しないこと）

| 項目 | 決定 | 根拠 |
|---|---|---|
| 構成 | Headless WordPress + Next.js | 3Dを優先するためフロント分離 |
| カメラ | スクロール連動回転 + 範囲制限（左右45°目安） | 操作迷子防止 + 裏面モデリング省略 |
| モバイル | 軽量3Dを維持（2Dフォールバックしない） | ブランド体験の一貫性 |
| WPテーマ | ゼロから自作（既存テーマ流用しない） | ヘッドレス専用なので最小構成 |

---

## 技術スタック

**フロントエンド**
- Next.js 14（App Router）+ TypeScript
- React Three Fiber / @react-three/drei / @react-three/postprocessing
- Lenis（スムーススクロール）
- Zustand（状態管理）
- TanStack Query + graphql-request + GraphQL Codegen
- Tailwind CSS
- Framer Motion（UIアニメ）

**バックエンド**
- WordPress（ヘッドレス運用）
- WPGraphQL / ACF Pro / ACF for WPGraphQL / CPT UI

**3Dアセット**
- Blender → glTF/GLB（Draco or Meshopt圧縮）
- 国土地理院DEMから地形ベース
- 総ポリ目安 5〜10万 / ファイルサイズ ≤ 5MB

---

## ディレクトリ構造（フロント側）

```
/app                    Next.js App Router pages
/components
  /scene                Canvas, Island, Pins, Lighting（3D関連）
  /ui                   Modal, Filter, Nav（DOM側UI）
/lib
  /wp                   GraphQLクライアントとクエリ
  /three                Helpers（clamp回転、Billboard等）
/public
  /models               island.glb / island-mobile.glb
/store                  Zustandストア（scene / ui / data で分離）
```

---

## コーディング規約

- **3D関連コンポーネントは必ず `"use client"`** を冒頭に書く（R3FはServer Componentに置けない）
- **`useFrame` 内で重い処理を書かない**（オブジェクト生成・配列再生成NG、ref経由で書き換える）
- **状態は責務分離**: 3Dシーン状態 / UI状態 / データ状態 を別ストアで管理
- **型はGraphQL Codegenから生成**したものを使う（手書きしない）
- 命名: コンポーネントPascalCase、フック`use`プレフィックス、ストア`<Name>Store`

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

### モバイル時のGLB切替

デバイス判定で `island.glb` ↔ `island-mobile.glb` を切り替える。`dpr` も `[1, 1.5]` に制限し、影とポストエフェクトはオフ。

---

## やってはいけないこと（禁止事項）

- ❌ R3FコンポーネントをServer Componentに置く
- ❌ 島の裏側（回転制限外）をモデリング・実装で考慮する（工数の無駄）
- ❌ ピン座標(X/Y/Z)をACFの素の数値フィールドだけで完結させる → 編集者がまず入力できない
- ❌ Three.jsとR3Fのバージョンを噛み合わないものにする（package.jsonでpin）
- ❌ WP側でテーマの表示テンプレを作り込む（ヘッドレスなので不要）
- ❌ GLBにテクスチャをベイクして容量を膨らませる → 単色＋バーテックスカラー基本

---

## よくあるエラーと初手対応

| 症状 | まず確認 |
|---|---|
| フロントからWP APIが叩けない | CORS設定（`functions.php` の Allow-Origin） |
| GLBが読み込めない/キャッシュされない | サーバーのMIME `model/gltf-binary` |
| iOS Safariで3Dがカクつく/落ちる | dpr下げ、影オフ、LODモデルに切替 |
| スクロール量がズレる | Lenisとnative scrollの干渉、Lenisに一元化 |
| 回転がカクつく | clamp→dampの順序、useFrame内の重い処理 |
| WPプレビューが動かない | Next.js Draft Mode + 専用プレビューエンドポイント |

---

## 主要コマンド（プロジェクト構築後に追記）

```bash
# 開発
npm run dev

# 型生成（GraphQL Codegen）
npm run codegen

# ビルド
npm run build

# Lighthouse計測
npm run lh
```

---

## 現在のフェーズ

<!-- 作業を進めるたびにここを更新する -->
- [ ] Phase 1: 要件定義・設計
- [ ] Phase 2: 3Dアセット制作
- [ ] Phase 3: WordPress構築
- [ ] Phase 4: フロントエンド基盤
- [ ] Phase 5: 3Dシーン実装
- [ ] Phase 6: ピン・コンテンツ実装
- [ ] Phase 7: モバイル最適化
- [ ] Phase 8: テスト・デプロイ

---

## 困ったときの参照先

1. **このプロジェクトの完全仕様** → `reference/rishiri_3d_site_procedure_ai_optimized.html`
2. **要件定義** → `docs/01-requirements.md`
3. **コンテンツスキーマ** → `docs/03-content-schema.md`
4. **参考サイト** → https://haru-ni.net
5. **R3F公式** → https://r3f.docs.pmnd.rs/
6. **WPGraphQL** → https://www.wpgraphql.com/
