"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { Group, Object3D } from "three";
import { AIRPLANE_SCALE, createAirplaneFlight, flightProgress } from "@/lib/three/airplane-flight";

const MODEL_PATH = "/models/rishiri-airplane.glb";

export function Airplane() {
  const { scene } = useGLTF(MODEL_PATH);
  const aircraft = useMemo(() => scene.clone(true), [scene]);
  const flight = useMemo(() => createAirplaneFlight(), []);
  const propellers = useRef<(Object3D | undefined)[]>([]);
  useEffect(() => {
    propellers.current = [aircraft.getObjectByName("PropellerLeft"), aircraft.getObjectByName("PropellerRight")];
  }, [aircraft]);
  const group = useRef<Group>(null);
  const elapsed = useRef(0);
  const reducedMotion = useRef(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { reducedMotion.current = query.matches; };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;
    // 背景タブから戻った際の飛行位置のジャンプも抑える。
    if (!reducedMotion.current) elapsed.current += Math.min(delta, 0.05);
    const frame = flightProgress(reducedMotion.current ? 0 : elapsed.current) * flight.frameCount;
    const index = Math.min(Math.floor(frame), flight.frameCount - 1);
    const mix = frame - index;
    group.current.position.lerpVectors(flight.positions[index], flight.positions[index + 1], mix);
    group.current.quaternion.slerpQuaternions(flight.rotations[index], flight.rotations[index + 1], mix);
    for (const propeller of propellers.current) {
      if (propeller) propeller.rotation.set(0, 0, reducedMotion.current ? 0 : elapsed.current * 19);
    }
  });

  return (
    <group ref={group} name="AirportFlight" position={flight.positions[0]} quaternion={flight.rotations[0]}>
      <primitive object={aircraft} scale={AIRPLANE_SCALE} />
    </group>
  );
}
