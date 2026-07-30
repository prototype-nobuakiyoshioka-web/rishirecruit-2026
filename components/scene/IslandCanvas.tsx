"use client";

import { ScrollControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Link from "next/link";
import { Suspense, useState } from "react";
import type { PinItem } from "@/lib/wp/queries/pins";
import { IslandModel } from "./IslandModel";
import { PinLayer } from "./PinLayer";

interface IslandCanvasProps {
  pins: PinItem[];
}

const PIN_TYPE_LABELS: Record<PinItem["type"], string> = {
  job: "求人",
  spot: "観光地",
  event: "イベント",
};

const PIN_DETAIL_PATHS: Record<PinItem["type"], string> = {
  job: "/jobs",
  spot: "/spots",
  event: "/events",
};

const SHOW_PINS = false;

export function IslandCanvas({ pins }: IslandCanvasProps) {
  const [selectedPin, setSelectedPin] = useState<PinItem | null>(null);

  return (
    <>
      <Canvas camera={{ position: [0, 3, 10], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <ScrollControls pages={3} damping={0}>
          <Suspense fallback={null}>
            <IslandModel>
              {SHOW_PINS && <PinLayer pins={pins} onSelect={setSelectedPin} />}
            </IslandModel>
          </Suspense>
        </ScrollControls>
      </Canvas>

      {selectedPin && (
        <div className="fixed right-[var(--space-6)] bottom-[var(--space-6)] z-50 w-[min(20rem,calc(100vw-var(--space-6)*2))] rounded-[var(--radius-lg)] bg-[color:var(--c-paper)] p-[var(--space-5)] text-[color:var(--c-text-primary)] shadow-[var(--shadow-lg)]">
          <div className="flex items-start justify-between gap-[var(--space-4)]">
            <p className="text-xs font-black tracking-normal text-[color:var(--c-deep-ocean)]">
              {PIN_TYPE_LABELS[selectedPin.type]}
            </p>
            <button
              type="button"
              aria-label="閉じる"
              className="grid size-8 place-items-center rounded-full bg-[color:var(--c-sky)] text-sm font-black text-[color:var(--c-deep-ocean)]"
              onClick={() => setSelectedPin(null)}
            >
              ×
            </button>
          </div>
          <h2 className="mt-[var(--space-2)] text-xl font-black leading-tight tracking-normal">
            {selectedPin.title}
          </h2>
          {selectedPin.catchCopy && (
            <p className="mt-[var(--space-3)] text-sm font-bold leading-relaxed">
              {selectedPin.catchCopy}
            </p>
          )}
          <Link
            href={`${PIN_DETAIL_PATHS[selectedPin.type]}/${selectedPin.slug}`}
            className="mt-[var(--space-4)] inline-flex min-h-11 items-center justify-center rounded-full bg-[color:var(--c-deep-ocean)] px-[var(--space-5)] text-sm font-black text-[color:var(--c-paper)]"
          >
            詳細を見る
          </Link>
        </div>
      )}
    </>
  );
}
