# Phase 5 Task 06b: エリアピンとスクロール量の修正

## 修正1: ピンのアクティブ判定が逆になっている

### 問題

スクロール前半(鴛泊表示中)に鬼脇のピンが大きくなり、
スクロール後半(鬼脇表示中)に鴛泊のピンが大きくなっている。

### 原因の可能性

以下のいずれかを確認して修正してください:

1. lib/three/pin-positions.ts の座標が逆
   → oshidomari と oniwaki の座標が入れ替わっている可能性

2. PinLayer.tsx の AREAS 配列の順序と
   isActive の比較ロジックが噛み合っていない

3. IslandModel.tsx のエリア判定条件が逆
   → scroll.offset < 0.5 の条件が反転している可能性

### 確認方法

一時的に以下のログを追加して、実際の値を確認してください:

```ts
// IslandModel.tsx の useFrame 内
console.log('scroll.offset:', scroll.offset, 'area:', nextArea);

// PinLayer.tsx 内
console.log('activeAreaSlug:', activeAreaSlug);
```

期待する動作:
- scroll.offset < 0.5 → activeAreaSlug = "oshidomari"
- scroll.offset >= 0.5 → activeAreaSlug = "oniwaki"

そして「鴛泊」のピン(AREA_POSITIONS.oshidomari の位置)が
大きくなること。

原因を特定して修正し、確認後にログは削除してください。

## 修正2: スクロール量を増やし、回転量を減らす

### 目標

- スクロールできる距離を長くする(ゆっくり体験できる)
- 同じスクロール量あたりの島の回転を少なくする(なめらかに)

### 変更2-1: ScrollControls の pages を増やす

components/scene/IslandCanvas.tsx:

```tsx
// 変更前
<ScrollControls pages={3} damping={0}>

// 変更後
<ScrollControls pages={6} damping={0}>
```

pages を増やすとスクロール可能な距離が伸びる。

### 変更2-2: 回転の最大角度を確認・調整

components/scene/IslandModel.tsx の回転ロジックで、
scroll.offset から回転角度を計算している箇所を確認してください。

現在おそらく以下のような形になっているはずです:

```ts
const target = clamp(scroll.offset * SOME_FACTOR, -MAX_ROTATION, MAX_ROTATION);
```

pages を 3 → 6 に増やしたことで scroll.offset の
進み方が半分になるため、同じ計算式のままだと
最大までスクロールしても回転が半分しか進まなくなります。

回転が ±45度(MAX_ROTATION)まで到達するよう、
係数を調整してください。

例:
```ts
// pages=3 のとき offset*2 で MAX に到達していた場合
// pages=6 では offset*4 にする、など
```

実際の計算式を確認した上で、
「スクロール最下部で回転が MAX_ROTATION に到達する」
ように調整してください。

### 変更2-3: エリア切替の閾値を確認

pages を変えても、エリア切替は scroll.offset の
0.5(全体の50%)で行う仕様は変わりません。
IslandModel.tsx の以下の条件はそのままで問題ありません:

```ts
const nextArea = scroll.offset < 0.5 ? "oshidomari" : "oniwaki";
```

### 変更2-4: フッターのフェードイン閾値を確認

Phase 4 Task 07 で実装した FOOTER_REVEAL_SCROLL_OFFSET = 0.95 も
scroll.offset ベースなので変更不要ですが、
pages が増えたことでフッターが出るまでの
物理的なスクロール量が増えます。

体感が長すぎる場合は 0.95 → 0.90 程度に
調整することを検討してください(任意)。

## 制約

- clamp → damp のロジック構造自体は維持する(係数のみ調整)
- Background.tsx, AreaInfoPanel.tsx, AreaPostSlider.tsx は変更しない
- WordPress側ファイルへの変更は行わない

## 確認手順

1. npm run dev で表示確認
2. **鴛泊表示中に鴛泊のピンが大きくなっているか**(修正1)
3. スクロール後半で鬼脇のピンが大きくなるか
4. スクロールできる距離が以前より長くなっているか
5. 島の回転がゆるやかになっているか
6. スクロール最下部で回転が最大(±45度)に到達しているか
7. フッターが最下部で表示されるか
8. スクリーンショットを2枚(鴛泊時・鬼脇時)報告
