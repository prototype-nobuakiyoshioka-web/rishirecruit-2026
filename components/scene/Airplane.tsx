"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { Group } from "three";

/**
 * 利尻空港（鴛泊近く）を発着する小型機。
 * サイクル: 停機 → 離陸上昇 → 巡航（島周回）→ 進入下降 → 着陸 → 停機（繰り返し）
 * ローポリ・白ベース＋赤帯＋濃紺。
 */

// 空港位置（Island local 座標） — 鴛泊 pin の東側、フラットな海岸平野。
const AIRPORT = new THREE.Vector3(28, 5, 10);
// 巡航高度（Island local。山頂 Y≒22 の上）
const CRUISE_ALTITUDE = 34;
// 島の周回半径
const LOOP_RADIUS = 45;
// 1 サイクル秒数（大 = ゆっくり）
const CYCLE_SECONDS = 45;

// バンク角（巡航中）
const BANK_RADIANS = 0.2;

// 機体サイズ
const FUSELAGE_LENGTH = 6;
const FUSELAGE_WIDTH = 1;
const FUSELAGE_HEIGHT = 1;
const WING_SPAN = 8;
const WING_CHORD = 1.4;
const WING_THICK = 0.18;

// フェーズ境界（サイクル内 0..1）
const TAKEOFF_START = 0.05;
const CRUISE_START = 0.20;
const CRUISE_END = 0.80;
const LANDING_END = 0.95;

function easeInOut(p: number) {
  return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
}

export function Airplane() {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const t = (state.clock.elapsedTime % CYCLE_SECONDS) / CYCLE_SECONDS;

    // ping-pong 進行度: t=0..0.5 で 0→1（アウトバウンド）、t=0.5..1 で 1→0（リターン）
    // cos で滑らかにイージング（折り返し点で速度 0）
    const p = (1 - Math.cos(t * Math.PI * 2)) / 2;
    const outbound = t < 0.5;

    // 空港発の半円弧: -π/2 から +π/2 で 180 度分だけ通過する
    const angle = -Math.PI / 2 + p * Math.PI;
    const cx = AIRPORT.x;
    const cz = AIRPORT.z + LOOP_RADIUS;
    const x = cx + Math.cos(angle) * LOOP_RADIUS;
    const z = cz + Math.sin(angle) * LOOP_RADIUS;

    // 高度: 停機 → 上昇 → 巡航 → 下降 → 停機 の 5 相
    let altitude = AIRPORT.y;
    let pitch = 0;
    let bank = 0;
    if (t < TAKEOFF_START) {
      altitude = AIRPORT.y;
    } else if (t < CRUISE_START) {
      const pp = (t - TAKEOFF_START) / (CRUISE_START - TAKEOFF_START);
      altitude = THREE.MathUtils.lerp(AIRPORT.y, CRUISE_ALTITUDE, easeInOut(pp));
      pitch = 0.22;
    } else if (t < CRUISE_END) {
      altitude = CRUISE_ALTITUDE;
      // 折り返し方向でバンクを反転
      bank = outbound ? BANK_RADIANS : -BANK_RADIANS;
    } else if (t < LANDING_END) {
      const pp = (t - CRUISE_END) / (LANDING_END - CRUISE_END);
      altitude = THREE.MathUtils.lerp(CRUISE_ALTITUDE, AIRPORT.y, easeInOut(pp));
      pitch = -0.15;
    } else {
      altitude = AIRPORT.y;
    }

    groupRef.current.position.set(x, altitude, z);

    // 進行方向 = 半円弧の接線。復路は方向が反転する。
    const sign = outbound ? 1 : -1;
    const dx = -Math.sin(angle) * sign;
    const dz = Math.cos(angle) * sign;
    const yaw = Math.atan2(dx, dz);

    groupRef.current.rotation.set(pitch, yaw, bank);
  });

  return (
    <group ref={groupRef}>
      {/* 胴体（白） */}
      <mesh>
        <boxGeometry
          args={[FUSELAGE_WIDTH, FUSELAGE_HEIGHT, FUSELAGE_LENGTH]}
        />
        <meshStandardMaterial color="#F7F8F5" roughness={0.7} />
      </mesh>
      {/* 赤帯（アクセント） */}
      <mesh>
        <boxGeometry
          args={[FUSELAGE_WIDTH + 0.02, 0.16, FUSELAGE_LENGTH * 0.9]}
        />
        <meshStandardMaterial color="#C0392B" roughness={0.6} />
      </mesh>
      {/* 主翼（白） */}
      <mesh>
        <boxGeometry args={[WING_SPAN, WING_THICK, WING_CHORD]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.7} />
      </mesh>
      {/* 尾翼（水平・白） */}
      <mesh position={[0, 0.05, -FUSELAGE_LENGTH * 0.42]}>
        <boxGeometry args={[WING_SPAN * 0.4, WING_THICK, WING_CHORD * 0.55]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.7} />
      </mesh>
      {/* 尾翼（垂直・濃紺）*/}
      <mesh position={[0, 0.7, -FUSELAGE_LENGTH * 0.42]}>
        <boxGeometry args={[WING_THICK, 1.1, WING_CHORD * 0.7]} />
        <meshStandardMaterial color="#1F3A5F" roughness={0.7} />
      </mesh>
      {/* コックピット窓（濃紺）*/}
      <mesh position={[0, 0.35, FUSELAGE_LENGTH * 0.32]}>
        <boxGeometry
          args={[
            FUSELAGE_WIDTH * 0.65,
            0.35,
            FUSELAGE_LENGTH * 0.2,
          ]}
        />
        <meshStandardMaterial color="#1F3A5F" roughness={0.5} />
      </mesh>
    </group>
  );
}
