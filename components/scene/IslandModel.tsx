"use client";

import { useGLTF, useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import type { Group, Mesh } from "three";
import type { GLTF } from "three-stdlib";
import { useScrollProgressStore } from "@/store/scroll-progress-store";

const MODEL_PATH = "/models/rishiri-prototype3.glb?v=1";
const MAX_ROTATION = Math.PI / 4;
const DAMP_SPEED = 4;
const FOOTER_REVEAL_SCROLL_OFFSET = 0.95;
const MOBILE_CAMERA_DIRECTION = new THREE.Vector3(-6, 14, 18).normalize();
const MOBILE_CAMERA_FOV = 60;
const MOBILE_HORIZONTAL_MARGIN = 16;
const ADAPTIVE_FIT_MAX_WIDTH = 768;
const DESKTOP_CAMERA_POSITION = new THREE.Vector3(-6, 5, 12);

type RishiriGLTF = GLTF & {
  nodes: Record<string, THREE.Object3D>;
};

interface IslandModelProps {
  children?: ReactNode;
  isMobile?: boolean;
}

export function IslandModel({ children, isMobile = false }: IslandModelProps) {
  const { nodes, scene } = useGLTF(MODEL_PATH) as unknown as RishiriGLTF & {
    scene: THREE.Group;
  };
  // メッシュ名（旧: "平面"）に依存しないよう、GLB内の最初のMeshを取得する。
  // 明示的に "平面" があればそれを優先し、なければ scene を traverse して見つける。
  const islandMesh = useMemo<Mesh | undefined>(() => {
    const named = nodes["平面"] as Mesh | undefined;
    if (named && (named as THREE.Object3D).type === "Mesh") return named;

    let firstMesh: Mesh | undefined;
    scene.traverse((child) => {
      if (!firstMesh && (child as THREE.Object3D).type === "Mesh") {
        firstMesh = child as Mesh;
      }
    });
    return firstMesh;
  }, [nodes, scene]);
  const { camera, size: viewportSize } = useThree();
  const viewportHeight = viewportSize.height;
  const shouldAutoFit = isMobile || viewportSize.width <= ADAPTIVE_FIT_MAX_WIDTH;
  const isIntermediateViewport = !isMobile && shouldAutoFit;
  const fitCameraFov = isMobile ? MOBILE_CAMERA_FOV : 55;
  const isCompactMobile = viewportHeight <= 720;
  const mobileScale = isCompactMobile ? 3.12 : 2.63;
  const mobilePositionX = isIntermediateViewport
    ? -0.58
    : isCompactMobile
      ? -0.45
      : -0.34;
  const islandSize = useMemo(() => {
    if (!islandMesh) return null;

    const box = new THREE.Box3().setFromObject(islandMesh);
    return box.getSize(new THREE.Vector3());
  }, [islandMesh]);
  const mobileCameraDistance = useMemo(() => {
    if (!shouldAutoFit || !islandSize) return null;

    const fovRad = THREE.MathUtils.degToRad(fitCameraFov);
    const halfFovTangent = Math.tan(fovRad / 2);
    const aspect = viewportSize.width / viewportSize.height;
    const scaledWidth = islandSize.x * mobileScale;
    const scaledHeight = islandSize.y * mobileScale;
    const horizontalDistance =
      scaledWidth / 2 / (halfFovTangent * aspect);
    const verticalDistance = scaledHeight / 2 / halfFovTangent;
    const marginFactor =
      viewportSize.width /
      Math.max(viewportSize.width - MOBILE_HORIZONTAL_MARGIN, 1);

    const projectionFactor = isIntermediateViewport ? 1.06 : 1;

    return (
      Math.max(horizontalDistance, verticalDistance) *
      marginFactor *
      projectionFactor
    );
  }, [
    fitCameraFov,
    islandSize,
    isIntermediateViewport,
    mobileScale,
    shouldAutoFit,
    viewportSize.height,
    viewportSize.width,
  ]);
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

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    if (shouldAutoFit && mobileCameraDistance !== null) {
      camera.position
        .copy(MOBILE_CAMERA_DIRECTION)
        .multiplyScalar(mobileCameraDistance);
    } else {
      camera.position.copy(DESKTOP_CAMERA_POSITION);
    }
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, mobileCameraDistance, shouldAutoFit]);

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
    if (shouldAutoFit) {
      groupRef.current.position.x = THREE.MathUtils.lerp(
        mobilePositionX,
        mobilePositionX + 0.6,
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
      position={shouldAutoFit ? [mobilePositionX, 2.68, 0] : [-4, 1, 0]}
      scale={shouldAutoFit ? [mobileScale, mobileScale, mobileScale] : [3, 3, 3]}
    >
      {islandMesh && <primitive object={islandMesh} />}
      {children}
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
