"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { ShaderMaterial, SphereGeometry, type Group, type Mesh } from "three";
import {
  lavaCoreFragmentShader,
  lavaShellFragmentShader,
  lavaVertexShader,
} from "./plasmaShader";

const SHELL_RADIUS = 0.82;
const CORE_RADIUS = 0.52;

type PlasmaOrbProps = {
  pointer: React.MutableRefObject<{ x: number; y: number; active: boolean }>;
  reducedMotion: boolean;
  isMobile: boolean;
};

function createLavaMaterial(
  fragmentShader: string,
  phase: number,
): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: lavaVertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uPointer: { value: [0, 0] },
      uPointerStrength: { value: 0 },
      uBreathe: { value: 1 },
      uPhase: { value: phase },
    },
  });
}

export function PlasmaOrb({ pointer, reducedMotion, isMobile }: PlasmaOrbProps) {
  const group = useRef<Group>(null);
  const shell = useRef<Mesh>(null);
  const core = useRef<Mesh>(null);
  const smoothPointer = useRef({ x: 0, y: 0, strength: 0 });

  const segments = isMobile ? 112 : 160;

  const shellGeometry = useMemo(
    () => new SphereGeometry(SHELL_RADIUS, segments, segments),
    [segments],
  );
  const coreGeometry = useMemo(
    () => new SphereGeometry(CORE_RADIUS, segments, segments),
    [segments],
  );

  const shellMaterial = useMemo(() => {
    const mat = createLavaMaterial(lavaShellFragmentShader, 0);
    mat.transparent = true;
    mat.depthWrite = true;
    return mat;
  }, []);
  const coreMaterial = useMemo(
    () => createLavaMaterial(lavaCoreFragmentShader, 1.8),
    [],
  );

  useEffect(() => {
    return () => {
      shellMaterial.dispose();
      coreMaterial.dispose();
      shellGeometry.dispose();
      coreGeometry.dispose();
    };
  }, [shellMaterial, coreMaterial, shellGeometry, coreGeometry]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    const targetX = reducedMotion ? 0 : pointer.current.x;
    const targetY = reducedMotion ? 0 : pointer.current.y;
    const targetStrength = reducedMotion
      ? 0
      : pointer.current.active
        ? 1
        : 0;

    smoothPointer.current.x += (targetX - smoothPointer.current.x) * 0.035;
    smoothPointer.current.y += (targetY - smoothPointer.current.y) * 0.035;
    smoothPointer.current.strength +=
      (targetStrength - smoothPointer.current.strength) * 0.03;

    const pointerPos: [number, number] = [
      smoothPointer.current.x,
      smoothPointer.current.y,
    ];
    const strength = smoothPointer.current.strength;
    const breathe = reducedMotion ? 0.15 : 1;

    for (const mat of [shellMaterial, coreMaterial]) {
      mat.uniforms.uTime.value = time;
      mat.uniforms.uPointer.value = pointerPos;
      mat.uniforms.uPointerStrength.value = strength;
      mat.uniforms.uBreathe.value = breathe;
    }

    if (group.current) {
      group.current.rotation.y = time * 0.012;
      group.current.position.y = Math.sin(time * 0.18) * 0.03;
    }

    if (core.current) {
      core.current.position.y = Math.sin(time * 0.22 + 0.5) * 0.06 + 0.02;
      core.current.position.x = Math.sin(time * 0.15) * 0.02;
    }
  });

  return (
    <group ref={group}>
      <mesh
        ref={core}
        geometry={coreGeometry}
        material={coreMaterial}
        renderOrder={0}
      />
      <mesh
        ref={shell}
        geometry={shellGeometry}
        material={shellMaterial}
        renderOrder={1}
      />
    </group>
  );
}