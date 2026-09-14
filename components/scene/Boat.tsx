"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { Group } from "three";

/**
 * 鴛泊港と沖を往復するチビ・ジオラマ調の連絡船。
 * IslandModel group の子として配置され、島の回転・スケールに追従する。
 *
 * 座標系は新 GLB の Island local（1km=5単位、Y=0が海面付近）。
 */

// 港側 A / 沖合 B（Island local 座標）
const ANCHOR_A = new THREE.Vector3(40, 0.4, 4);
const ANCHOR_B = new THREE.Vector3(58, 0.4, 18);

// 片道時間と停泊時間
const TRAVEL_SECONDS = 14;
const PORT_PAUSE_SECONDS = 4;
const OFFSHORE_PAUSE_SECONDS = 2;

// 上下のゆれ
const BOB_AMPLITUDE = 0.1;
const BOB_PERIOD = 1.8;

// ジオラマなので寸法は小さめ
const HULL_LENGTH = 3.8;
const HULL_WIDTH = 1.4;
const HULL_HEIGHT = 0.6;

const dir = new THREE.Vector3();

export function Boat() {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const cycle =
      PORT_PAUSE_SECONDS +
      TRAVEL_SECONDS +
      OFFSHORE_PAUSE_SECONDS +
      TRAVEL_SECONDS;
    const s = state.clock.elapsedTime % cycle;

    let progress: number;
    let heading: 1 | -1 | 0;
    if (s < PORT_PAUSE_SECONDS) {
      progress = 0;
      heading = 0;
    } else if (s < PORT_PAUSE_SECONDS + TRAVEL_SECONDS) {
      progress = (s - PORT_PAUSE_SECONDS) / TRAVEL_SECONDS;
      heading = 1;
    } else if (
      s <
      PORT_PAUSE_SECONDS + TRAVEL_SECONDS + OFFSHORE_PAUSE_SECONDS
    ) {
      progress = 1;
      heading = 0;
    } else {
      const traveled =
        s - PORT_PAUSE_SECONDS - TRAVEL_SECONDS - OFFSHORE_PAUSE_SECONDS;
      progress = 1 - traveled / TRAVEL_SECONDS;
      heading = -1;
    }

    groupRef.current.position.lerpVectors(ANCHOR_A, ANCHOR_B, progress);
    groupRef.current.position.y +=
      Math.sin(state.clock.elapsedTime * ((Math.PI * 2) / BOB_PERIOD)) *
      BOB_AMPLITUDE;

    if (heading !== 0) {
      dir.subVectors(ANCHOR_B, ANCHOR_A);
      if (heading === -1) dir.negate();
      groupRef.current.rotation.y = Math.atan2(dir.x, dir.z);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 船体下部（コーラルレッド） */}
      <mesh position={[0, HULL_HEIGHT / 2, 0]}>
        <boxGeometry args={[HULL_WIDTH, HULL_HEIGHT, HULL_LENGTH]} />
        <meshStandardMaterial color="#BC5643" roughness={0.9} flatShading />
      </mesh>
      {/* 喫水線（濃紺の細帯） */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[HULL_WIDTH + 0.03, 0.08, HULL_LENGTH + 0.03]} />
        <meshStandardMaterial color="#22454B" roughness={0.9} flatShading />
      </mesh>
      {/* デッキ（クリーム） */}
      <mesh position={[0, HULL_HEIGHT + 0.05, 0]}>
        <boxGeometry args={[HULL_WIDTH * 0.9, 0.1, HULL_LENGTH * 0.9]} />
        <meshStandardMaterial color="#FFE6BD" roughness={0.95} flatShading />
      </mesh>
      {/* キャビン（白） */}
      <mesh position={[0, HULL_HEIGHT + 0.5, -0.15]}>
        <boxGeometry args={[HULL_WIDTH * 0.75, 0.8, HULL_LENGTH * 0.5]} />
        <meshStandardMaterial color="#F0EDE4" roughness={0.9} flatShading />
      </mesh>
      {/* ブリッジ（もう一段） */}
      <mesh position={[0, HULL_HEIGHT + 1.1, -0.3]}>
        <boxGeometry args={[HULL_WIDTH * 0.5, 0.4, HULL_LENGTH * 0.25]} />
        <meshStandardMaterial color="#F0EDE4" roughness={0.9} flatShading />
      </mesh>
      {/* 煙突（マスタード） */}
      <mesh position={[0, HULL_HEIGHT + 1.55, -0.3]}>
        <cylinderGeometry args={[0.15, 0.15, 0.35, 8]} />
        <meshStandardMaterial color="#E8CE73" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}
