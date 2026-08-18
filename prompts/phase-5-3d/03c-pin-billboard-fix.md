# Phase 5 Task 03c: ピンのBillboard修正

## 問題

エリアピンが島の回転に合わせて傾いており、
常に正面を向いていない。

## 原因

Pin.tsx で `meshRef.current.quaternion.copy(camera.quaternion)` を
実行しているが、親グループ(IslandModel の group)が回転しているため、
その回転が子要素にも継承されて打ち消されている。

## 修正

親の回転を打ち消してカメラに正対させる必要がある。

components/scene/Pin.tsx の useFrame を以下に変更:

useFrame(() => {
  if (!meshRef.current) return;

  // ワールド空間でカメラの向きに合わせる
  // 親の回転を打ち消すため、親のワールド行列の逆行列を掛ける
  const parent = meshRef.current.parent;
  if (parent) {
    // 親のワールド回転を取得
    const parentWorldQuaternion = new THREE.Quaternion();
    parent.getWorldQuaternion(parentWorldQuaternion);

    // カメラの回転から親の回転を打ち消す
    meshRef.current.quaternion
      .copy(parentWorldQuaternion)
      .invert()
      .multiply(camera.quaternion);
  } else {
    meshRef.current.quaternion.copy(camera.quaternion);
  }
});

【パフォーマンス注意】
useFrame 内で new THREE.Quaternion() を毎フレーム生成しないよう、
コンポーネント外またはuseRefで再利用可能なインスタンスを用意してください:

// コンポーネント内、useFrame の外で定義
const tempQuaternion = useRef(new THREE.Quaternion());

// useFrame 内で使い回す
useFrame(() => {
  if (!meshRef.current) return;
  const parent = meshRef.current.parent;
  if (parent) {
    parent.getWorldQuaternion(tempQuaternion.current);
    meshRef.current.quaternion
      .copy(tempQuaternion.current)
      .invert()
      .multiply(camera.quaternion);
  }
});

## 別解(Drei の Billboard コンポーネントを使う)

上記が複雑な場合、@react-three/drei の Billboard を使う方が簡単:

import { Billboard } from "@react-three/drei";

return (
  <Billboard position={position} follow={true}>
    <mesh>
      <ringGeometry args={...} />
      <meshBasicMaterial ... />
    </mesh>
  </Billboard>
);

Billboard は親の回転も考慮して自動でカメラに正対するため、
こちらの方が確実です。まずこちらを試してください。

## 確認手順

1. npm run dev で表示確認
2. スクロールして島を回転させる
3. **どの回転角度でもピンが常に正面(円形)に見えるか**確認
4. ピンが楕円に潰れて見えないか確認
5. スクリーンショットを報告

## 制約

- Pin.tsx のみ変更
- useFrame 内でのオブジェクト生成を避ける(AGENTS.mdのルール)
