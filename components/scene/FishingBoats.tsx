"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

/**
 * 島の周辺に浮かぶ小型漁船。IslandModel group の子として配置し、
 * 島と一緒に回転・スケールする。移動はせず、その場でわずかに上下・揺れる。
 */

type BoatDef = {
  position: [number, number, number];
  yaw: number;                // 向き（rad）
  bobPhase: number;           // 上下揺れの位相
  rollPhase: number;          // 揺れの位相
  color: string;              // 船体色
};

// Island local 座標
const FISHING_BOATS: BoatDef[] = [
  {
    position: [-50, 0.4, -6],
    yaw: 0.6,
    bobPhase: 0,
    rollPhase: 0,
    color: "#D9822B", // オレンジ系
  },
  {
    position: [-55, 0.4, -1],
    yaw: -0.2,
    bobPhase: 1.4,
    rollPhase: 0.7,
    color: "#3B7DBF", // 青系
  },
  {
    position: [-48, 0.4, 3],
    yaw: 1.2,
    bobPhase: 2.7,
    rollPhase: 1.3,
    color: "#C0392B", // 赤系
  },
];

// 船体寸法（小さめ、Island local 単位）
const HULL_LENGTH = 3.2;
const HULL_WIDTH = 1.1;
const HULL_HEIGHT = 0.55;

const BOB_AMPLITUDE = 0.12;
const BOB_PERIOD = 2.4;
const ROLL_AMPLITUDE = 0.06;
const ROLL_PERIOD = 3.1;

export function FishingBoats() {
  return (
    <>
      {FISHING_BOATS.map((b, i) => (
        <FishingBoat key={i} def={b} />
      ))}
    </>
  );
}

function FishingBoat({ def }: { def: BoatDef }) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const bob =
      Math.sin(t * ((Math.PI * 2) / BOB_PERIOD) + def.bobPhase) * BOB_AMPLITUDE;
    const roll =
      Math.sin(t * ((Math.PI * 2) / ROLL_PERIOD) + def.rollPhase) *
      ROLL_AMPLITUDE;
    groupRef.current.position.y = def.position[1] + bob;
    groupRef.current.rotation.z = roll;
  });

  return (
    <group
      ref={groupRef}
      position={def.position}
      rotation={[0, def.yaw, 0]}
    >
      {/* 船体（色付き） */}
      <mesh position={[0, HULL_HEIGHT / 2, 0]}>
        <boxGeometry args={[HULL_WIDTH, HULL_HEIGHT, HULL_LENGTH]} />
        <meshStandardMaterial color={def.color} roughness={0.9} flatShading />
      </mesh>
      {/* デッキ（白木の甲板） */}
      <mesh position={[0, HULL_HEIGHT + 0.02, 0]}>
        <boxGeometry args={[HULL_WIDTH * 0.9, 0.06, HULL_LENGTH * 0.9]} />
        <meshStandardMaterial color="#E8DDC1" roughness={0.95} flatShading />
      </mesh>
      {/* 操舵室（小さな箱） */}
      <mesh position={[0, HULL_HEIGHT + 0.35, -HULL_LENGTH * 0.15]}>
        <boxGeometry
          args={[HULL_WIDTH * 0.55, 0.55, HULL_LENGTH * 0.28]}
        />
        <meshStandardMaterial color="#F5F5F0" roughness={0.9} flatShading />
      </mesh>
      {/* マスト */}
      <mesh position={[0, HULL_HEIGHT + 0.95, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.2, 6]} />
        <meshStandardMaterial color="#5C4A2E" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}
