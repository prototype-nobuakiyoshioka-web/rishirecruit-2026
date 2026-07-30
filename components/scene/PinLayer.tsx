"use client";

import { PIN_POSITIONS } from "@/lib/three/pin-positions";
import type { PinItem } from "@/lib/wp/queries/pins";
import { Pin } from "./Pin";

interface PinLayerProps {
  pins: PinItem[];
  onSelect: (pin: PinItem) => void;
}

export function PinLayer({ pins, onSelect }: PinLayerProps) {
  return (
    <>
      {pins.map((pin) => {
        const position = PIN_POSITIONS[pin.positionKey];
        if (!position) return null;

        return (
          <Pin
            key={pin.id}
            pin={pin}
            position={[position.x, position.y, position.z]}
            onSelect={onSelect}
          />
        );
      })}
    </>
  );
}
