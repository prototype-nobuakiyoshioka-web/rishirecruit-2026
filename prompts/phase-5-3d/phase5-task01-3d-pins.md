# Phase 5 - Task 01: 3Dピン実装

**目的:** トップページ(`/`)の3Dマップ上に、求人・観光地・イベントの3種類のピンを配置する。WPGraphQLから取得した実データと `PIN_POSITIONS` テーブルを照合してピンの3D座標を決定し、ピンクリックで各コンテンツのプレビューモーダルを表示する。

---

## コンテキスト

### 前提環境
- **Phase 4 Task 01-02 完了済み**: `IslandCanvas.tsx`, `IslandModel.tsx` で3D島・スクロール連動回転が実装済み
- **Phase 4 Task 13-14 完了済み**: WPGraphQLから実データ取得済み(`lib/wp/queries/`)
- ピンの色はCSS変数で定義済み(`--c-pin-job: #FF7B5B`, `--c-pin-spot: #F4B942`, `--c-pin-event: #FF8FB1`)

### 必ず参照すべきドキュメント
- **`docs/03-content-schema.md` §2.4(PIN_POSITIONSテーブル)・§2.5(CPTごとのピン参照方式)**
- **`docs/04-design-tokens.md` §7(ピン色の割り当て)**
- **`AGENTS.md`** の「重要な実装パターン」・「やってはいけないこと(Phase 4-5固有)」・「新しいピン種別を追加する」タスク手順

### ピンの仕様(`docs/04-design-tokens.md` §7より)

| CPT | ピン色 | Hex | 参照方式 |
|---|---|---|---|
| job_posting | 夕陽コーラル | `#FF7B5B` | `pin_location` select値 → PIN_POSITIONS |
| touristspot | 昆布の金 | `#F4B942` | WP slug → PIN_POSITIONS |
| event | 桜貝ピンク | `#FF8FB1` | `pin_reference` text値 → PIN_POSITIONS |

### PIN_POSITIONSの現状(`docs/03-content-schema.md` §2.4より)

現在すべての座標が `{ x: 0, y: 0.5, z: 0 }` の初期値。本タスクで実際の利尻島の地形に合わせた座標に更新する(後述)。

### R3F の重要な制約(AGENTS.md より)

- **`"use client"` を Canvas 関連コンポーネントすべての先頭に書く**
- **`useFrame` 内でオブジェクト・配列の新規生成をしない**
- Canvasの子コンポーネントは Drei の `<Suspense>` で囲む

---

## やってほしいこと

### 1. `lib/three/pin-positions.ts` の新規作成

**責務:** 全ピンの3D座標を一元管理するシングルソース。

```ts
// lib/three/pin-positions.ts

export const PIN_POSITIONS: Record<string, { x: number; y: number; z: number }> = {
  // job_posting クラスタピン(pin_location selectの値と対応)
  town_hall:     { x: -0.3, y: 0.1, z: -0.2 },  // 役場本庁舎(鴛泊地区)
  health_center: { x: -0.2, y: 0.1, z: -0.1 },  // 保健センター(鴛泊地区)
  airport:       { x:  0.5, y: 0.1, z: -0.3 },  // 利尻空港(東側)
  oniwaki:       { x:  0.2, y: 0.1, z:  0.4 },  // 鬼脇地区(南側)

  // touristspot ピン(WP slugと対応)
  himenuma:        { x: -0.1, y: 0.2, z: -0.5 }, // 姫沼(北側)
  peshi_misaki:    { x: -0.6, y: 0.1, z: -0.1 }, // ペシ岬(西側)
  otatomari_numa:  { x:  0.3, y: 0.1, z:  0.5 }, // オタトマリ沼(南東)

  // event専用ピン(必要に応じて追加)
  rishirisan_opening: { x: 0, y: 0.8, z: 0 },    // 利尻山開きまつり(山頂付近)
};
```

**座標の考え方:**
- x: 東西方向(-がWest/鴛泊側、+がEast)
- y: 高さ(0=島の麓、1=山頂付近)
- z: 南北方向(-がNorth/鴛泊側、+がSouth/鬼脇側)

**注意:** 上記座標は暫定値。実際の3Dモデルに合わせて目視で調整が必要。本タスクでは「とりあえずピンが表示される」状態を作ることを優先し、座標の微調整は別途行う。

