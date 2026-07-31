# Camera Task C: 3D海面 + フェードシェーダーによる背景再構築

**目的:** CSSグラデーション背景のアプローチを廃止し、3D空間内に海面メッシュを配置して自然な水平線を再現する。海面は回転せず固定、島だけが回転する構成にする。

---

## これまでの経緯(重要)

以下のアプローチを試したが、いずれも理想に届かなかった:

| 試したこと | 結果 |
|---|---|
| CSSグラデーション背景 | 画面座標固定で3D空間と連動しない |
| `transform: rotate()` で背景を傾ける | 画面全体が回転して端が見切れる |
| 海面メッシュを IslandModel 内に配置 | 島と一緒に回転して水平線が傾きすぎる |
| ShaderMaterial で海面をフェード | ぼかしすぎて海面が消えた |

**今回のアプローチ:** 海面を ScrollControls の**外側**(回転しない場所)に配置し、遠方に向かってフェードするシェーダーを適用する。

---

## 目標イメージ

利尻島の航空写真のような、以下の特徴を持つ背景:
- 空: 鮮やかな青
- 水平線付近: 白っぽく霞む(大気遠近法)
- 海: 手前は濃紺、遠方に向かって明るく霞む
- 水平線は常に水平(島が回転しても傾かない)

---

## やってほしいこと

### 1. `app/page.tsx` のCSS背景を削除

```tsx
// 変更前(CSSグラデーション)
<main style={{ background: 'linear-gradient(...)', ... }}>

// 変更後(背景なし)
<main style={{ width: '100vw', height: '100vh' }}>
```

`RotatingBackground.tsx` を作成していた場合は削除する。

### 2. `components/scene/Background.tsx` を全面書き直し

**責務:** 空の色設定 + 海面メッシュ(フェードシェーダー付き)

```tsx
"use client";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMemo } from "react";

export function Background() {
  const { scene } = useThree();

  // 空の色(鮮やかな青)
  scene.background = new THREE.Color("#4FA8D5");

  // 海面のシェーダーマテリアル
  const seaMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        uNearColor: { value: new THREE.Color("#0A2E4E") },  // 手前の濃紺
        uFarColor:  { value: new THREE.Color("#8FCFE8") },  // 遠方の霞み色
        uFadeStart: { value: 60.0 },   // フェード開始距離
        uFadeEnd:   { value: 180.0 },  // フェード終了距離
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uNearColor;
        uniform vec3 uFarColor;
        uniform float uFadeStart;
        uniform float uFadeEnd;
        varying vec3 vWorldPosition;

        void main() {
          // カメラからの距離を計算
          float dist = length(vWorldPosition - cameraPosition);
          // 距離に応じて色を補間(遠いほど霞む)
          float t = smoothstep(uFadeStart, uFadeEnd, dist);
          vec3 color = mix(uNearColor, uFarColor, t);
          // 遠方ほど透明にして空に溶け込ませる
          float alpha = 1.0 - smoothstep(uFadeStart * 1.5, uFadeEnd, dist);
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
  }, []);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -3, 0]}
      material={seaMaterial}
    >
      <planeGeometry args={[400, 400]} />
    </mesh>
  );
}
```

**シェーダーの仕組み:**
- カメラからの距離(`dist`)を計算
- 近い部分は濃紺、遠い部分は霞み色に補間
- さらに遠方は透明度を上げて空(scene.background)に溶け込ませる
- これにより水平線付近が自然にぼやける

### 3. `IslandModel.tsx` から海面メッシュを削除

前回追加した海面メッシュ(`<mesh>` 部分)を削除し、島メッシュのみに戻す。

```tsx
<group ref={groupRef} position={[-4, 1, 0]} scale={[3, 3, 3]}>
  <primitive object={nodes["平面"] as THREE.Mesh} />
  {children}
</group>
```

### 4. `IslandCanvas.tsx` で Background を ScrollControls の外に配置

```tsx
<Canvas camera={{ position: [-6, 5, 12], fov: 55 }}>
  <Background />  {/* ScrollControls の外(回転しない) */}
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

### 5. `scroll-progress-store.ts` の rotationAngle は残す

フッターのフェード制御で `isRotationComplete` を使っているため、ストア自体は変更しない。`rotationAngle` は今回使わないが、将来使う可能性があるため残しておく。

---

## 調整パラメータ(目視確認後に調整する項目)

| パラメータ | 初期値 | 調整の意味 |
|---|---|---|
| `uFadeStart` | 60.0 | 小さくすると近くから霞み始める |
| `uFadeEnd` | 180.0 | 大きくすると霞みの範囲が広がる |
| 海面 `position` の y | -3 | 水平線の高さ |
| `planeGeometry` のサイズ | 400 | 大きいほど遠方まで海が続く |
| `uFarColor` | #8FCFE8 | 水平線付近の霞み色 |

---

## 成果物

```
components/scene/
├── Background.tsx      (全面書き直し)
├── IslandModel.tsx     (海面メッシュを削除)
└── IslandCanvas.tsx     (Background の配置確認)
app/
└── page.tsx             (CSS背景を削除)
```

削除するファイル(存在する場合):
- `components/scene/RotatingBackground.tsx`

---

## 制約

- ScrollControls の**外側**に Background を配置すること(最重要)
- IslandModel 内に海面メッシュを入れないこと
- `scroll-progress-store.ts` は変更しない(フッターフェードが壊れる)
- TypeScript の型エラーを出さない
- WordPress側ファイルへの変更は行わない

---

## 完了後の確認

1. `npm run dev` で表示確認
2. **水平線が水平に保たれているか**(島が回転しても傾かない)
3. 水平線付近が自然に霞んでいるか
4. スクロールで島が回転するか
5. フッターがスクロール最下部で表示されるか
6. スクリーンショットを報告

---

## Git コミットメッセージ例

`Camera Task C: 背景を3D海面+フェードシェーダーに再構築`
