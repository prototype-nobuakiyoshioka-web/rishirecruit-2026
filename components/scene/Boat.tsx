"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { Group } from "three";

/**
 * 鴛泊港沖を往復するローポリ船。IslandModel group の子として配置され、
 * 島の回転・スケールに追従する。
 *
 * 座標系は Island local。Y=0 が地形ベース（≒ 海面付近）に相当。
 */

// 往復の 2 点（鴛泊港近くの Island local 座標）
const ANCHOR_A = new THREE.Vector3(33, 0.5, 38); // 港側
const ANCHOR_B = new THREE.Vector3(70, 0.5, 70); // 沖合

// 片道にかける秒数
const TRAVEL_SECONDS = 12;
// 港（A）と沖（B）で停泊する秒数
const PORT_PAUSE_SECONDS = 4;
const OFFSHORE_PAUSE_SECONDS = 2;

// 上下の揺れ振幅・周期
const BOB_AMPLITUDE = 0.15;
const BOB_PERIOD = 1.6;

// 船体サイズ（Island local 単位）
const HULL_LENGTH = 7.5;
const HULL_WIDTH = 3;
const HULL_HEIGHT = 1.2;

const dir = new THREE.Vector3();

export function Boat() {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    // 1 サイクル = 港停泊 → A→B 移動 → 沖停泊 → B→A 移動
    const cycle =
      PORT_PAUSE_SECONDS +
      TRAVEL_SECONDS +
      OFFSHORE_PAUSE_SECONDS +
      TRAVEL_SECONDS;
    const s = state.clock.elapsedTime % cycle;

    let progress: number;
    let heading: 1 | -1 | 0;
    if (s < PORT_PAUSE_SECONDS) {
      // 港で停泊
      progress = 0;
      heading = 0;
    } else if (s < PORT_PAUSE_SECONDS + TRAVEL_SECONDS) {
      // A → B
      progress = (s - PORT_PAUSE_SECONDS) / TRAVEL_SECONDS;
      heading = 1;
    } else if (
      s <
      PORT_PAUSE_SECONDS + TRAVEL_SECONDS + OFFSHORE_PAUSE_SECONDS
    ) {
      // 沖で停泊
      progress = 1;
      heading = 0;
    } else {
      // B → A
      const traveled =
        s - PORT_PAUSE_SECONDS - TRAVEL_SECONDS - OFFSHORE_PAUSE_SECONDS;
      progress = 1 - traveled / TRAVEL_SECONDS;
      heading = -1;
    }

    // 位置
    groupRef.current.position.lerpVectors(ANCHOR_A, ANCHOR_B, progress);
    // 揺れ（Y だけ小さく上下）
    groupRef.current.position.y +=
      Math.sin(state.clock.elapsedTime * ((Math.PI * 2) / BOB_PERIOD)) *
      BOB_AMPLITUDE;

    // 進行方向を向く。停泊中は直前の向きを維持したいので heading==0 なら更新しない
    if (heading !== 0) {
      dir.subVectors(ANCHOR_B, ANCHOR_A);
      if (heading === -1) dir.negate();
      groupRef.current.rotation.y = Math.atan2(dir.x, dir.z);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 船体下部（白） */}
      <mesh position={[0, HULL_HEIGHT / 2, 0]}>
        <boxGeometry args={[HULL_WIDTH, HULL_HEIGHT, HULL_LENGTH]} />
        <meshStandardMaterial color="#F5F7F5" roughness={0.9} />
      </mesh>
      {/* 喫水線ライン（濃紺・細帯） */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[HULL_WIDTH + 0.02, 0.15, HULL_LENGTH + 0.02]} />
        <meshStandardMaterial color="#1F3A5F" roughness={0.9} />
      </mesh>
      {/* 上部構造（白） */}
      <mesh position={[0, HULL_HEIGHT + 0.9, -0.3]}>
        <boxGeometry args={[HULL_WIDTH * 0.85, 1.8, HULL_LENGTH * 0.55]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
      </mesh>
      {/* ブリッジ（さらに一段上、白） */}
      <mesh position={[0, HULL_HEIGHT + 2.2, -0.6]}>
        <boxGeometry args={[HULL_WIDTH * 0.55, 0.9, HULL_LENGTH * 0.28]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
      </mesh>
      {/* 煙突（黄アクセント） */}
      <mesh position={[0, HULL_HEIGHT + 2.9, -0.6]}>
        <boxGeometry args={[HULL_WIDTH * 0.28, 0.55, HULL_LENGTH * 0.14]} />
        <meshStandardMaterial color="#F2C94C" roughness={0.9} />
      </mesh>
    </group>
  );
}
