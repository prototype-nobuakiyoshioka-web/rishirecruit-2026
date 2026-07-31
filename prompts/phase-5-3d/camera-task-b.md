# Camera Task B: 背景をCSS → Three.js に移行

**目的:** 現在CSSグラデーションで実装している空・水平線・海の背景を、Three.js(R3F)の3Dオブジェクトに置き換える。これにより島の回転・スクロールと背景が同じ座標空間に存在し、自然な見た目になる。

---

## 現状

- `app/page.tsx` または `globals.css` でCSSグラデーションの背景を設定している
- 水平線が画面上に固定された直線になっており、島が回転してもズレない

## やってほしいこと

### 1. CSSグラデーション背景を削除

`app/page.tsx` の `<main>` の background スタイルを削除し、背景色を透明または `#000` にする。

```tsx
// 変更前(例)
<main style={{ background: 'linear-gradient(...)' }}>

// 変更後
<main style={{ width: '100vw', height: '100vh', background: '#000' }}>
```

### 2. `components/scene/Background.tsx` を新規作成

R3F Canvas 内に空・海を描画するコンポーネント。

```tsx
"use client";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export function Background() {
  const { scene } = useThree();

  // 空の色(上部)
  const skyColor = new THREE.Color("#87CEEB");
  // 海の色(下部)
  const seaColor = new THREE.Color("#0A2E4E");

  // シーン背景をグラデーションで設定
  // Three.js の標準機能でグラデーション背景を実現
  scene.background = new THREE.Color("#87CEEB"); // 暫定、後でグラデーション化

  return (
    <>
      {/* 海面の平面メッシュ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#0A2E4E" />
      </mesh>
    </>
  );
}
```

**実装方針:**
- `scene.background` で空の色を設定
- 海面は大きな平面メッシュ(`planeGeometry`)で表現
- 水平線はカメラアングルと3Dオブジェクトの位置関係で自然に生まれる

### 3. `IslandCanvas.tsx` に Background を追加

```tsx
import { Background } from "./Background";

// ScrollControls の外側に配置(背景はスクロールに連動しない)
<Canvas camera={{ position: [-6, 6, 12], fov: 55 }}>
  <Background />
  <ambientLight intensity={0.6} />
  <directionalLight position={[10, 10, 5]} intensity={1} />
  <ScrollControls pages={3} damping={0}>
    <Suspense fallback={null}>
      <IslandModel>
        {SHOW_PINS && <PinLayer pins={pins} onSelect={setSelectedPin} />}
      </IslandModel>
    </Suspense>
  </ScrollControls>
</Canvas>
```

---

## 成果物

```
components/
└── scene/
    └── Background.tsx    (新規)
app/
└── page.tsx              (更新: CSSグラデーション背景を削除)
components/scene/
└── IslandCanvas.tsx      (更新: Background を追加)
```

---

## 制約

- `Background.tsx` と `IslandCanvas.tsx` と `app/page.tsx` のみ変更
- IslandModel.tsx・PinLayer.tsx・Header.tsx・Footer.tsx は変更しない
- 海面の平面は島より大きくする(200×200程度)
- TypeScript の型エラーを出さない
- WordPress側ファイルへの変更は行わない

---

## 完了後の確認

1. `npm run dev` で表示確認
2. 背景が3D空間に統合されて見えるか
3. スクロールで島が回転した時、水平線が自然に傾くか
4. 空と海のコントラストが出ているか
5. スクリーンショットを報告

---

## Git コミットメッセージ例

`Camera Task B: 背景をCSSグラデーションからThree.js 3Dオブジェクトに移行`
