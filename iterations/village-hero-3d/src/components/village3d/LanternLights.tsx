"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { PointLight } from "three";
import { LANTERNS } from "./sceneConfig";

function FlickeringLantern({
  position,
  intensity,
}: {
  position: [number, number, number];
  intensity: number;
}) {
  const light = useRef<PointLight>(null);
  const phase = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (!light.current) return;
    const flicker =
      Math.sin(state.clock.elapsedTime * 3 + phase.current) * 0.15 + 0.85;
    light.current.intensity = intensity * flicker;
  });

  return (
    <pointLight
      ref={light}
      position={position}
      color="#ff9a5c"
      intensity={intensity}
      distance={3.5}
      decay={2}
    />
  );
}

export function LanternLights() {
  return (
    <>
      {LANTERNS.map((lantern, i) => (
        <FlickeringLantern
          key={i}
          position={lantern.position}
          intensity={lantern.intensity}
        />
      ))}
    </>
  );
}