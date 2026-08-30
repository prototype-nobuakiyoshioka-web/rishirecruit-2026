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

// useFrame 内でのアロケーション回避（AGENTS.md 規約）
const worldPos = new THREE.Vector3();
const ndcPos = new THREE.Vector3();

export function Pin({ areaSlug, areaName, position, isActive }: AreaPinProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  useFrame(() => {
    if (!isActive || !meshRef.current) return;

    // メッシュのワールド座標を取得し、カメラで NDC 空間へ投影
    meshRef.current.getWorldPosition(worldPos);
    ndcPos.copy(worldPos).project(camera);

    // NDC(-1..1) → CSS pixel。canvas 実サイズ(size)を使うため DPR は気にしない
    const screenX = (ndcPos.x * 0.5 + 0.5) * size.width;
    const screenY = (-ndcPos.y * 0.5 + 0.5) * size.height;
    // ndcPos.z が -1..1 の範囲外なら画面外(視錐台外)
    const inFrustum = ndcPos.z > -1 && ndcPos.z < 1;

    useActivePinPositionStore.getState().setPosition({
      x: screenX,
      y: screenY,
      visible: inFrustum,
    });
  });

  return (
    <Billboard position={position} follow userData={{ areaSlug, areaName }}>
      <mesh ref={meshRef}>
        <ringGeometry args={isActive ? [0.07, 0.11, 32] : [0.045, 0.07, 32]} />
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
