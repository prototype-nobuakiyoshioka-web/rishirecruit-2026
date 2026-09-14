"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

/**
 * 島の上空を旋回するチビ・ジオラマ調のカモメ 4 羽。
 * 円軌道 + 上下ゆらぎ + 羽ばたきアニメーション。
 */

type BirdDef = {
  orbitRadius: number;
  altitude: number;
  centerX: number;
  centerZ: number;
  speed: number;
  phase: number;
  size: number;
  bobAmp: number;
  bobPeriod: number;
  flapSpeed: number;
};

// 鬼脇上空を集団で小さく旋回
const FLOCK_CENTER_X = -20;
const FLOCK_CENTER_Z = 28;

const BIRDS: BirdDef[] = [
  {
    orbitRadius: 8,
    altitude: 16,
    centerX: FLOCK_CENTER_X,
    centerZ: FLOCK_CENTER_Z,
    speed: 0.45,
    phase: 0,
    size: 0.6,
    bobAmp: 0.4,
    bobPeriod: 2.4,
    flapSpeed: 7,
  },
  {
    orbitRadius: 11,
    altitude: 18,
    centerX: FLOCK_CENTER_X,
    centerZ: FLOCK_CENTER_Z,
    speed: 0.38,
    phase: Math.PI * 0.6,
    size: 0.7,
    bobAmp: 0.5,
    bobPeriod: 2.6,
    flapSpeed: 6.4,
  },
  {
    orbitRadius: 6,
    altitude: 14,
    centerX: FLOCK_CENTER_X,
    centerZ: FLOCK_CENTER_Z,
    speed: 0.55,
    phase: Math.PI * 1.2,
    size: 0.5,
    bobAmp: 0.35,
    bobPeriod: 2.2,
    flapSpeed: 7.5,
  },
  {
    orbitRadius: 9,
    altitude: 20,
    centerX: FLOCK_CENTER_X,
    centerZ: FLOCK_CENTER_Z,
    speed: 0.42,
    phase: Math.PI * 1.7,
    size: 0.65,
    bobAmp: 0.45,
    bobPeriod: 2.5,
    flapSpeed: 6.8,
  },
];

export function Birds() {
  return (
    <>
      {BIRDS.map((b, i) => (
        <Bird key={i} def={b} />
      ))}
    </>
  );
}

function Bird({ def }: { def: BirdDef }) {
  const groupRef = useRef<Group>(null);
  const leftWingRef = useRef<Group>(null);
  const rightWingRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const angle = def.phase + t * def.speed;

    const x = def.centerX + Math.cos(angle) * def.orbitRadius;
    const z = def.centerZ + Math.sin(angle) * def.orbitRadius;
    const yOffset =
      Math.sin(t * ((Math.PI * 2) / def.bobPeriod) + def.phase) * def.bobAmp;
    groupRef.current.position.set(x, def.altitude + yOffset, z);

    const yaw = Math.atan2(-Math.sin(angle), Math.cos(angle));
    groupRef.current.rotation.y = yaw;

    const flap = Math.sin(t * def.flapSpeed + def.phase) * 0.6;
    if (leftWingRef.current) leftWingRef.current.rotation.z = flap;
    if (rightWingRef.current) rightWingRef.current.rotation.z = -flap;
  });

  const s = def.size;

  return (
    <group ref={groupRef} scale={s}>
      {/* 胴体（オフホワイト） */}
      <mesh>
        <boxGeometry args={[0.28, 0.22, 0.72]} />
        <meshStandardMaterial color="#F0EDE4" roughness={0.9} flatShading />
      </mesh>
      {/* 頭 */}
      <mesh position={[0, 0.06, 0.45]}>
        <boxGeometry args={[0.2, 0.2, 0.22]} />
        <meshStandardMaterial color="#F0EDE4" roughness={0.9} flatShading />
      </mesh>
      {/* くちばし（マスタード） */}
      <mesh position={[0, 0.03, 0.6]}>
        <boxGeometry args={[0.05, 0.05, 0.12]} />
        <meshStandardMaterial color="#E8CE73" roughness={0.85} flatShading />
      </mesh>
      {/* 左翼（回転軸を胴体右寄り） */}
      <group ref={leftWingRef} position={[0.14, 0.04, 0]}>
        <mesh position={[0.5, 0, 0]}>
          <boxGeometry args={[1.0, 0.05, 0.42]} />
          <meshStandardMaterial color="#F0EDE4" roughness={0.9} flatShading />
        </mesh>
        {/* 翼先の陰色（スレート） */}
        <mesh position={[0.95, 0, 0]}>
          <boxGeometry args={[0.18, 0.06, 0.34]} />
          <meshStandardMaterial color="#586B79" roughness={0.9} flatShading />
        </mesh>
      </group>
      {/* 右翼 */}
      <group ref={rightWingRef} position={[-0.14, 0.04, 0]}>
        <mesh position={[-0.5, 0, 0]}>
          <boxGeometry args={[1.0, 0.05, 0.42]} />
          <meshStandardMaterial color="#F0EDE4" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[-0.95, 0, 0]}>
          <boxGeometry args={[0.18, 0.06, 0.34]} />
          <meshStandardMaterial color="#586B79" roughness={0.9} flatShading />
        </mesh>
      </group>
    </group>
  );
}
