"use client";

import { ScrollControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { useScrollProgressStore } from "@/store/scroll-progress-store";
import { Airplane } from "./Airplane";
import { Background } from "./Background";
import { Boat } from "./Boat";
import { IslandModel } from "./IslandModel";
import { PinLayer } from "./PinLayer";

const SHOW_PINS = true;

export function IslandCanvas() {
  const [isMobile, setIsMobile] = useState(false);
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

  return (
    <Canvas
      camera={
        isMobile
          ? { position: [-6, 14, 18], fov: 60 }
          : { position: [-6, 5, 12], fov: 55 }
      }
    >
      <Background />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      {/* SP はスクロール量を減らして早く鬼脇まで届くように */}
      <ScrollControls pages={isMobile ? 3 : 6} damping={0}>
        <Suspense fallback={null}>
          <IslandModel isMobile={isMobile}>
            {SHOW_PINS && <PinLayer activeAreaSlug={activeAreaSlug} />}
            <Boat />
            <Airplane />
          </IslandModel>
        </Suspense>
      </ScrollControls>
    </Canvas>
  );
}
