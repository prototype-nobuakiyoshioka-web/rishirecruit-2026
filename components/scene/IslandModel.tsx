"use client";

import { useGLTF, useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
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
  isMobile?: boolean;
}

export function IslandModel({ children, isMobile = false }: IslandModelProps) {
  const { nodes } = useGLTF(MODEL_PATH) as unknown as RishiriGLTF;
  const islandMesh = nodes["平面"] as Mesh | undefined;
  const viewportHeight = useThree((state) => state.size.height);
  const mobileScale = viewportHeight <= 720 ? 3.12 : 2.63;
  const groupRef = useRef<Group>(null);
  const rotationCompleteRef = useRef(false);
  const currentAreaRef = useRef<string>("oshidomari");
  const scroll = useScroll();
  const setRotationComplete = useScrollProgressStore(
    (state) => state.setRotationComplete
  );
  const resetRotationComplete = useScrollProgressStore(
    (state) => state.resetRotationComplete
  );
  const setRotationAngle = useScrollProgressStore(
    (state) => state.setRotationAngle
  );
  const setActiveAreaSlug = useScrollProgressStore(
    (state) => state.setActiveAreaSlug
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
    if (isMobile) {
      groupRef.current.position.x = THREE.MathUtils.lerp(
        -0.15,
        0.45,
        scroll.offset
      );
    }
    setRotationAngle(groupRef.current.rotation.y);

    const nextArea = scroll.offset < 0.5 ? "oshidomari" : "oniwaki";
    if (nextArea !== currentAreaRef.current) {
      currentAreaRef.current = nextArea;
      setActiveAreaSlug(nextArea);
    }

    const isRotationComplete = scroll.offset >= FOOTER_REVEAL_SCROLL_OFFSET;
    if (isRotationComplete !== rotationCompleteRef.current) {
      rotationCompleteRef.current = isRotationComplete;
      setRotationComplete(isRotationComplete);
    }
  });

  return (
    <group
      ref={groupRef}
      position={isMobile ? [-0.15, 3, 0] : [-4, 1, 0]}
      scale={isMobile ? [mobileScale, mobileScale, mobileScale] : [3, 3, 3]}
    >
      {islandMesh && <primitive object={islandMesh} />}
      {children}
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
