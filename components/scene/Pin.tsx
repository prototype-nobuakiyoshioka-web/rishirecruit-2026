"use client";

import { Billboard } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useActivePinPositionStore } from "@/store/active-pin-position-store";

interface AreaPinProps {
  areaSlug: string;
  areaName: string;
  position: [number, number, number];
  isActive: boolean;
}

// 活性/非活性ピンのリング寸法（Island group ローカル単位）。
// 新モデル (rishiri-prototype3.glb) は旧の約 30 倍サイズのため、寸法もスケール。
const PIN_ACTIVE_INNER = 1.2;
const PIN_ACTIVE_OUTER = 1.9;
const PIN_INACTIVE_INNER = 0.75;
const PIN_INACTIVE_OUTER = 1.2;

// useFrame 内でのアロケーション回避（AGENTS.md 規約）
const worldPos = new THREE.Vector3();
const edgeWorldPos = new THREE.Vector3();
const ndcCenter = new THREE.Vector3();
const ndcEdge = new THREE.Vector3();
const cameraUp = new THREE.Vector3();
const worldScale = new THREE.Vector3();

export function Pin({ areaSlug, areaName, position, isActive }: AreaPinProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  useFrame(() => {
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
      <mesh ref={meshRef}>
        <ringGeometry
          args={
            isActive
              ? [PIN_ACTIVE_INNER, PIN_ACTIVE_OUTER, 32]
              : [PIN_INACTIVE_INNER, PIN_INACTIVE_OUTER, 32]
          }
        />
        <meshBasicMaterial
          color="#FFFFFF"
          transparent
          opacity={isActive ? 1 : 0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </Billboard>
  );
}
