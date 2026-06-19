# Phase 4 - Task 01: R3F 最小シーン + 島 GLB 表示

**目的:** React Three Fiber(R3F)の依存パッケージを導入し、利尻島のGLBモデルをブラウザに表示する最小シーンを実装する。スクロール連動・ピン・UI は**このタスクでは作らない**。「島が画面に出る」が唯一のゴール。

---

## コンテキスト

### 前提環境
- Next.js 16(App Router)+ TypeScript 5 + Tailwind CSS v4 の雛形が存在
- `app/page.tsx`, `app/layout.tsx`, `app/globals.css` がある
- WordPress / WPGraphQL 側は Phase 3 で実装済み(このタスクでは触らない)
- `AGENTS.md` の全ルールに従うこと

### GLB ファイルの構成(解析済み)

ファイル: `public/models/rishiri-prototype1.glb`（436KB、圧縮なし）

| ノード名 | 役割 | ポリゴン数 |
|---|---|---|
| `base` | 麓の地形 | 6,743 |
| `海面` | 海のプレーン | 2 |
| `peak` | 山頂 | 256 |
| `mid` | 中腹 | 605 |

- テクスチャ: **なし**（全マテリアル単色 baseColor のみ）
- 3層構造（peak / mid / base）が既に完成済み → 季節切替の準備ができている

### 必ず参照すべきドキュメント
- `docs/04-design-tokens.md` §3（カラーレイヤー）、§5（季節カラー）
- `AGENTS.md` のスクロール連動回転コードパターン(Step 2 以降で使う)

---

## やってほしいこと

### 1. 依存パッケージの追加

以下を `package.json` に追加して `npm install` する。
バージョンは **固定**（`^` を最小限）。three / R3F の組み合わせ崩れを防ぐため、現在確認されている安定バージョンで固定すること。

```json
"dependencies": {
  "three": "0.176.0",
  "@react-three/fiber": "9.1.2",
  "@react-three/drei": "10.3.3"
}
```

`@types/three` が必要な場合は `devDependencies` に追加。

### 2. GLB ファイルの配置

`public/models/rishiri-prototype1.glb` に配置されている前提で実装する。
（ファイル自体の移動は不要、すでに配置済みとして扱う）

### 3. ファイル構成

以下のファイルを新規作成する:

```
components/
└── scene/
    ├── IslandCanvas.tsx   ← Canvas ラッパー（"use client" 必須）
    └── IslandModel.tsx    ← GLB 読み込み + メッシュ表示
app/
└── page.tsx               ← 既存ファイルを更新（Canvas を配置）
```

### 4. `IslandModel.tsx` の実装

**責務:** GLB を読み込み、4つのメッシュ（base / 海面 / peak / mid）を表示する。

```
"use client" が必須。
useGLTF で GLB を読み込む。
各ノード名（base / 海面 / peak / mid）を正確に参照する。
マテリアルは GLB の既存 baseColor をそのまま使う（この段階では色変更しない）。
```

**参照モード**（このとおりでなくてOK、より良い書き方があれば提案してください）:

```tsx
"use client";
import { useGLTF } from "@react-three/drei";
import { Group } from "three";
import { useRef } from "react";

export function IslandModel() {
  const { nodes, materials } = useGLTF("/models/rishiri-prototype1.glb");
  const groupRef = useRef<Group>(null);

  return (
    <group ref={groupRef}>
      {/* 各メッシュを nodes から参照 */}
    </group>
  );
}

// プリロード（パフォーマンス向上）
useGLTF.preload("/models/rishiri-prototype1.glb");
```

TypeScript の型は `@types/three` または `three` の型を使う。`any` は使わない。

### 5. `IslandCanvas.tsx` の実装

**責務:** R3F の `<Canvas>` をラップし、シーン全体を管理する。

実装内容:
- `<Canvas>` で `IslandModel` を囲む
- カメラの初期位置を島が全体的に見える位置に設定（例: `position={[0, 5, 15]}`、調整してOK）
- `<ambientLight>` と `<directionalLight>` で基本ライティング
- `<OrbitControls>` を有効化（この段階ではマウスで自由に回せる状態でOK）
- `<Suspense fallback={null}>` で `IslandModel` を囲む

```tsx
"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Suspense } from "@react-three/drei";
import { IslandModel } from "./IslandModel";

export function IslandCanvas() {
  return (
    <Canvas camera={{ position: [0, 5, 15], fov: 45 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Suspense fallback={null}>
        <IslandModel />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}
```

### 6. `app/page.tsx` の更新

現在の雛形 `page.tsx` を更新して `IslandCanvas` を表示する。

- Canvas の親要素に `width: 100vw; height: 100vh;` を設定（Canvas が高さを必要とするため）
- 背景色は `docs/04-design-tokens.md` の `--c-deep-ocean: #0A2E4E`（深海ブルー）を使う
- デザイントークンの CSS 変数は `app/globals.css` で定義されている想定（なければ inline で暫定設定）

---

## 成果物

