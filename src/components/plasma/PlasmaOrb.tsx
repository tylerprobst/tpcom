"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { IcosahedronGeometry, ShaderMaterial, Timer, type Mesh } from "three";
import { plasmaFragmentShader, plasmaVertexShader } from "./plasmaShader";

const ORB_RADIUS = 0.82;

type PlasmaOrbProps = {
  pointer: React.MutableRefObject<{ x: number; y: number; active: boolean }>;
  reducedMotion: boolean;
  isMobile: boolean;
};

export function PlasmaOrb({ pointer, reducedMotion, isMobile }: PlasmaOrbProps) {
  const mesh = useRef<Mesh>(null);
  const smoothPointer = useRef({ x: 0, y: 0, strength: 0 });
  const timer = useRef<Timer | null>(null);

  const detail = isMobile ? 7 : 8;

  const geometry = useMemo(
    () => new IcosahedronGeometry(ORB_RADIUS, detail),
    [detail],
  );

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: plasmaVertexShader,
        fragmentShader: plasmaFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uPointer: { value: [0, 0] },
          uPointerStrength: { value: 0 },
          uBreathe: { value: 1 },
        },
      }),
    [],
  );

  useEffect(() => {
    const t = new Timer();
    t.connect(document);
    timer.current = t;
    return () => {
      t.disconnect();
      material.dispose();
      geometry.dispose();
    };
  }, [material, geometry]);

  useFrame(() => {
    if (!mesh.current || !timer.current) return;

    timer.current.update();
    const time = timer.current.getElapsed();

    const targetX = reducedMotion ? 0 : pointer.current.x;
    const targetY = reducedMotion ? 0 : pointer.current.y;
    const targetStrength = reducedMotion
      ? 0
      : pointer.current.active
        ? 1
        : 0;

    smoothPointer.current.x += (targetX - smoothPointer.current.x) * 0.04;
    smoothPointer.current.y += (targetY - smoothPointer.current.y) * 0.04;
    smoothPointer.current.strength +=
      (targetStrength - smoothPointer.current.strength) * 0.035;

    const mat = mesh.current.material as ShaderMaterial;
    mat.uniforms.uTime.value = time;
    mat.uniforms.uPointer.value = [
      smoothPointer.current.x,
      smoothPointer.current.y,
    ];
    mat.uniforms.uPointerStrength.value = smoothPointer.current.strength;
    mat.uniforms.uBreathe.value = reducedMotion ? 0.15 : 1;

    mesh.current.rotation.y = time * 0.02;
    mesh.current.position.y = Math.sin(time * 0.15) * 0.02;
  });

  return <mesh ref={mesh} geometry={geometry} material={material} />;
};