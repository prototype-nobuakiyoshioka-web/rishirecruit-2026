"use client";

import { useGLTF, useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";
import type { Group, Mesh } from "three";
import type { GLTF } from "three-stdlib";
import { useScrollProgressStore } from "@/store/scroll-progress-store";

const MODEL_PATH = "/models/rshiri-prototype02.glb?v=terrain-height";
const MAX_ROTATION = Math.PI / 4;
const DAMP_SPEED = 4;
const FOOTER_REVEAL_SCROLL_OFFSET = 0.95;

type RishiriGLTF = GLTF & {
  nodes: Record<string, THREE.Object3D>;
};

interface IslandModelProps {
  children?: ReactNode;
}

export function IslandModel({ children }: IslandModelProps) {
  const { nodes } = useGLTF(MODEL_PATH) as unknown as RishiriGLTF;
  const islandMesh = nodes["平面"] as Mesh | undefined;
  const groupRef = useRef<Group>(null);
  const rotationCompleteRef = useRef(false);
  const scroll = useScroll();
  const setRotationComplete = useScrollProgressStore(
    (state) => state.setRotationComplete
  );
  const resetRotationComplete = useScrollProgressStore(
    (state) => state.resetRotationComplete
  );

  useEffect(() => {
    rotationCompleteRef.current = false;
    resetRotationComplete();
  }, [resetRotationComplete]);

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    const target = THREE.MathUtils.clamp(
      (scroll.offset - 0.5) * 2 * MAX_ROTATION,
      -MAX_ROTATION,
      MAX_ROTATION
    );
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      target,
      DAMP_SPEED,
      dt
    );

    const isRotationComplete = scroll.offset >= FOOTER_REVEAL_SCROLL_OFFSET;
    if (isRotationComplete !== rotationCompleteRef.current) {
      rotationCompleteRef.current = isRotationComplete;
      setRotationComplete(isRotationComplete);
    }
  });

  return (
    <group ref={groupRef} position={[-4, -1, 0]} scale={[3, 3, 3]}>
      {islandMesh && <primitive object={islandMesh} />}
      {children}
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
