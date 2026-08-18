"use client";

import { Billboard } from "@react-three/drei";
import * as THREE from "three";

interface AreaPinProps {
  areaSlug: string;
  areaName: string;
  position: [number, number, number];
  isActive: boolean;
}

export function Pin({ areaSlug, areaName, position, isActive }: AreaPinProps) {
  return (
    <Billboard position={position} follow userData={{ areaSlug, areaName }}>
      <mesh>
        <ringGeometry args={isActive ? [0.1, 0.15, 32] : [0.06, 0.09, 32]} />
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
