"use client";

import { Billboard } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { getIntroPhase } from "@/lib/three/island-intro";
import { useActivePinPositionStore } from "@/store/active-pin-position-store";

interface AreaPinProps {
  areaSlug: string;
  areaName: string;
  position: [number, number, number];
  isActive: boolean;
  // SP は線で繋がないので、どのピンが選択中かを脈打ちで示す
  shouldPulse?: boolean;
}

// 活性/非活性ピンのリング寸法（Island group ローカル単位）。
// 島と同じ 1km=5単位の座標系で、画面上の視認性を保つ。
// 活性ピンは内側から 白 → 黄 → 透き間 → 黄 の同心円。
const PIN_CENTER_RADIUS = 1.3;
const PIN_BAND_OUTER = 2.4;
const PIN_ACTIVE_INNER = 2.85;
const PIN_ACTIVE_OUTER = 3.35;
const PIN_INACTIVE_INNER = 0.75;
const PIN_INACTIVE_OUTER = 1.2;
// 脈打ち(リングが広がって消える)。1周の秒数と、広がる倍率
const PULSE_PERIOD_S = 2.2;
const PULSE_SPREAD_S = 1.3;
const PULSE_MAX_SCALE = 1.6;
const PULSE_MAX_OPACITY = 0.7;
// オープニングで現れるときの速さ
const POP_DAMP_SPEED = 12;

// 建物や霧に負けないよう、シーンの奥行き・霧・トーンマップの影響を受けずに描く
const PIN_COLOR = "#F4B942"; // --c-pin-spot（カードの「Area」と同じ色）
const PIN_RENDER_ORDER = 20;
const PIN_MATERIAL_PROPS = {
  transparent: true,
  depthTest: false,
  depthWrite: false,
  toneMapped: false,
  fog: false,
  side: THREE.DoubleSide,
} as const;

// useFrame 内でのアロケーション回避（AGENTS.md 規約）
const worldPos = new THREE.Vector3();
const edgeWorldPos = new THREE.Vector3();
const ndcCenter = new THREE.Vector3();
const ndcEdge = new THREE.Vector3();
const cameraUp = new THREE.Vector3();
const worldScale = new THREE.Vector3();

function isHiddenByIntro() {
  const phase = getIntroPhase();
  return phase === "pending" || phase === "playing";
}

export function Pin({
  areaSlug,
  areaName,
  position,
  isActive,
  shouldPulse = false,
}: AreaPinProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const popRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const pulseMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const pulseElapsedRef = useRef(0);
  const [reduceMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  useFrame((_, dt) => {
    if (popRef.current) {
      const hidden = isHiddenByIntro();
      const scale = hidden
        ? 0
        : THREE.MathUtils.damp(popRef.current.scale.x, 1, POP_DAMP_SPEED, dt);
      popRef.current.scale.setScalar(Math.max(scale, 0.0001));
    }

    if (pulseRef.current && pulseMaterialRef.current) {
      pulseElapsedRef.current = (pulseElapsedRef.current + dt) % PULSE_PERIOD_S;
      const progress = Math.min(pulseElapsedRef.current / PULSE_SPREAD_S, 1);
      const eased = 1 - (1 - progress) ** 2;
      pulseRef.current.scale.setScalar(1 + (PULSE_MAX_SCALE - 1) * eased);
      pulseMaterialRef.current.opacity = PULSE_MAX_OPACITY * (1 - progress);
    }

    if (!isActive || !meshRef.current) return;

    // 中心のワールド座標
    meshRef.current.getWorldPosition(worldPos);
    // 親グループの scale を反映した実効半径（親スケール変更に強い）
    meshRef.current.getWorldScale(worldScale);
    const effectiveRadius = PIN_ACTIVE_OUTER * worldScale.x;

    // Billboard は常にカメラに正対するので、外周点は camera.up 方向へ外接半径ぶん進めた点。
    // camera の world up ベクトルを取得（camera.up は local なので matrixWorld から）
    cameraUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
    edgeWorldPos.copy(worldPos).addScaledVector(cameraUp, effectiveRadius);

    // 両点を NDC へ投影
    ndcCenter.copy(worldPos).project(camera);
    ndcEdge.copy(edgeWorldPos).project(camera);

    // NDC(-1..1) → CSS pixel。
    const screenCenterX = (ndcCenter.x * 0.5 + 0.5) * size.width;
    const screenCenterY = (-ndcCenter.y * 0.5 + 0.5) * size.height;
    const screenEdgeX = (ndcEdge.x * 0.5 + 0.5) * size.width;
    const screenEdgeY = (-ndcEdge.y * 0.5 + 0.5) * size.height;

    // 中心と外周の pixel 距離 = 画面上の半径
    const radius = Math.hypot(
      screenEdgeX - screenCenterX,
      screenEdgeY - screenCenterY,
    );

    const inFrustum = ndcCenter.z > -1 && ndcCenter.z < 1;

    useActivePinPositionStore.getState().setPosition({
      x: screenCenterX,
      y: screenCenterY,
      radius,
      visible: inFrustum,
    });
  });

  return (
    <Billboard position={position} follow userData={{ areaSlug, areaName }}>
      <group ref={popRef}>
        <mesh ref={meshRef} renderOrder={PIN_RENDER_ORDER}>
          <ringGeometry
            args={
              isActive
                ? [PIN_ACTIVE_INNER, PIN_ACTIVE_OUTER, 48]
                : [PIN_INACTIVE_INNER, PIN_INACTIVE_OUTER, 32]
            }
          />
          <meshBasicMaterial
            color={isActive ? PIN_COLOR : "#FFFFFF"}
            opacity={isActive ? 1 : 0.6}
            {...PIN_MATERIAL_PROPS}
          />
        </mesh>
        {isActive && (
          <>
            <mesh renderOrder={PIN_RENDER_ORDER}>
              <ringGeometry args={[PIN_CENTER_RADIUS, PIN_BAND_OUTER, 48]} />
              <meshBasicMaterial color={PIN_COLOR} {...PIN_MATERIAL_PROPS} />
            </mesh>
            <mesh renderOrder={PIN_RENDER_ORDER}>
              <circleGeometry args={[PIN_CENTER_RADIUS, 48]} />
              <meshBasicMaterial color="#FFFFFF" {...PIN_MATERIAL_PROPS} />
            </mesh>
          </>
        )}
        {isActive && shouldPulse && !reduceMotion && (
          <mesh ref={pulseRef} renderOrder={PIN_RENDER_ORDER - 1}>
            <ringGeometry args={[PIN_ACTIVE_INNER, PIN_ACTIVE_OUTER, 48]} />
            <meshBasicMaterial
              ref={pulseMaterialRef}
              color={PIN_COLOR}
              {...PIN_MATERIAL_PROPS}
            />
          </mesh>
        )}
      </group>
    </Billboard>
  );
}