```
public/
└── models/
    └── rishiri-prototype1.glb   (配置済み、変更なし)
components/
└── scene/
    ├── IslandCanvas.tsx          (新規)
    └── IslandModel.tsx           (新規)
app/
├── globals.css                   (デザイントークン変数を追加する場合のみ更新)
├── layout.tsx                    (変更なし)
└── page.tsx                      (更新: IslandCanvas を配置)
package.json                      (更新: three / R3F / drei を追加)
package-lock.json                 (自動更新)
```

---

## 制約・前提

- **`"use client"` を Canvas 関連コンポーネントすべての先頭に書く**（R3F は Server Component に置けない、AGENTS.md のルール）
- **`useFrame` 内でオブジェクト生成・配列再生成をしない**（今回は useFrame を使わないが、将来の実装でも必ず守る）
- TypeScript の型エラーを出さない（`any` 禁止）
- `three` と `@react-three/fiber` のバージョンを噛み合わないものにしない
- ノード名（`base` / `海面` / `peak` / `mid`）は GLB の実際の名前と一致させる（タイポ厳禁）
- **このタスクでは触らない**: WordPress 側のすべてのファイル、`inc/` 配下、`functions.php`、`style.css`、`index.php`

---

## やってはいけないこと

- ❌ **R3F コンポーネントを Server Component に置く**（`"use client"` なしで使う）
- ❌ **`OrbitControls` を Step 2 のスクロール連動前に削除する**（Step 2 のタスクで置き換える）
- ❌ **`any` 型の多用**（three の型を使う）
- ❌ **three / R3F のバージョンを最新にして固定しない**（組み合わせ崩れのリスク）
- ❌ **スクロール連動・ピン・モーダル・Zustand の実装**（スコープ外、次タスク以降）
- ❌ **GLB ノード名を勝手に変える**（Blender 側のデータと一致させる必要がある）
- ❌ **WordPress 側ファイルへの変更**

---

## Git 運用ルール

コミットメッセージ例:
- `Phase 4 Task 01: three / R3F / drei パッケージ追加`
- `Phase 4 Task 01: IslandModel.tsx + IslandCanvas.tsx 新規作成`
- `Phase 4 Task 01: app/page.tsx に IslandCanvas を配置`

ファイル削除がある場合は削除理由を本文に明記。

---

## レビュー基準（Claude Code レビュー用チェックリスト）

### ファイル構造
- [ ] `components/scene/IslandCanvas.tsx` が存在するか
- [ ] `components/scene/IslandModel.tsx` が存在するか
- [ ] `app/page.tsx` が更新され、`IslandCanvas` を読み込んでいるか
- [ ] WordPress 側ファイル（`inc/`, `functions.php`, `style.css`, `index.php`）が**変更されていない**か

### パッケージ
- [ ] `three`, `@react-three/fiber`, `@react-three/drei` が `package.json` に追加されているか
- [ ] バージョンが固定されているか（`^` なし、または最小限）
- [ ] `package-lock.json` が更新されているか

### R3F 規約
- [ ] `IslandCanvas.tsx` の先頭に `"use client"` があるか
- [ ] `IslandModel.tsx` の先頭に `"use client"` があるか
- [ ] `<Canvas>` が `<Suspense>` で `IslandModel` を囲んでいるか
- [ ] `useGLTF.preload()` が呼ばれているか

### GLB 参照
- [ ] GLB のパスが `/models/rishiri-prototype1.glb` か
- [ ] ノード名 `base` / `海面` / `peak` / `mid` を正確に参照しているか
- [ ] TypeScript 型エラーがないか（`any` 未使用）

### ビジュアル
- [ ] Canvas の親要素に高さ（`100vh` 等）が設定されているか
- [ ] 背景色に `#0A2E4E`（深海ブルー）が使われているか
- [ ] `<ambientLight>` と `<directionalLight>` が設定されているか
- [ ] `<OrbitControls>` が有効か（Step 2 まではマウス操作で確認できる状態）

---

## 完了後の確認手順

1. `npm run dev` を起動
2. `http://localhost:3000` をブラウザで開く
3. 深海ブルーの背景に利尻島の3Dモデルが表示されることを確認
4. マウスドラッグで島を自由に回転できることを確認（OrbitControls）
5. マウスホイールでズームできることを確認
6. ブラウザの開発者ツールのコンソールにエラーがないことを確認
7. `npm run build` でビルドエラーがないことを確認（型エラーの検出）

---

## 次タスク予告

**Phase 4 Task 02: スクロール連動回転**

- `OrbitControls` を `ScrollControls`（drei）に置き換える
- `AGENTS.md` の `clamp → damp` パターンを実装
- スクロール範囲 ±45° に制限
- Lenis でスムーススクロール導入

---

## 補足: useGLTF の型について

`useGLTF` の戻り値 `nodes` は `{ [name: string]: THREE.Object3D }` 型。
メッシュにアクセスするには `THREE.Mesh` にキャストが必要:

```tsx
import * as THREE from "three";
const mesh = nodes["base"] as THREE.Mesh;
// mesh.geometry, mesh.material にアクセスできる
```

または drei の `useGLTF` に型パラメータを渡す方法もある。より良い型付けができるなら提案してください。