### 2. WPGraphQLからピンデータを取得する関数

**新規ファイル:** `lib/wp/queries/pins.ts`

```ts
import { wpClient } from '../client';
import { gql } from 'graphql-request';

// ピン表示に必要な最小限のフィールドのみ取得
const GET_PIN_DATA = gql`
  query GetPinData {
    jobPostings(first: 100, where: { status: PUBLISH }) {
      nodes {
        id
        slug
        title
        jobPostingFields {
          pinLocation
          employmentType
          salary
          catchCopy
          thumbnailImage { node { sourceUrl altText } }
        }
      }
    }
    touristspots(first: 100, where: { status: PUBLISH }) {
      nodes {
        id
        slug
        title
        touristspotFields {
          category
          catchCopy
          thumbnailImage { node { sourceUrl altText } }
        }
      }
    }
    events(first: 100, where: { status: PUBLISH }) {
      nodes {
        id
        slug
        title
        eventFields {
          pinReference
          startDatetime
          catchCopy
          thumbnailImage { node { sourceUrl altText } }
        }
      }
    }
  }
`;

export interface PinItem {
  id: string;
  slug: string;
  title: string;
  type: 'job' | 'spot' | 'event';
  positionKey: string;     // PIN_POSITIONSのキー
  catchCopy: string | null;
  thumbnailUrl: string | null;
  // type別の追加情報
  employmentType?: string | null;
  salary?: string | null;
  category?: string | null;
  startDatetime?: string | null;
}

export async function getPinData(): Promise<PinItem[]> {
  try {
    const data = await wpClient.request<any>(GET_PIN_DATA);
    const pins: PinItem[] = [];

    // job_posting: pin_location[0] がキー
    for (const job of data.jobPostings?.nodes ?? []) {
      const key = job.jobPostingFields?.pinLocation?.[0];
      if (!key) continue;
      pins.push({
        id: job.id,
        slug: job.slug,
        title: job.title,
        type: 'job',
        positionKey: key,
        catchCopy: job.jobPostingFields?.catchCopy ?? null,
        thumbnailUrl: job.jobPostingFields?.thumbnailImage?.node?.sourceUrl ?? null,
        employmentType: job.jobPostingFields?.employmentType?.[0] ?? null,
        salary: job.jobPostingFields?.salary ?? null,
      });
    }

    // touristspot: slug がキー
    for (const spot of data.touristspots?.nodes ?? []) {
      if (!spot.slug) continue;
      pins.push({
        id: spot.id,
        slug: spot.slug,
        title: spot.title,
        type: 'spot',
        positionKey: spot.slug,
        catchCopy: spot.touristspotFields?.catchCopy ?? null,
        thumbnailUrl: spot.touristspotFields?.thumbnailImage?.node?.sourceUrl ?? null,
        category: spot.touristspotFields?.category?.[0] ?? null,
      });
    }

    // event: pin_reference がキー
    for (const event of data.events?.nodes ?? []) {
      const key = event.eventFields?.pinReference;
      if (!key) continue;
      pins.push({
        id: event.id,
        slug: event.slug,
        title: event.title,
        type: 'event',
        positionKey: key,
        catchCopy: event.eventFields?.catchCopy ?? null,
        thumbnailUrl: event.eventFields?.thumbnailImage?.node?.sourceUrl ?? null,
        startDatetime: event.eventFields?.startDatetime ?? null,
      });
    }

    return pins;
  } catch (error) {
    console.error('Failed to fetch pin data:', error);
    return [];
  }
}
```

### 3. `components/scene/Pin.tsx` の新規作成

**責務:** 3D空間に表示される1つのピン。クリックで選択状態になる。

実装内容:
- `"use client"` 必須
- ティアドロップ型(逆三角形+円)の形状を `THREE.Shape` で作成するか、`CylinderGeometry` + `SphereGeometry` を組み合わせてシンプルに表現(AGENTS.md: `CapsuleGeometry`は使わないこと)
- ピンの色は `type`('job'/'spot'/'event')に応じて `--c-pin-job`, `--c-pin-spot`, `--c-pin-event` を使う
- カメラに常に正面を向く(**Billboard処理**: `useFrame` 内で `pin.quaternion.copy(camera.quaternion)`)
- ホバー時に白フチ(2px相当)を表示(視認性確保)
- クリック時に `onSelect` コールバックを呼ぶ

