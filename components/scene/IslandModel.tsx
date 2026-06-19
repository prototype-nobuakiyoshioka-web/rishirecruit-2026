"use client";

import { useGLTF } from "@react-three/drei";
import { useRef } from "react";
import type { Group, Mesh } from "three";
import type { GLTF } from "three-stdlib";

const MODEL_PATH = "/models/rishiri-prototype1.glb";

type RishiriGLTF = GLTF & {
  nodes: {
    base: Mesh;
    "海面": Mesh;
    peak: Mesh;
    mid: Mesh;
  };
};

export function IslandModel() {
  const { nodes } = useGLTF(MODEL_PATH) as unknown as RishiriGLTF;
  const groupRef = useRef<Group>(null);

  return (
    <group ref={groupRef}>
      <primitive object={nodes.base} />
      <primitive object={nodes["海面"]} />
      <primitive object={nodes.peak} />
      <primitive object={nodes.mid} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
