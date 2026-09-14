"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

/**
 * 島の南岸沖に浮かぶチビ・ジオラマ調の小さな漁船群。
 * その場で穏やかに上下・左右にゆれる（移動なし）。
 */

type BoatDef = {
  position: [number, number, number];
  yaw: number;
  bobPhase: number;
  rollPhase: number;
  color: string;      // 船体色
  accent: string;     // 屋根アクセント
};

// Island local 座標（新 GLB スケール、鬼脇側の海岸沖に寄せて配置）
const FISHING_BOATS: BoatDef[] = [
  {
    position: [-27, 0.3, 35],
    yaw: 0.6,
    bobPhase: 0,
    rollPhase: 0,
    color: "#D9822B", // 温かいオレンジ
    accent: "#F0EDE4",
  },
  {
    position: [-30, 0.3, 38],
    yaw: -0.2,
    bobPhase: 1.4,
    rollPhase: 0.7,
    color: "#386F67", // ティール
    accent: "#FFE6BD",
  },
  {
    position: [-24, 0.3, 39],
    yaw: 1.2,
    bobPhase: 2.7,
    rollPhase: 1.3,
    color: "#BC5643", // コーラル
    accent: "#F0EDE4",
  },
];

const HULL_LENGTH = 1.6;
const HULL_WIDTH = 0.65;
const HULL_HEIGHT = 0.3;

const BOB_AMPLITUDE = 0.06;
const BOB_PERIOD = 2.4;
const ROLL_AMPLITUDE = 0.05;
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
      {/* 船体（丸みのあるずんぐりバスタブ形状） */}
      <mesh position={[0, HULL_HEIGHT / 2, 0]}>
        <boxGeometry args={[HULL_WIDTH, HULL_HEIGHT, HULL_LENGTH]} />
        <meshStandardMaterial color={def.color} roughness={0.9} flatShading />
      </mesh>
      {/* デッキ（クリーム） */}
      <mesh position={[0, HULL_HEIGHT + 0.02, 0]}>
        <boxGeometry args={[HULL_WIDTH * 0.85, 0.04, HULL_LENGTH * 0.85]} />
        <meshStandardMaterial color="#EDD9B5" roughness={0.95} flatShading />
      </mesh>
      {/* キャビン */}
      <mesh position={[0, HULL_HEIGHT + 0.2, -0.15]}>
        <boxGeometry args={[HULL_WIDTH * 0.5, 0.3, HULL_LENGTH * 0.3]} />
        <meshStandardMaterial color={def.accent} roughness={0.9} flatShading />
      </mesh>
      {/* 屋根（アクセント色） */}
      <mesh position={[0, HULL_HEIGHT + 0.36, -0.15]}>
        <boxGeometry args={[HULL_WIDTH * 0.55, 0.05, HULL_LENGTH * 0.34]} />
        <meshStandardMaterial color={def.color} roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}
