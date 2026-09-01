"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { Group } from "three";

/**
 * 島の上空に浮かぶローポリ雲の群れ。IslandModel group の子として配置し、
 * 島と一緒に回転・スケールする。
 * 各雲は複数の球を組み合わせたモコモコ形状で、風でゆっくり流れる。
 */

// Island local 座標。X が流れる方向。
type CloudDef = {
  base: THREE.Vector3;       // 基準位置
  scale: number;             // モコモコ全体の大きさ
  drift: number;             // 流れる速度（大 = 速い）
  offset: number;            // 位相ずらし（各雲の開始位置を分散）
  // 各パフの [x, y, z, radius, rotY(rad)]
  puffs: Array<[number, number, number, number, number]>;
};

const CLOUDS: CloudDef[] = [
  {
    // 島の奥側（−Z）にやや近づけて島との一体感を持たせる
    base: new THREE.Vector3(10, 32, -25),
    scale: 0.5,
    drift: 0.6,
    offset: 0,
    puffs: [
      [0, 0, 0, 6, 0.3],
      [5, 0.4, 1, 5, 1.1],
      [-4, -0.3, 0.5, 5, 0.6],
      [2.5, 1.3, -1, 4, 1.8],
      [-2.5, 1.2, 1.5, 4, 2.4],
      [7, -0.2, -0.5, 3.5, 0.9],
      [-6, 0.5, -0.5, 3.5, 1.5],
      [0.5, 2, 0.5, 3, 0.4],
    ],
  },
  {
    base: new THREE.Vector3(-40, 34, -30),
    scale: 0.55,
    drift: 0.4,
    offset: 30,
    puffs: [
      [0, 0, 0, 5, 0.2],
      [4, 0.3, 0, 4, 1.3],
      [-3.5, 0.2, 0.5, 4.2, 0.8],
      [1, 1.2, -0.5, 3.5, 2.0],
      [-1.5, -0.5, 1, 3, 1.6],
      [5.5, -0.3, 0, 2.8, 2.9],
    ],
  },
  {
    // 元は手前側 (Z=+40, +45) にあり画面を覆っていた 2 つの雲を、1 つに統合して
    // 島の直上・奥側 (Z≒-10) に配置。
    base: new THREE.Vector3(-5, 32, -10),
    scale: 0.9,
    drift: 0.8,
    offset: 60,
    puffs: [
      [0, 0, 0, 6, 0.5],
      [5, 0.4, 0.5, 5, 1.7],
      [-5, 0.3, -0.5, 5, 2.3],
      [0, 1.5, 0.5, 4, 0.1],
      [-2, -0.5, 1.5, 3.5, 1.4],
      [3, -0.3, -1, 3.5, 0.7],
    ],
  },
];

// X 方向にどこまで流れたら反対側から出てくるか（ワープ範囲）
const WRAP_HALF_WIDTH = 100;

export function Clouds() {
  return (
    <>
      {CLOUDS.map((c, i) => (
        <Cloud key={i} def={c} />
      ))}
    </>
  );
}

function Cloud({ def }: { def: CloudDef }) {
  const groupRef = useRef<Group>(null);
  // Puffs は毎回同じ形なので useMemo で 1 回だけ生成
  const puffMeshes = useMemo(
    () =>
      def.puffs.map((p, i) => (
        <mesh
          key={i}
          position={[p[0], p[1], p[2]]}
          rotation={[p[4] * 0.5, p[4], p[4] * 0.3]}
        >
          {/* IcosahedronGeometry(detail=0) は 20 面体でローポリらしい角ばり感 */}
          <icosahedronGeometry args={[p[3], 0]} />
          <meshStandardMaterial
            color="#FFFFFF"
            roughness={1}
            flatShading
          />
        </mesh>
      )),
    [def.puffs],
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime * def.drift + def.offset;
    const x = ((t + WRAP_HALF_WIDTH) % (WRAP_HALF_WIDTH * 2)) - WRAP_HALF_WIDTH;
    groupRef.current.position.set(def.base.x + x, def.base.y, def.base.z);
  });

  return (
    <group ref={groupRef} scale={def.scale}>
      {puffMeshes}
    </group>
  );
}
