"use client";

import { ScrollControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { useScrollProgressStore } from "@/store/scroll-progress-store";
import { Background } from "./Background";
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
          ? { position: [-6, 12, 19], fov: 60 }
          : { position: [-6, 5, 12], fov: 55 }
      }
    >
      <Background />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <ScrollControls pages={6} damping={0}>
        <Suspense fallback={null}>
          <IslandModel isMobile={isMobile}>
            {SHOW_PINS && <PinLayer activeAreaSlug={activeAreaSlug} />}
          </IslandModel>
        </Suspense>
      </ScrollControls>
    </Canvas>
  );
}
