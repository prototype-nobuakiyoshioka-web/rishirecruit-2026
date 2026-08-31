"use client";

import { useGLTF, useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import type { Group } from "three";
import { useScrollProgressStore } from "@/store/scroll-progress-store";

const MODEL_PATH = "/models/rishiri-prototype3.glb?v=1";
// 新モデルの世界単位が旧モデルと違うため、全体を縮小する倍率。
// PC / SP で見え方が異なるため個別に持つ。値を下げると小さく、上げると大きくなる。
const MODEL_BASE_SCALE_DESKTOP = 0.04;
const MODEL_BASE_SCALE_MOBILE = 1;
// SP 時にカメラの注視点を下にずらすことで、島を画面上方向へ寄せる。
// 値を大きくするほど島が画面上に上がる。
const MOBILE_LOOKAT_Y_OFFSET = 50;
const MAX_ROTATION = Math.PI / 4;
const DAMP_SPEED = 4;
const FOOTER_REVEAL_SCROLL_OFFSET = 0.95;
const MOBILE_CAMERA_DIRECTION = new THREE.Vector3(-6, 14, 18).normalize();
const MOBILE_CAMERA_FOV = 60;
const MOBILE_HORIZONTAL_MARGIN = 16;
const ADAPTIVE_FIT_MAX_WIDTH = 768;
const DESKTOP_CAMERA_POSITION = new THREE.Vector3(-6, 5, 12);

// GLB 内のオブジェクト名に対応する色（Blender の Collection 名と揃える）。
// null / undefined を指定するとそのパーツは元の色のまま。
const ISLAND_PART_COLORS: Record<string, string | null> = {
  fumoto: "#3FA85C",   // 麓（緑）
  mid: "#2E7D45",      // 中腹（濃緑）
  sanchou: "#F5F7FA",  // 山頂（雪をかぶった白）
};

interface IslandModelProps {
  children?: ReactNode;
  isMobile?: boolean;
}

export function IslandModel({ children, isMobile = false }: IslandModelProps) {
  const { scene } = useGLTF(MODEL_PATH) as unknown as { scene: THREE.Group };
  // 新モデルは fumoto / mid / sanchou の複数オブジェクト構成のため、
  // シーン全体をそのまま表示する（単一メッシュ抽出では山頂・中腹が欠落する）。
  const islandObject = scene;

  // GLB 内のメッシュ / オブジェクト名にマッチする色を適用する。
  // マテリアルは他インスタンスと共有される可能性があるため clone してから書き換える。
  useEffect(() => {
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!(mesh.isMesh)) return;

      // 自身の名前 or 親オブジェクト名を辿って一致するキーを探す
      let target: THREE.Object3D | null = mesh;
      let colorHex: string | null | undefined;
      while (target) {
        const key = target.name;
        if (key && key in ISLAND_PART_COLORS) {
          colorHex = ISLAND_PART_COLORS[key];
          break;
        }
        target = target.parent;
      }
      if (!colorHex) return;

      const original = mesh.material as THREE.Material | THREE.Material[];
      const applyColor = (_mat: THREE.Material) => {
        // Blender の PBR マテリアル（metalness/roughness、頂点色、テクスチャ）を継承すると
        // 環境マップ無しでは暗く出るため、フラットな MeshStandardMaterial に置き換える。
        return new THREE.MeshStandardMaterial({
          color: new THREE.Color(colorHex!),
          roughness: 0.9,
          metalness: 0,
          flatShading: true,
        });
      };
      mesh.material = Array.isArray(original)
        ? original.map(applyColor)
        : applyColor(original);
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

useGLTF.preload(MODEL_PATH);
