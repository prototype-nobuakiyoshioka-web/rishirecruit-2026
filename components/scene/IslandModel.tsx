"use client";

import { useGLTF, useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import type { Group } from "three";
import { useScrollProgressStore } from "@/store/scroll-progress-store";

const MODEL_PATH = "/models/rishiri-miniature.glb?v=mountain-hut-removed-1";
const MOBILE_MODEL_PATH = "/models/rishiri-miniature-mobile.glb?v=mountain-hut-removed-1";
// 1km=5単位の GLB を既存の画面レイアウトに合わせる倍率。
// PC / SP で見え方が異なるため個別に持つ。値を下げると小さく、上げると大きくなる。
const MODEL_BASE_SCALE_DESKTOP = 0.048;
const MODEL_BASE_SCALE_MOBILE = 1.15;
// SP 時にカメラの注視点を下にずらすことで、島を画面上方向へ寄せる。
// カメラを寝かせた（DIRECTION Y=6）ので、LOOKAT も控えめに。
const MOBILE_LOOKAT_Y_OFFSET = 15;
const MAX_ROTATION = Math.PI / 4;
const DAMP_SPEED = 4;
const FOOTER_REVEAL_SCROLL_OFFSET = 0.95;
// Y を下げると カメラが低く（水平寄り）になり、水平線が下がって自然な位置に見える。
// 14 → 6 で PC (Y:5) に近い自然な俯瞰角度に。
const MOBILE_CAMERA_DIRECTION = new THREE.Vector3(-6, 6, 18).normalize();
const MOBILE_CAMERA_FOV = 60;
const MOBILE_HORIZONTAL_MARGIN = 16;
const ADAPTIVE_FIT_MAX_WIDTH = 768;
const DESKTOP_CAMERA_POSITION = new THREE.Vector3(-6, 5, 12);

interface IslandModelProps {
  children?: ReactNode;
  isMobile?: boolean;
}

// 表示から除外する GLB ノード名。完全一致 or "*" 接尾でプレフィックス一致。
// - Vegetation: 木（Leaves + Trunk）
// - Terrain_Cliff: 島の土台の縁（厚みのあるベージュのプラットフォーム）
// - HimePond*: 姫沼およびそのランドマーク一式（LandmarkGrass/Water/Wood/LeavesSage/Trunk）
const HIDDEN_NODE_NAMES = ["Vegetation", "Terrain_Cliff", "HimePond*"];

export function IslandModel({ children, isMobile = false }: IslandModelProps) {
  const { scene } = useGLTF(isMobile ? MOBILE_MODEL_PATH : MODEL_PATH, "/draco/") as unknown as {
    scene: THREE.Group;
  };
  // GLB のパステル色とベベル法線をそのまま使用する。
  const islandObject = scene;

  // 指定ノードを非表示にする。GLB からは消さず visible = false のみ。
  // 名前末尾が "*" のパターンはプレフィックス一致で複数ノードを一括除外する。
  useEffect(() => {
    scene.traverse((child) => {
      const hidden = HIDDEN_NODE_NAMES.some((pattern) =>
        pattern.endsWith("*")
          ? child.name.startsWith(pattern.slice(0, -1))
          : child.name === pattern,
      );
      if (hidden) child.visible = false;
    });
  }, [scene]);

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
    if (!islandObject) return null;

    const box = new THREE.Box3().setFromObject(islandObject);
    return box.getSize(new THREE.Vector3());
  }, [islandObject]);
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
      // SP のみ注視点を下に下げると、島が画面上方向へ寄って見える
      camera.lookAt(0, -MOBILE_LOOKAT_Y_OFFSET, 0);
    } else {
      camera.position.copy(DESKTOP_CAMERA_POSITION);
      camera.lookAt(0, 0, 0);
    }
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
      // SP のみ毎フレーム lookAt を強制（HMR で定数変更が即反映されるようにする）
      camera.lookAt(0, -MOBILE_LOOKAT_Y_OFFSET, 0);
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

  const finalMobileScale = mobileScale * MODEL_BASE_SCALE_MOBILE;
  const finalDesktopScale = 3 * MODEL_BASE_SCALE_DESKTOP;

  return (
    <group
      ref={groupRef}
      position={shouldAutoFit ? [mobilePositionX, 2.68, 0] : [-4, 1, 0]}
      scale={
        shouldAutoFit
          ? [finalMobileScale, finalMobileScale, finalMobileScale]
          : [finalDesktopScale, finalDesktopScale, finalDesktopScale]
      }
    >
      <primitive object={islandObject} />
      {children}
    </group>
  );
}
