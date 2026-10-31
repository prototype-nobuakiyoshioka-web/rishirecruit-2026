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
// SP パネル(40dvh)拡張に合わせて島をさらに上へ(15→22)。
const MOBILE_LOOKAT_Y_OFFSET = 22;
const MAX_ROTATION = Math.PI / 4;
const DAMP_SPEED = 4;
const FOOTER_REVEAL_SCROLL_OFFSET = 0.95;
// Y を下げると カメラが低く（水平寄り）になり、水平線が下がって自然な位置に見える。
// 14 → 6 で PC (Y:5) に近い自然な俯瞰角度に。
const MOBILE_CAMERA_DIRECTION = new THREE.Vector3(-6, 6, 18).normalize();
// SP(isMobile)のみ:少し上から見下ろす角度にし、自動フィットより寄せて島の迫力を出す。
// 中間幅(PC の狭いウィンドウ)は上の DIRECTION・等倍のまま。
const SP_CAMERA_DIRECTION = new THREE.Vector3(-6, 10, 18).normalize();
const SP_CAMERA_ZOOM = 0.88;
// 縦に余裕のある端末ほど少しだけ追加で寄せる(島の下に海だけの空白ができるのを防ぐ)。
// 余裕 = (画面高 - 下部カード・看板ぶん) / 画面幅。390x844 前後(≒1.42)を基準に、それより縦長なら寄せる
const SP_BOTTOM_UI_HEIGHT_PX = 290;
const SP_ROOM_BASELINE = 1.42;
const SP_ROOM_ZOOM_RATE = 0.5;
const SP_MIN_CAMERA_ZOOM = 0.8;
// 背の低い端末(iPhone SE 等)は島を約5%小さくして、鬼脇ピンと看板の間に余裕を作る
const SP_COMPACT_CAMERA_ZOOM = 1.05;
// 下部カードを低くしたぶん、島を少し下(画面中央寄り)に置く。
// 背の低い端末(高さ720px以下)は元から島が大きく出るため、寄せずに少し引き(SP_COMPACT_CAMERA_ZOOM)、
// 下部カードに重ならないよう上寄せを強めにする
const SP_LOOKAT_Y_OFFSET = 14;
const SP_COMPACT_LOOKAT_Y_OFFSET = 32;
// SP のみ、描画全体を画面上で何px上にずらすか(端末によらず同じpx量で動く)
const SP_SCREEN_SHIFT_Y_PX = 24;
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
  const spRoom =
    (viewportHeight - SP_BOTTOM_UI_HEIGHT_PX) / Math.max(viewportSize.width, 1);
  const cameraZoom = !isMobile
    ? 1
    : isCompactMobile
      ? SP_COMPACT_CAMERA_ZOOM
      : THREE.MathUtils.clamp(
          SP_CAMERA_ZOOM - (spRoom - SP_ROOM_BASELINE) * SP_ROOM_ZOOM_RATE,
          SP_MIN_CAMERA_ZOOM,
          SP_CAMERA_ZOOM
        );
  const lookAtYOffset = isMobile
    ? isCompactMobile
      ? SP_COMPACT_LOOKAT_Y_OFFSET
      : SP_LOOKAT_Y_OFFSET
    : MOBILE_LOOKAT_Y_OFFSET;
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
        .copy(isMobile ? SP_CAMERA_DIRECTION : MOBILE_CAMERA_DIRECTION)
        .multiplyScalar(mobileCameraDistance * cameraZoom);
      // SP のみ注視点を下に下げると、島が画面上方向へ寄って見える
      camera.lookAt(0, -lookAtYOffset, 0);
    } else {
      camera.position.copy(DESKTOP_CAMERA_POSITION);
      camera.lookAt(0, 0, 0);
    }
    // 描画範囲を下にずらす = 島(と海・ピン)が画面上で上に動く。
    // lookAt と違い角度・大きさは変えず、px 単位で位置だけを調整できる
    if (isMobile) {
      camera.setViewOffset(
        viewportSize.width,
        viewportSize.height,
        0,
        SP_SCREEN_SHIFT_Y_PX,
        viewportSize.width,
        viewportSize.height
      );
    } else {
      camera.clearViewOffset();
    }
    camera.updateProjectionMatrix();
  }, [
    camera,
    cameraZoom,
    isMobile,
    lookAtYOffset,
    mobileCameraDistance,
    shouldAutoFit,
    viewportSize.height,
    viewportSize.width,
  ]);

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
      camera.lookAt(0, -lookAtYOffset, 0);
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
