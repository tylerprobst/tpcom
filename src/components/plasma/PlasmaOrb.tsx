"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { ShaderMaterial, type Mesh } from "three";
import { plasmaFragmentShader, plasmaVertexShader } from "./plasmaShader";

type PlasmaOrbProps = {
  pointer: React.MutableRefObject<{ x: number; y: number; active: boolean }>;
  reducedMotion: boolean;
  isMobile: boolean;
};

export function PlasmaOrb({ pointer, reducedMotion, isMobile }: PlasmaOrbProps) {
  const mesh = useRef<Mesh>(null);
  const smoothPointer = useRef({ x: 0, y: 0, strength: 0 });
  const material = useMemo(() => {
    const mat = new ShaderMaterial({
      vertexShader: plasmaVertexShader,
      fragmentShader: plasmaFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uPointer: { value: [0, 0] },
        uPointerStrength: { value: 0 },
        uBreathe: { value: 1 },
      },
    });
    return mat;
  }, []);

  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  const detail = isMobile ? 5 : 6;

  useFrame((state) => {
    if (!mesh.current) return;

    const mat = mesh.current.material as ShaderMaterial;
    const time = state.clock.elapsedTime;

    const targetX = reducedMotion ? 0 : pointer.current.x;
    const targetY = reducedMotion ? 0 : pointer.current.y;
    const targetStrength = reducedMotion
      ? 0
      : pointer.current.active
        ? 1
        : 0;

    smoothPointer.current.x += (targetX - smoothPointer.current.x) * 0.08;
    smoothPointer.current.y += (targetY - smoothPointer.current.y) * 0.08;
    smoothPointer.current.strength +=
      (targetStrength - smoothPointer.current.strength) * 0.06;

    mat.uniforms.uTime.value = time;
    mat.uniforms.uPointer.value = [
      smoothPointer.current.x,
      smoothPointer.current.y,
    ];
    mat.uniforms.uPointerStrength.value = smoothPointer.current.strength;
    mat.uniforms.uBreathe.value = reducedMotion ? 0.15 : 1;

    mesh.current.rotation.y = time * 0.04;
    mesh.current.rotation.x = Math.sin(time * 0.2) * 0.05;
  });

  return (
    <mesh ref={mesh} material={material}>
      <icosahedronGeometry args={[1.35, detail]} />
    </mesh>
  );
}