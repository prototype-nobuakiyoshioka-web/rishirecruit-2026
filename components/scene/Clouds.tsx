"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { Group } from "three";

/**
 * 島の上空に浮かぶチビ・ジオラマ調の雲群。
 * IslandModel group の子として配置し、島と一緒に回転・スケールする。
 * 20面体（icosahedron）を数個組み合わせた角ばりモコモコで、風でゆっくり流れる。
 */

type CloudDef = {
  base: THREE.Vector3;
  scale: number;
  drift: number;             // 流れる速度（大 = 速い）
  offset: number;            // 位相ずらし
  // 各パフ: [x, y, z, radius, rotSeed]
  puffs: Array<[number, number, number, number, number]>;
};

// ジオラマ調は小さく可愛らしい雲。パフ数を抑え、角ばりを活かす。
const CLOUDS: CloudDef[] = [
  {
    // 島の上空・北寄り
    base: new THREE.Vector3(5, 16, -15),
    scale: 0.32,
    drift: 0.4,
    offset: 0,
    puffs: [
      [0, 0, 0, 4.5, 0.3],
      [3.5, 0.3, 0.5, 3.5, 1.4],
      [-3.5, 0.2, -0.3, 3.5, 0.7],
      [0.5, 1.3, 0, 2.5, 2.1],
      [1.5, -0.3, 1, 2.2, 1.9],
    ],
  },
  {
    // 鬼脇上空
    base: new THREE.Vector3(-25, 18, 22),
    scale: 0.28,
    drift: 0.5,
    offset: 40,
    puffs: [
      [0, 0, 0, 4, 0.6],
      [3, 0.4, 0.2, 3.2, 1.7],
      [-2.8, 0.1, 0.4, 3, 2.4],
      [0.5, 1.1, -0.3, 2.2, 0.4],
    ],
  },
  {
    // 島の南〜東側
    base: new THREE.Vector3(28, 20, 8),
    scale: 0.24,
    drift: 0.35,
    offset: 80,
    puffs: [
      [0, 0, 0, 3.8, 1.1],
      [2.8, 0.3, 0.3, 3, 2.0],
      [-2.6, 0.2, -0.3, 3, 0.5],
    ],
  },
];

// X 方向にどこまで流れたら反対側から出てくるか（ワープ範囲）
const WRAP_HALF_WIDTH = 80;

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
            color="#F5F1E8"
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