**参照モード**(このとおりでなくてOK、より良いパターンがあれば提案してください):

```tsx
"use client";
import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { PinItem } from "@/lib/wp/queries/pins";

const PIN_COLORS = {
  job:   '#FF7B5B',
  spot:  '#F4B942',
  event: '#FF8FB1',
} as const;

interface PinProps {
  pin: PinItem;
  position: [number, number, number];
  onSelect: (pin: PinItem) => void;
}

export function Pin({ pin, position, onSelect }: PinProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  // Billboard: カメラに常に正面を向く
  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.quaternion.copy(camera.quaternion);
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={() => onSelect(pin)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshStandardMaterial
        color={PIN_COLORS[pin.type]}
        emissive={hovered ? '#ffffff' : '#000000'}
        emissiveIntensity={hovered ? 0.3 : 0}
      />
    </mesh>
  );
}
```

ピンの形状は上記のシンプルな球でよい(後でデザインを改善できる)。まず「ピンが3D空間に表示されてクリックできる」状態を作ることを優先する。

### 4. `components/scene/PinLayer.tsx` の新規作成

**責務:** 全ピンをまとめて表示するレイヤーコンポーネント。データ取得と PIN_POSITIONS の照合を担当する。

```tsx
"use client";
import { Pin } from "./Pin";
import { PIN_POSITIONS } from "@/lib/three/pin-positions";
import type { PinItem } from "@/lib/wp/queries/pins";

interface PinLayerProps {
  pins: PinItem[];
  onSelect: (pin: PinItem) => void;
}

export function PinLayer({ pins, onSelect }: PinLayerProps) {
  return (
    <group>
      {pins.map((pin) => {
        const pos = PIN_POSITIONS[pin.positionKey];
        if (!pos) return null; // PIN_POSITIONSに座標がない場合はスキップ

        return (
          <Pin
            key={pin.id}
            pin={pin}
            position={[pos.x, pos.y, pos.z]}
            onSelect={onSelect}
          />
        );
      })}
    </group>
  );
}
```

### 5. `IslandCanvas.tsx` の更新

`PinLayer` を Canvas 内に追加し、選択されたピンの状態を管理する。

```tsx
"use client";
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollControls, Suspense } from "@react-three/drei";
import { IslandModel } from "./IslandModel";
import { PinLayer } from "./PinLayer";
import type { PinItem } from "@/lib/wp/queries/pins";

interface IslandCanvasProps {
  pins: PinItem[];  // サーバーコンポーネントから渡す
}

export function IslandCanvas({ pins }: IslandCanvasProps) {
  const [selectedPin, setSelectedPin] = useState<PinItem | null>(null);

  return (
    <>
      <Canvas camera={{ position: [0, 5, 15], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <ScrollControls pages={3} damping={0}>
          <Suspense fallback={null}>
            <IslandModel />
            <PinLayer pins={pins} onSelect={setSelectedPin} />
          </Suspense>
        </ScrollControls>
      </Canvas>

      {/* ピン選択時のモーダルは次タスクで実装(今回は console.log のみ) */}
      {selectedPin && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: 'white', padding: 16 }}>
          <p>{selectedPin.title}</p>
          <button onClick={() => setSelectedPin(null)}>閉じる</button>
        </div>
      )}
    </>
  );
}
```

### 6. `app/page.tsx` の更新

サーバーコンポーネントでピンデータを取得して `IslandCanvas` に渡す。

```tsx
import { IslandCanvas } from "@/components/scene/IslandCanvas";
import { getPinData } from "@/lib/wp/queries/pins";

export default async function Home() {
  const pins = await getPinData();

  return (
    <main style={{ width: '100vw', height: '100vh', background: 'var(--c-deep-ocean)' }}>
      <IslandCanvas pins={pins} />
      {/* ColumnBoard等の既存HUD要素はそのまま維持 */}
    </main>
  );
}
```

---

## 成果物

```
lib/
├── three/
│   └── pin-positions.ts      (新規)
└── wp/
    └── queries/
        └── pins.ts             (新規)
components/
└── scene/
    ├── Pin.tsx                 (新規)
    ├── PinLayer.tsx            (新規)
    └── IslandCanvas.tsx        (更新: PinLayer追加、pins propsを受け取る)
app/
└── page.tsx                    (更新: getPinData()でピンデータ取得)
```

---

