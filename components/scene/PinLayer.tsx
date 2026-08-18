"use client";

import { AREA_POSITIONS } from "@/lib/three/pin-positions";
import { Pin } from "./Pin";

const AREAS = [
  { slug: "oshidomari", name: "鴛泊" },
  { slug: "oniwaki", name: "鬼脇" },
];

interface PinLayerProps {
  activeAreaSlug: string;
}

export function PinLayer({ activeAreaSlug }: PinLayerProps) {
  return (
    <group>
      {AREAS.map((area) => {
        const pos = AREA_POSITIONS[area.slug];
        if (!pos) return null;

        return (
          <Pin
            key={area.slug}
            areaSlug={area.slug}
            areaName={area.name}
            position={[pos.x, pos.y, pos.z]}
            isActive={area.slug === activeAreaSlug}
          />
        );
      })}
    </group>
  );
}
