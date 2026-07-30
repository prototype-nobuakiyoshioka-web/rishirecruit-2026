# Phase 5 - Camera Task A: 島のサイズ・カメラ調整

**目的:** トップページの3D島をより大きく・中央に表示する。カメラの `position` と `fov` の調整のみ行う。他のファイルは変更しない。

---

## 現在の設定

```tsx
<Canvas camera={{ position: [0, 3, 10], fov: 45 }}>
```

## 問題

- 島が画面に対して小さく見える
- 島が左寄り・下寄りに見える

## やってほしいこと

### 1. カメラ設定を以下に変更する

```tsx
<Canvas camera={{ position: [0, 5, 14], fov: 50 }}>
```

**変更の意図:**
- `y: 3 → 5`: 少し上から見下ろす角度に
- `z: 10 → 14`: 距離を伸ばしつつ fov を広げて島全体を収める
- `fov: 45 → 50`: 画角を広げて島を大きく見せる

### 2. IslandModel の position を中央に調整

`IslandModel.tsx` の group の position を確認し、
x方向のオフセットがあれば `[0, 0, 0]` に戻す。

```tsx
// 確認・修正箇所
<group ref={groupRef} position={[0, 0, 0]}>
```

### 3. 確認手順

`npm run dev` 後、以下を目視確認:
- 島が画面中央に近い位置に表示されているか
- 島が前回より大きく見えているか
- スクロールで島が回転する動作が壊れていないか

スクリーンショットを添付して報告してください。

---

## 制約

- **変更するファイルは `IslandCanvas.tsx` と `IslandModel.tsx` のみ**
- カメラ値は上記の通り、1回の試行で確認してから次の調整を行う
- ScrollControls・照明・PinLayer には触れない
- WordPress側ファイルへの変更は行わない

---

## Git コミットメッセージ例

`Camera Task A: カメラ position/fov 調整(島の拡大表示)`
