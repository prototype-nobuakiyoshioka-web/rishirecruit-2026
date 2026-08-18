# Camera Task D: 海面の波アニメーション

**目的:** Task C で実装した3D海面に、頂点シェーダーで波のアニメーションを追加する。大きなうねりと細かいサザ波を重ねてリアルかつポップな海面を表現する。

---

## 前提

- Task C で `components/scene/Background.tsx` に3D海面 + フェードシェーダーが実装済み
- 海面は `ScrollControls` の外側に配置され、回転しない

---

## やってほしいこと

### `Background.tsx` の海面シェーダーに波を追加

**変更ポイント:**
1. `planeGeometry` の分割数を増やす(波を表現するため頂点が必要)
2. `uTime` uniform を追加してアニメーションさせる
3. 頂点シェーダーで大小2種類の波を重ねる
4. `useFrame` で `uTime` を毎フレーム更新

```tsx
"use client";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMemo, useRef } from "react";

export function Background() {
  const { scene } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  scene.background = new THREE.Color("#4FA8D5");

  const seaMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        uTime:      { value: 0 },
        uNearColor: { value: new THREE.Color("#0A2E4E") },
        uFarColor:  { value: new THREE.Color("#8FCFE8") },
        uFadeStart: { value: 60.0 },
        uFadeEnd:   { value: 180.0 },
        // 波のパラメータ
        uBigWaveHeight:    { value: 0.8 },   // 大きなうねりの高さ
        uBigWaveFreq:      { value: 0.08 },  // 大きなうねりの周波数(小さいほど大きな波)
        uBigWaveSpeed:     { value: 0.4 },   // 大きなうねりの速度
        uSmallWaveHeight:  { value: 0.15 },  // 細かいサザ波の高さ
        uSmallWaveFreq:    { value: 0.5 },   // 細かいサザ波の周波数
        uSmallWaveSpeed:   { value: 1.2 },   // 細かいサザ波の速度
      },
      vertexShader: `
        uniform float uTime;
        uniform float uBigWaveHeight;
        uniform float uBigWaveFreq;
        uniform float uBigWaveSpeed;
        uniform float uSmallWaveHeight;
        uniform float uSmallWaveFreq;
        uniform float uSmallWaveSpeed;

        varying vec3 vWorldPosition;
        varying float vWaveHeight;

        void main() {
          vec3 pos = position;

          // 大きなうねり(2方向のsin波を重ねる)
          float bigWave =
            sin(pos.x * uBigWaveFreq + uTime * uBigWaveSpeed) *
            cos(pos.y * uBigWaveFreq * 0.7 + uTime * uBigWaveSpeed * 0.8) *
            uBigWaveHeight;

          // 細かいサザ波(高周波、斜め方向)
          float smallWave =
            sin((pos.x + pos.y) * uSmallWaveFreq + uTime * uSmallWaveSpeed) *
            sin(pos.x * uSmallWaveFreq * 1.3 - uTime * uSmallWaveSpeed * 0.6) *
            uSmallWaveHeight;

          float totalWave = bigWave + smallWave;
          pos.z += totalWave;  // 平面はXY面なのでZ方向に押し出す

          vWaveHeight = totalWave;

          vec4 worldPos = modelMatrix * vec4(pos, 1.0);
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
        varying float vWaveHeight;

        void main() {
          float dist = length(vWorldPosition - cameraPosition);
          float t = smoothstep(uFadeStart, uFadeEnd, dist);
          vec3 color = mix(uNearColor, uFarColor, t);

          // 波の高い部分を少し明るくして立体感を出す
          float highlight = smoothstep(0.0, 1.0, vWaveHeight) * 0.15;
          color += vec3(highlight);

          float alpha = 1.0 - smoothstep(uFadeStart * 1.5, uFadeEnd, dist);
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
  }, []);

  // 毎フレーム uTime を更新して波をアニメーションさせる
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      {/* 分割数を増やして波を表現できるようにする */}
      <planeGeometry args={[400, 400, 128, 128]} />
      <primitive object={seaMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
}
```

**重要な実装ポイント:**
- `planeGeometry` の第3・第4引数(`128, 128`)が頂点の分割数。少ないと波がカクカクしすぎる
- 平面は `rotation={[-Math.PI / 2, 0, 0]}` で寝かせているため、頂点シェーダーでは **Z方向**に押し出す(ワールド空間では上下)
- `useFrame` で `state.clock.elapsedTime` を `uTime` に渡す
- `materialRef` で ShaderMaterial への参照を保持する

---

## 調整パラメータ

目視確認後、以下を調整する:

| パラメータ | 初期値 | 効果 |
|---|---|---|
| `uBigWaveHeight` | 0.8 | 大きなうねりの高さ。大きいほど激しい |
| `uBigWaveFreq` | 0.08 | 小さいほど波長が長い(ゆったり) |
| `uBigWaveSpeed` | 0.4 | 大きいほど速く動く |
| `uSmallWaveHeight` | 0.15 | サザ波の高さ |
| `uSmallWaveFreq` | 0.5 | 大きいほど細かい波 |
| `uSmallWaveSpeed` | 1.2 | サザ波の動く速度 |
| `planeGeometry` の分割数 | 128 | 大きいほど滑らか(負荷増) |

---

## パフォーマンス上の注意

- `128 × 128` = 約16,000頂点。モバイルで重い場合は `64, 64` に下げる
- `useFrame` 内では uniform の値更新のみ行い、オブジェクト生成をしない(AGENTS.md のルール)

---

## 制約

- `Background.tsx` のみ変更する
- `IslandModel.tsx`, `IslandCanvas.tsx`, `app/page.tsx` は変更しない
- Task C で実装したフェードシェーダーのロジックは維持する
- TypeScript の型エラーを出さない
- WordPress側ファイルへの変更は行わない

---

## 完了後の確認

1. `npm run dev` で表示確認
2. **海面が波打っているか**(大きなうねり + 細かいサザ波)
3. 波が自然な速度で動いているか
4. 水平線付近の霞み(Task C の実装)が維持されているか
5. スクロールで島が回転する動作が壊れていないか
6. フレームレートが極端に落ちていないか(開発者ツールで確認)
7. スクリーンショット(可能なら動画かGIF)を報告

---

## Git コミットメッセージ例

`Camera Task D: 海面に波アニメーションを追加(頂点シェーダー)`
