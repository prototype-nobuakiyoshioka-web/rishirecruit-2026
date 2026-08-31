"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export function Background() {
  const skyColor = useMemo(() => new THREE.Color("#4FA8D5"), []);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const seaGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(400, 400, 140, 140);
    const pos = geo.attributes.position;
    const randoms = new Float32Array(pos.count);

    for (let i = 0; i < pos.count; i += 1) {
      const value = Math.sin(i * 12.9898) * 43758.5453123;
      randoms[i] = value - Math.floor(value);
    }

    geo.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));
    return geo;
  }, []);

  const seaMaterial = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uWaveHeight: { value: 0.5 },
        uWaveSpeed: { value: 0.5 },
        uColorNear: { value: new THREE.Color("#1A8FA8") },
        uColorLight: { value: new THREE.Color("#7FE3E8") },
        uColorDark: { value: new THREE.Color("#2BA8C4") },
        uSkyColor: { value: new THREE.Color("#4FA8D5") },
        uFoamColor: { value: new THREE.Color("#FFFFFF") },
        // SP はカメラ距離が大きく、80-250 のままだと波が空色にブレンドされて消える。
        // 距離を広げ、遠景でも波が見えるようにする。
        uFadeStart: { value: 200.0 },
        uFadeEnd: { value: 500.0 },
      },
      vertexShader: `
        attribute float aRandom;
        uniform float uTime;
        uniform float uWaveHeight;
        uniform float uWaveSpeed;

        varying vec3 vWorldPosition;
        varying float vRandom;
        varying float vHeight;

        void main() {
          vec3 pos = position;

          float wave1 = sin(pos.x * 0.18 + uTime * uWaveSpeed) *
                        cos(pos.y * 0.13 + uTime * uWaveSpeed * 0.6);

          float wave2 = sin(pos.x * 0.31 + pos.y * 0.17 + uTime * uWaveSpeed * 0.75) * 0.6;

          float wave3 = cos(pos.x * 0.07 - pos.y * 0.11 + uTime * uWaveSpeed * 0.4) * 0.8;

          float wave = (wave1 + wave2 + wave3) / 2.4;

          float randomOffset = (aRandom - 0.5) * 0.55;

          pos.z += (wave + randomOffset) * uWaveHeight;

          vRandom = aRandom;
          vHeight = wave + randomOffset;

          vec4 worldPos = modelMatrix * vec4(pos, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColorNear;
        uniform vec3 uColorLight;
        uniform vec3 uColorDark;
        uniform vec3 uSkyColor;
        uniform vec3 uFoamColor;
        uniform float uFadeStart;
        uniform float uFadeEnd;

        varying vec3 vWorldPosition;
        varying float vRandom;
        varying float vHeight;

        void main() {
          vec3 dx = dFdx(vWorldPosition);
          vec3 dy = dFdy(vWorldPosition);
          vec3 normal = normalize(cross(dx, dy));

          float lighting = dot(normal, normalize(vec3(0.3, 1.0, 0.5)));
          lighting = lighting * 0.5 + 0.5;

          float colorMix = lighting * 0.6 + vRandom * 0.4;
          vec3 baseColor = mix(uColorDark, uColorLight, colorMix);

          float dist = length(vWorldPosition - cameraPosition);

          float nearFactor = 1.0 - smoothstep(0.0, 60.0, dist);
          float farFactor = smoothstep(uFadeStart, uFadeEnd, dist);

          vec3 color = baseColor;
          color = mix(color, uColorNear, nearFactor * 0.5);
          color = mix(color, uSkyColor, farFactor * 0.8);

          float fade = 1.0 - smoothstep(uFadeStart, uFadeEnd, dist);

          float foamThreshold = 0.55;
          float foamNoise = vRandom;
          float heightFactor = smoothstep(foamThreshold, foamThreshold + 0.3, vHeight);
          float randomFactor = step(0.82, foamNoise);

          float foam = heightFactor * randomFactor;
          color = mix(color, uFoamColor, foam * 0.6);

          gl_FragColor = vec4(color, fade * 0.7);
        }
      `,
    });
    Object.assign(material, { flatShading: true });
    return material;
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <>
      <primitive attach="background" object={skyColor} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <primitive object={seaGeometry} attach="geometry" />
        <primitive object={seaMaterial} ref={materialRef} attach="material" />
      </mesh>
    </>
  );
}
