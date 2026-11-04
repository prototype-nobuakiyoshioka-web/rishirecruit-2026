"use client";

import { ScrollControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  Component,
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useScrollProgressStore } from "@/store/scroll-progress-store";
import { Airplane } from "./Airplane";
import { Background } from "./Background";
import { Birds } from "./Birds";
import { Boat } from "./Boat";
import { Clouds } from "./Clouds";
import { FishingBoats } from "./FishingBoats";
import { IslandFallback } from "./IslandFallback";
import { IslandModel } from "./IslandModel";
import { PinLayer } from "./PinLayer";

const SHOW_PINS = true;

function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    // 判定用のコンテキストは残さない(同時に持てる数に上限がある)
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
}

// モデルの取得失敗などで 3D が落ちても、ページ全体を巻き込まないようにする
class IslandErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? <IslandFallback /> : this.props.children;
  }
}

export function IslandCanvas() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  // 最初の描画は isMobile === null で何も出さないので、ハイドレーションには影響しない
  const [isWebGLAvailable] = useState(
    () => typeof document === "undefined" || canUseWebGL()
  );
  const activeAreaSlug = useScrollProgressStore(
    (state) => state.activeAreaSlug
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateMatches = () => setIsMobile(mediaQuery.matches);

    updateMatches();
    mediaQuery.addEventListener("change", updateMatches);

    return () => mediaQuery.removeEventListener("change", updateMatches);
  }, []);

  if (isMobile === null) return null;
  if (!isWebGLAvailable) return <IslandFallback />;

  return (
    <IslandErrorBoundary>
      <Canvas
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        camera={
          isMobile
            ? { position: [-6, 14, 18], fov: 60 }
            : { position: [-6, 5, 12], fov: 55 }
        }
      >
        <Background />
        <ambientLight intensity={0.75} />
        <hemisphereLight args={["#fff7e7", "#a9c5b6", 0.5]} />
        <directionalLight position={[10, 10, 5]} intensity={1.6} />
        {/* SP はスクロール量を減らして早く鬼脇まで届くように */}
        <ScrollControls pages={isMobile ? 3 : 6} damping={0}>
          <Suspense fallback={null}>
            <IslandModel isMobile={isMobile}>
              {SHOW_PINS && (
                <PinLayer activeAreaSlug={activeAreaSlug} isMobile={isMobile} />
              )}
              <Airplane />
              <Boat />
              <FishingBoats />
              <Birds />
              <Clouds />
            </IslandModel>
          </Suspense>
        </ScrollControls>
      </Canvas>
    </IslandErrorBoundary>
  );
}
