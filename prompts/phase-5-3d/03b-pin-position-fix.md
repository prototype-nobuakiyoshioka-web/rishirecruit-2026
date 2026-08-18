# Phase 5 Task 03b: エリアピンの位置・サイズ修正

## 問題

エリアピンが画面上部に巨大に表示されている。
原因は2つ考えられる:

1. AREA_POSITIONS の座標が島の実スケールと合っていない
2. PinLayer が IslandModel の group 内にあるため、
   island の scale={[3,3,3]} の影響を受けてピンも3倍になっている

## 修正

### 修正1: ピンのサイズを island の scale で割る

IslandModel の group が scale={[3,3,3]} なので、
その中の PinLayer も3倍に拡大されている。

components/scene/Pin.tsx の ringGeometry のサイズを
1/3 程度に小さくする:

// 変更前
<ringGeometry args={isActive ? [0.35, 0.5, 32] : [0.2, 0.3, 32]} />

// 変更後
<ringGeometry args={isActive ? [0.10, 0.15, 32] : [0.06, 0.09, 32]} />

### 修正2: AREA_POSITIONS の座標を島のローカル座標に合わせる

lib/three/pin-positions.ts を以下に変更:

export const AREA_POSITIONS: Record<string, { x: number; y: number; z: number }> = {
  oshidomari: { x: -1.5, y: 1.2, z: -1.5 },  // 鴛泊エリア(北西側)
  oniwaki:    { x:  1.5, y: 1.0, z:  1.5 },  // 鬼脇エリア(南東側)
};

【重要】
これらの座標は IslandModel の group 内のローカル座標です。
group には position={[-4, 1, 0]} と scale={[3,3,3]} が
適用されているため、実際の見た目の位置は
(座標 × 3) + [-4, 1, 0] になります。

### 確認手順

1. npm run dev で表示確認
2. ピンが島の上に小さく2つ表示されるか
3. 画面外や巨大表示になっていないか
4. スクリーンショットを報告

### 制約

- Pin.tsx と pin-positions.ts のみ変更
- IslandModel.tsx の position / scale は変更しない
- 座標は暫定値のため、目視確認後にさらに調整する
