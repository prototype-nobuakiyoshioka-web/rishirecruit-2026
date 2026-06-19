# Phase 4 - Task 02: スクロール連動回転

**目的:** Task 01 で実装した `<OrbitControls>`(マウスでの自由回転)を `<ScrollControls>`(drei)ベースの**スクロール連動回転**に置き換える。スクロール量に応じて島が左右に回転し、回転範囲は ±45° に制限する。Lenis(スムーススクロール)の導入は**次タスクで行う**(本タスクのスコープ外)。

---

## コンテキスト

### 前提環境
- **Task 01 完了済み**: `components/scene/IslandCanvas.tsx`, `components/scene/IslandModel.tsx` が存在
- GLB(`public/models/rishiri-prototype1.glb`)が表示され、`<OrbitControls>` でマウス操作可能な状態
- `three`, `@react-three/fiber`, `@react-three/drei` が導入済み(drei は `10.3.0`、Task 01 のバージョン読み替えルール参照)

### 必ず参照すべきドキュメント
- **`AGENTS.md` の「重要な実装パターン」セクション** ← `clamp → damp` の参照コードがそのまま使える
- `docs/01-requirements.md`(カメラ仕様: スクロール連動・範囲制限 ±45° の根拠)

### AGENTS.md に記載済みの確定仕様(再掲・厳守)

| 項目 | 決定 |
|---|---|
| カメラ | スクロール連動回転 + 範囲制限(左右45°) | 操作迷子防止 + 裏面モデリング省略 |

```ts
// AGENTS.md に記載済みのパターン(これに従う)
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

**順序を間違えるとカクつく**: 必ず `clamp` → `damp` の順(AGENTS.md にも明記済み)。

---

## やってほしいこと

### 1. `IslandCanvas.tsx` の更新

**変更内容:**
- `<OrbitControls>` を削除
- 代わりに drei の `<ScrollControls>` で `<IslandModel>` を囲む
- `pages` prop でスクロール可能な範囲(ページ数)を設定する。初期値は `pages={3}` 程度(島を眺める時間を確保、後で調整可能)
- `damping` prop は `ScrollControls` 自体には設定せず、回転の damp は `IslandModel` 側の `useFrame` で行う(下記参照)

**参照モード**(このとおりでなくてOK、より良いパターンがあれば提案してください):

```tsx
"use client";
import { Canvas } from "@react-three/fiber";
import { ScrollControls, Suspense } from "@react-three/drei";
import { IslandModel } from "./IslandModel";

export function IslandCanvas() {
  return (
    <Canvas camera={{ position: [0, 5, 15], fov: 45 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <ScrollControls pages={3} damping={0}>
        <Suspense fallback={null}>
          <IslandModel />
        </Suspense>
      </ScrollControls>
    </Canvas>
  );
}
```

`damping={0}` を `ScrollControls` 自体に指定する理由: スクロール位置の damping と、回転の damping(`useFrame` 内で行う)を二重にかけると、動きが不自然に鈍くなるため。`ScrollControls` 側はナマの scroll.offset を渡し、回転側だけで damp する設計にする。

(この判断が適切かどうか、より良い設計があれば提案してください)

### 2. `IslandModel.tsx` の更新

**変更内容:**
- `useScroll`(drei)で現在のスクロール位置(`scroll.offset`、0〜1の範囲)を取得
- `useFrame` 内で AGENTS.md の `clamp → damp` パターンを実装
- 回転対象は **モデル全体を囲む `<group>` の `rotation.y`**(個別メッシュではなく、ルートグループに回転をかける)
- 回転角度の最大値は `Math.PI / 4`(±45°)を定数として定義

**参照モード**(このとおりでなくてOK、より良いパターンがあれば提案してください):

```tsx
"use client";
import { useGLTF, useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const MAX_ROTATION = Math.PI / 4; // ±45°
const DAMP_SPEED = 4;

export function IslandModel() {
  const { nodes } = useGLTF("/models/rishiri-prototype1.glb") as unknown as RishiriGLTF;
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    const target = THREE.MathUtils.clamp(
      (scroll.offset - 0.5) * 2 * MAX_ROTATION,
      -MAX_ROTATION,
      MAX_ROTATION
    );
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      target,
      DAMP_SPEED,
      dt
    );
  });

  return (
    <group ref={groupRef}>
      {/* 既存の4メッシュ(base / 海面 / peak / mid)をそのまま維持 */}
    </group>
  );
}

useGLTF.preload("/models/rishiri-prototype1.glb");
```

Task 01 で実装済みの型定義(`RishiriGLTF` 等)・メッシュ参照ロジックは**そのまま維持**し、回転制御の追加のみ行う。

### 3. スクロール可能領域の確保

`<ScrollControls>` はスクロール量を生成するために、ページの高さを必要とする。現在の `app/page.tsx` の Canvas 親要素が `h-screen`(100vh)のみだと、スクロールが発生しない可能性がある。

`ScrollControls` の `pages` prop が内部的にスクロール領域を生成する(drei の仕様)ため、**`app/page.tsx` 側の追加のCSS変更は不要な想定**。ただし実装後に実際にスクロールバーが機能するか確認すること。

---

## 成果物

```
components/
└── scene/
    ├── IslandCanvas.tsx   (更新: OrbitControls → ScrollControls)
    └── IslandModel.tsx    (更新: useFrame での回転制御を追加)
