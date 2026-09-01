"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { Group } from "three";

/**
 * 島の上空を旋回する小さなカモメの群れ。
 * 各鳥は円軌道 + 上下ゆらぎ + 羽ばたきアニメーション。
 * Island local 座標。ローポリで軽量。
 */

type BirdDef = {
  orbitRadius: number;      // 円軌道半径
  altitude: number;         // 高度
  centerZ: number;          // 軌道中心 Z（島中心 -1.5 前後を基準）
  centerX: number;          // 軌道中心 X
  speed: number;            // 角速度（rad/s）
  phase: number;            // 位相ずらし
  size: number;             // 機体サイズ
  bobAmp: number;           // 上下揺れ振幅
  bobPeriod: number;        // 上下揺れ周期
  flapSpeed: number;        // 羽ばたき速さ
};

// 鬼脇エリア (-20, ?, -18) 付近の上空を小さく旋回する群れ
const FLOCK_CENTER_X = -20;
const FLOCK_CENTER_Z = -18;

const BIRDS: BirdDef[] = [
  {
    orbitRadius: 9,
    altitude: 18,
    centerX: FLOCK_CENTER_X,
    centerZ: FLOCK_CENTER_Z,
    speed: 0.45,
    phase: 0,
    size: 1.3,
    bobAmp: 0.6,
    bobPeriod: 2.4,
    flapSpeed: 7,
  },
  {
    orbitRadius: 12,
    altitude: 20,
    centerX: FLOCK_CENTER_X,
    centerZ: FLOCK_CENTER_Z,
    speed: 0.38,
    phase: Math.PI * 0.6,
    size: 1.5,
    bobAmp: 0.7,
    bobPeriod: 2.6,
    flapSpeed: 6.4,
  },
  {
    orbitRadius: 7,
    altitude: 16,
    centerX: FLOCK_CENTER_X,
    centerZ: FLOCK_CENTER_Z,
    speed: 0.55,
    phase: Math.PI * 1.2,
    size: 1.1,
    bobAmp: 0.5,
    bobPeriod: 2.2,
    flapSpeed: 7.5,
  },
  {
    orbitRadius: 10,
    altitude: 22,
    centerX: FLOCK_CENTER_X,
    centerZ: FLOCK_CENTER_Z,
    speed: 0.42,
    phase: Math.PI * 1.7,
    size: 1.4,
    bobAmp: 0.6,
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

    // 円軌道
    const x = def.centerX + Math.cos(angle) * def.orbitRadius;
    const z = def.centerZ + Math.sin(angle) * def.orbitRadius;
    // 上下のゆるやかな揺れ
    const yOffset =
      Math.sin(t * ((Math.PI * 2) / def.bobPeriod) + def.phase) * def.bobAmp;
    groupRef.current.position.set(x, def.altitude + yOffset, z);

    // 進行方向を向く（接線 = (-sin, 0, cos)）
    const yaw = Math.atan2(-Math.sin(angle), Math.cos(angle));
    groupRef.current.rotation.y = yaw;

    // 羽ばたき（Z 軸周り、両翼を対称に上下）
    const flap = Math.sin(t * def.flapSpeed + def.phase) * 0.6;
    if (leftWingRef.current) leftWingRef.current.rotation.z = flap;
    if (rightWingRef.current) rightWingRef.current.rotation.z = -flap;
  });

  const s = def.size;

  return (
    <group ref={groupRef} scale={s}>
      {/* 胴体（細長い、白） */}
      <mesh>
        <boxGeometry args={[0.3, 0.25, 0.8]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.9} flatShading />
      </mesh>
      {/* 頭（少し前・小さめ） */}
      <mesh position={[0, 0.08, 0.5]}>
        <boxGeometry args={[0.22, 0.22, 0.25]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.9} flatShading />
      </mesh>
      {/* くちばし（濃黄）*/}
      <mesh position={[0, 0.05, 0.68]}>
        <boxGeometry args={[0.06, 0.06, 0.14]} />
        <meshStandardMaterial color="#F2C94C" roughness={0.8} flatShading />
      </mesh>
      {/* 左翼（回転軸を胴体の右側に置く） */}
      <group ref={leftWingRef} position={[0.15, 0.05, 0]}>
        <mesh position={[0.55, 0, 0]}>
          <boxGeometry args={[1.1, 0.06, 0.5]} />
          <meshStandardMaterial color="#F5F5F5" roughness={0.9} flatShading />
        </mesh>
        {/* 翼先の黒（カモメらしさ） */}
        <mesh position={[1.05, 0, 0]}>
          <boxGeometry args={[0.2, 0.07, 0.4]} />
          <meshStandardMaterial color="#2B2E33" roughness={0.9} flatShading />
        </mesh>
      </group>
      {/* 右翼（対称） */}
      <group ref={rightWingRef} position={[-0.15, 0.05, 0]}>
        <mesh position={[-0.55, 0, 0]}>
          <boxGeometry args={[1.1, 0.06, 0.5]} />
          <meshStandardMaterial color="#F5F5F5" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[-1.05, 0, 0]}>
          <boxGeometry args={[0.2, 0.07, 0.4]} />
          <meshStandardMaterial color="#2B2E33" roughness={0.9} flatShading />
        </mesh>
      </group>
    </group>
  );
}