## 制約・前提

- `"use client"` を Canvas 関連コンポーネントすべての先頭に書く(AGENTS.md のルール)
- `useFrame` 内でオブジェクト・配列の新規生成をしない(Billboard処理は `camera.quaternion` のコピーのみ)
- `CapsuleGeometry` は使わない(AGENTS.md: r142+の機能のため)
- ピンの座標は暫定値でよい、目視確認後に調整する
- ピンクリック時のモーダル実装は次タスク(Task 02)のスコープ。今回は簡易表示(div)またはコンソールログで確認するだけでよい
- TypeScript の型エラーを出さない(`any` 禁止)
- WordPress側ファイルへの変更は行わない

---

## やってはいけないこと

- ❌ **`CapsuleGeometry` を使う**(r142+の機能、現バージョン非対応)
- ❌ **`useFrame` 内で `new THREE.Vector3()` 等のオブジェクトを毎フレーム生成する**
- ❌ **ピンデータをクライアントサイドでフェッチする**(サーバーコンポーネントで取得して props で渡す設計にする)
- ❌ **PIN_POSITIONSに存在しないキーのピンをエラーにする**(`if (!pos) return null` でスキップ)
- ❌ **今回のタスクでモーダルを本格実装する**(Task 02のスコープ)
- ❌ **WordPress側ファイルへの変更**

---

## Git 運用ルール

コミットメッセージ例:
- `Phase 5 Task 01: lib/three/pin-positions.ts 新規作成`
- `Phase 5 Task 01: lib/wp/queries/pins.ts 新規作成`
- `Phase 5 Task 01: Pin.tsx + PinLayer.tsx 新規作成`
- `Phase 5 Task 01: IslandCanvas.tsx + app/page.tsx にピン統合`

---

## レビュー基準(Claude Code レビュー用チェックリスト)

### ファイル構造
- [ ] `lib/three/pin-positions.ts` が存在するか
- [ ] `lib/wp/queries/pins.ts` が存在するか
- [ ] `components/scene/Pin.tsx`, `PinLayer.tsx` が存在するか
- [ ] `IslandCanvas.tsx` と `app/page.tsx` が更新されているか
- [ ] WordPress側ファイルが変更されていないか

### ピンデータの照合ロジック
- [ ] job_posting: `pinLocation?.[0]` でキーを取得しているか
- [ ] touristspot: `slug` をキーとして使っているか
- [ ] event: `pinReference` をキーとして使っているか
- [ ] PIN_POSITIONSに存在しないキーの場合 `null` を返して表示をスキップしているか

### R3F 規約
- [ ] `"use client"` が Pin.tsx, PinLayer.tsx, IslandCanvas.tsx の先頭にあるか
- [ ] Billboard処理が `useFrame` 内で実装されているか
- [ ] `useFrame` 内でオブジェクト生成がないか
- [ ] `CapsuleGeometry` を使っていないか

### ピンの視覚
- [ ] 3種類のピンが異なる色で表示されるか(job=コーラル/spot=ゴールド/event=ピンク)
- [ ] クリックに反応するか(selectedPinが更新されるか)

### コード品質
- [ ] TypeScript の型エラーがないか
- [ ] `npm run build` が通るか

---

## 完了後の確認手順

1. WordPress ローカル環境が起動していることを確認
2. `npm run dev` を起動
3. `http://localhost:3000` を開き、3D島の上にピンが表示されることを確認
4. 求人ピン(コーラル)・観光地ピン(ゴールド)・イベントピン(ピンク)の3色が確認できること
5. ピンをクリックし、簡易表示(div またはコンソール)でコンテンツ情報が出ることを確認
6. スクロールで島が回転しても、ピンが島と一緒に動くことを確認
7. PIN_POSITIONSに存在しないキーを持つ投稿があっても、エラーにならないことを確認
8. `npm run build` でビルドエラーがないことを確認

---

## 次タスク予告

**Phase 5 Task 02: ピンクリックモーダル実装**

- ピンをクリックした時に表示するプレビューモーダルの本格実装
- 求人: 職種名・雇用形態・給与・「詳細を見る」リンク
- 観光地: スポット名・カテゴリ・キャッチコピー・「詳細を見る」リンク
- イベント: イベント名・開催日・「詳細を見る」リンク
- Zustand で選択状態を管理(AGENTS.md の状態管理設計に従う)
