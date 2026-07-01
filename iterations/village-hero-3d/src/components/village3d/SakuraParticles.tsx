"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Points } from "three";
import { SAKURA_COUNT } from "./sceneConfig";
import { useMouseParallaxRef } from "./MouseParallaxContext";

export function SakuraParticles() {
  const points = useRef<Points>(null);
  const mouse = useMouseParallaxRef();

  const { positions, velocities, phases } = useMemo(() => {
    const positions = new Float32Array(SAKURA_COUNT * 3);
    const velocities = new Float32Array(SAKURA_COUNT * 3);
    const phases = new Float32Array(SAKURA_COUNT);

    for (let i = 0; i < SAKURA_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = Math.random() * 8 - 2;
      positions[i * 3 + 2] = -0.5 - Math.random() * 4;

      velocities[i * 3] = (Math.random() - 0.5) * 0.003;
      velocities[i * 3 + 1] = -(0.008 + Math.random() * 0.012);
      velocities[i * 3 + 2] = 0;

      phases[i] = Math.random() * Math.PI * 2;
    }

    return { positions, velocities, phases };
  }, []);

  useFrame((state) => {
    if (!points.current) return;

    const pos = points.current.geometry.attributes.position.array as Float32Array;
    const t = state.clock.elapsedTime;
    const wind = mouse.current.x * 0.002;

    for (let i = 0; i < SAKURA_COUNT; i++) {
      const i3 = i * 3;
      pos[i3] += velocities[i3] + wind + Math.sin(t * 0.8 + phases[i]) * 0.002;
      pos[i3 + 1] += velocities[i3 + 1];
      pos[i3 + 2] += Math.sin(t * 0.5 + phases[i]) * 0.001;

      if (pos[i3 + 1] < -3.5) {
        pos[i3] = (Math.random() - 0.5) * 14;
        pos[i3 + 1] = 3.5 + Math.random() * 2;
        pos[i3 + 2] = -0.5 - Math.random() * 3;
      }
    }

    points.current.geometry.attributes.position.needsUpdate = true;
    points.current.rotation.y = mouse.current.x * 0.02;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={SAKURA_COUNT}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#ffb7c5"
        transparent
        opacity={0.85}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}