app/
└── page.tsx               (変更不要の想定、必要なら最小限の調整)
```

---

## 制約・前提

- `AGENTS.md` の `clamp → damp` パターンを**そのまま踏襲**する(独自の補間方法を考案しない)
- `useFrame` 内でオブジェクト・配列の新規生成をしない(AGENTS.md のルール、`THREE.MathUtils.clamp/damp` は数値を返すだけなので問題ない)
- TypeScript の型エラーを出さない(`any` 禁止)
- Task 01 で確立した GLB 読み込みロジック・型キャストは変更しない(回転制御の追加のみ)
- **Lenis の導入はしない**(次タスクのスコープ)

---

## やってはいけないこと

- ❌ **Lenis パッケージの追加**(次タスクで実施、本タスクではスクロール量を `ScrollControls` のネイティブ実装のみで取得する)
- ❌ **`clamp → damp` 以外の補間方式を独自に考案する**(AGENTS.md のパターンを厳守)
- ❌ **個別メッシュ(`base`, `peak`, `mid`, `海面`)に個別の回転をかける**(回転は親 `<group>` に一括でかける、4メッシュが島として一体で回転する必要がある)
- ❌ **`OrbitControls` を残したまま `ScrollControls` を追加する**(両方が同時に有効だと、カメラ操作が二重に競合する。完全に置き換える)
- ❌ **`useFrame` 内で `new THREE.Vector3()` 等のオブジェクトを毎フレーム生成する**
- ❌ **GLB ノード名(`base` / `海面` / `peak` / `mid`)の変更**
- ❌ **WordPress 側ファイルへの変更**

---

## Git 運用ルール

コミットメッセージ例:
- `Phase 4 Task 02: IslandCanvas.tsx - OrbitControls を ScrollControls に置き換え`
- `Phase 4 Task 02: IslandModel.tsx - clamp/damp パターンでスクロール連動回転を実装`

バージョン読み替えが発生した場合は AGENTS.md の「バージョン指定の読み替えルール」に従い、コミットメッセージに理由を明記。

---

## レビュー基準(Claude Code レビュー用チェックリスト)

### ファイル構造
- [ ] `IslandCanvas.tsx` から `OrbitControls` の import・使用が削除されているか
- [ ] `IslandCanvas.tsx` に `ScrollControls` が追加されているか
- [ ] `IslandModel.tsx` に `useScroll`, `useFrame` が追加されているか
- [ ] WordPress 側ファイルが変更されていないか

### 回転ロジック(最重要)
- [ ] 回転角度の最大値が `Math.PI / 4`(±45°)として定数定義されているか
- [ ] `THREE.MathUtils.clamp` が **先に**(target 計算時に)使われているか
- [ ] `THREE.MathUtils.damp` が **後に**(rotation.y への適用時に)使われているか
- [ ] clamp と damp の順序が AGENTS.md のパターンと一致しているか(逆順だとカクつくバグになる)
- [ ] 回転が親 `<group>` の `rotation.y` に対して行われているか(個別メッシュへの回転ではない)
- [ ] `scroll.offset` が 0〜1 の範囲から `-MAX〜+MAX` に正しくマッピングされているか(`(scroll.offset - 0.5) * 2 * MAX` の数式が AGENTS.md と一致)

### R3F 規約
- [ ] `useFrame` 内で新規オブジェクト生成がないか(`new THREE.Vector3()` 等)
- [ ] `groupRef.current` の null チェックがあるか
- [ ] `"use client"` が両ファイルの先頭にあるか

### スコープ境界
- [ ] Lenis パッケージが追加されていないか(`package.json` に `lenis` 等が含まれていないこと)
- [ ] `OrbitControls` と `ScrollControls` が同時に有効になっていないか
- [ ] GLB のノード名・メッシュ構成が Task 01 から変更されていないか

### コード品質
- [ ] TypeScript の型エラーがないか(`any` 未使用)
- [ ] Task 01 の型キャストロジック(`RishiriGLTF` 等)が維持されているか

---

## 完了後の確認手順

1. `npm run dev` を起動
2. `http://localhost:3000` をブラウザで開く
3. ページをスクロールすると、島が左右に回転することを確認
4. スクロールを最上部・最下部まで動かしても、回転角度が ±45° を超えないことを確認(目視で島の側面が見えすぎないか確認)
5. スクロールを止めた時、回転がスッと滑らかに目標角度へ収束すること(damp の効果)を確認 — カクつきがあれば clamp/damp の順序を疑う
6. マウスドラッグで島を回転**できない**ことを確認(OrbitControls が正しく削除されているか)
7. ブラウザの開発者ツールのコンソールにエラーがないことを確認
8. `npm run build` でビルドエラーがないことを確認

---

## 次タスク予告

**Phase 4 Task 03: Lenis 導入によるスムーススクロール**

- `lenis` パッケージ導入
- R3F の `useFrame` ループと Lenis の `raf` を同期させる実装(`ScrollControls` との連携に注意が必要)
- AGENTS.md の「よくあるエラーと初手対応」に記載の「Lenis と native scroll の干渉」に注意して実装する

---

## 補足: `ScrollControls` の `pages` prop について

`pages={3}` は暫定値。実際のサイト設計(ヒーロー領域の高さ、その後のコンテンツとの兼ね合い)によって調整が必要になる。本タスクでは**動作確認できる値であればOK**とし、最終調整は Phase 6(ピン・コンテンツ実装)以降で行う。
