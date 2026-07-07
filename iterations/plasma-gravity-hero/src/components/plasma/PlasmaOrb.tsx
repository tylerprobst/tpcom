"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  IcosahedronGeometry,
  ShaderMaterial,
  Timer,
  Vector3,
  type Group,
  type Mesh,
} from "three";
import { updateGravityState } from "./gravityState";
import {
  anchorsToFlatArray,
  createOrbAnchors,
  DRIP_ANCHOR_COUNT,
} from "./orbAnchors";
import { ORB_RADIUS, type GravityPointer } from "./plasmaConstants";
import { plasmaFragmentShader, plasmaVertexShader } from "./plasmaShader";

const gravityPoint = new Vector3();
const localGravity = new Vector3();

type PlasmaOrbProps = {
  pointer: React.MutableRefObject<GravityPointer>;
  assemblyRef: React.RefObject<Group | null>;
  reducedMotion: boolean;
  isMobile: boolean;
};

function createAnchorUniforms() {
  const flat = anchorsToFlatArray(createOrbAnchors());
  const points: Vector3[] = [];
  for (let i = 0; i < flat.length; i += 3) {
    points.push(new Vector3(flat[i], flat[i + 1], flat[i + 2]));
  }
  while (points.length < DRIP_ANCHOR_COUNT) {
    points.push(new Vector3(0, 1, 0));
  }
  return {
    uAnchorPoints: { value: points },
    uAnchorSwell: { value: new Array(DRIP_ANCHOR_COUNT).fill(0) },
  };
}

export function PlasmaOrb({
  pointer,
  assemblyRef,
  reducedMotion,
  isMobile,
}: PlasmaOrbProps) {
  const mesh = useRef<Mesh>(null);
  const smoothPointer = useRef({ x: 0, y: 0, strength: 0, pull: 0 });
  const timer = useRef<Timer | null>(null);
  const camera = useThree((state) => state.camera);
  const anchorUniforms = useMemo(() => createAnchorUniforms(), []);

  const detail = isMobile ? 8 : 9;

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
          uPullStrength: { value: 0 },
          uGravityDir: { value: [0, 0, 1] },
          uBreathe: { value: 1 },
          ...anchorUniforms,
        },
      }),
    [anchorUniforms],
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

  useFrame((_, delta) => {
    const node = mesh.current;
    const assembly = assemblyRef.current;
    if (!node || !timer.current) return;

    timer.current.update();
    const time = timer.current.getElapsed();
    const dt = Math.min(delta, 0.033);
    const orbY = Math.sin(time * 0.15) * 0.02;
    const ptr = pointer.current;

    updateGravityState(ptr, camera, orbY);

    const targetX = reducedMotion ? 0 : ptr.x;
    const targetY = reducedMotion ? 0 : ptr.y;
    const targetStrength = reducedMotion
      ? 0
      : ptr.active
        ? 0.25 + ptr.pullStrength * 0.75
        : 0;
    const targetPull = reducedMotion ? 0 : ptr.pullStrength;

    smoothPointer.current.x += (targetX - smoothPointer.current.x) * 0.04;
    smoothPointer.current.y += (targetY - smoothPointer.current.y) * 0.04;
    smoothPointer.current.strength +=
      (targetStrength - smoothPointer.current.strength) * 0.035;
    smoothPointer.current.pull += (targetPull - smoothPointer.current.pull) * 0.045;

    ptr.smoothPull = smoothPointer.current.pull;

    if (ptr.active && smoothPointer.current.pull > 0.12) {
      ptr.sustainTime += dt * smoothPointer.current.pull;
    } else {
      ptr.sustainTime = Math.max(0, ptr.sustainTime - dt * 2.2);
    }

    if (assembly) {
      assembly.rotation.y = time * 0.02;
      assembly.position.y = orbY;
      assembly.updateMatrixWorld();
    }

    gravityPoint.set(ptr.gravity[0], ptr.gravity[1], ptr.gravity[2]);
    node.worldToLocal(gravityPoint);
    localGravity.copy(gravityPoint).normalize();

    const mat = node.material as ShaderMaterial;
    mat.uniforms.uTime.value = time;
    mat.uniforms.uPointer.value = [
      smoothPointer.current.x,
      smoothPointer.current.y,
    ];
    mat.uniforms.uPointerStrength.value = smoothPointer.current.strength;
    mat.uniforms.uPullStrength.value = smoothPointer.current.pull;
    mat.uniforms.uGravityDir.value = [
      localGravity.x,
      localGravity.y,
      localGravity.z,
    ];
    mat.uniforms.uBreathe.value = reducedMotion ? 0.15 : 1;
    mat.uniforms.uAnchorSwell.value = [...ptr.anchorSwell];
  });

  return <mesh ref={mesh} geometry={geometry} material={material} />;
}