"use client";

import type { ThreeEvent } from "@react-three/fiber";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { Group } from "three";
import type { PinItem } from "@/lib/wp/queries/pins";

const PIN_COLORS: Record<PinItem["type"], string> = {
  job: "#FF7B5B",
  spot: "#F4B942",
  event: "#FF8FB1",
};

interface PinProps {
  pin: PinItem;
  position: [number, number, number];
  onSelect: (pin: PinItem) => void;
}

export function Pin({ pin, position, onSelect }: PinProps) {
  const groupRef = useRef<Group>(null);
  const { camera } = useThree();
  const [hovered, setHovered] = useState(false);
  const color = PIN_COLORS[pin.type];

  useEffect(() => {
    if (!hovered) return;

    const previousCursor = document.body.style.cursor;
    document.body.style.cursor = "pointer";

    return () => {
      document.body.style.cursor = previousCursor;
    };
  }, [hovered]);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.quaternion.copy(camera.quaternion);
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(pin);
  };

  return (
    <group
      ref={groupRef}
      position={position}
      scale={hovered ? 1.2 : 1}
      onClick={handleClick}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.25, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          roughness={0.45}
        />
      </mesh>
      <mesh position={[0, 0.14, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.16, 0.32, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          roughness={0.45}
        />
      </mesh>
      {hovered && (
        <mesh position={[0, 0.4, -0.01]}>
          <torusGeometry args={[0.34, 0.03, 8, 28]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}
