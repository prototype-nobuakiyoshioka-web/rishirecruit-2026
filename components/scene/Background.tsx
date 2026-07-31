"use client";

import { useMemo } from "react";
import * as THREE from "three";

export function Background() {
  const skyColor = useMemo(() => new THREE.Color("#4FA8D5"), []);

  const seaMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        uNearColor: { value: new THREE.Color("#0A2E4E") },
        uFarColor: { value: new THREE.Color("#8FCFE8") },
        uFadeStart: { value: 60.0 },
        uFadeEnd: { value: 180.0 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;

        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uNearColor;
        uniform vec3 uFarColor;
        uniform float uFadeStart;
        uniform float uFadeEnd;
        varying vec3 vWorldPosition;

        void main() {
          float dist = length(vWorldPosition - cameraPosition);
          float t = smoothstep(uFadeStart, uFadeEnd, dist);
          vec3 color = mix(uNearColor, uFarColor, t);
          float alpha = 1.0 - smoothstep(uFadeStart * 1.5, uFadeEnd, dist);
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
  }, []);

  return (
    <>
      <primitive attach="background" object={skyColor} />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -3, 0]}
        material={seaMaterial}
      >
        <planeGeometry args={[400, 400]} />
      </mesh>
    </>
  );
}
