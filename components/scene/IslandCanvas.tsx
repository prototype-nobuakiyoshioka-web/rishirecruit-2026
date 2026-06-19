"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { IslandModel } from "./IslandModel";

export function IslandCanvas() {
  return (
    <Canvas camera={{ position: [0, 5, 18], fov: 45 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Suspense fallback={null}>
        <IslandModel />
      </Suspense>
      <OrbitControls target={[0, 1.5, 0]} />
    </Canvas>
  );
}
