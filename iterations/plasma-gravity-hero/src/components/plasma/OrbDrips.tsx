"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  CylinderGeometry,
  IcosahedronGeometry,
  Quaternion,
  ShaderMaterial,
  Timer,
  Vector3,
  type Group,
  type Mesh,
} from "three";
import { dripFragmentShader, dripVertexShader } from "./dripShader";
import { updateGravityState } from "./gravityState";
import {
  anchorToPosition,
  anchorsToFlatArray,
  createOrbAnchors,
  DRIP_ANCHOR_COUNT,
} from "./orbAnchors";
import { ORB_RADIUS, type GravityPointer } from "./plasmaConstants";
import { strandFragmentShader, strandVertexShader } from "./strandShader";

const PEEL_DURATION = 0.9;
const SWELL_DURATION = 0.28;
const SNAP_DURATION = 0.14;
const RETURN_DURATION = 0.55;
const MAX_DETACHED = 8;

type DripState =
  | "idle"
  | "swelling"
  | "peeling"
  | "snapping"
  | "detached"
  | "returning";

type Drip = {
  state: DripState;
  peel: number;
  swell: number;
  snapT: number;
  returnT: number;
  anchorX: number;
  anchorY: number;
  anchorZ: number;
  activateAt: number;
  vx: number;
  vy: number;
  vz: number;
  scale: number;
  seed: number;
  cooldown: number;
};

type OrbDripsProps = {
  pointer: React.MutableRefObject<GravityPointer>;
  assemblyRef: React.RefObject<Group | null>;
  reducedMotion: boolean;
  isMobile: boolean;
};

const gravityWorld = new Vector3();
const gravityLocal = new Vector3();
const returnTarget = new Vector3();
const basePos = new Vector3();
const headPos = new Vector3();
const axisDir = new Vector3();
const gravityBias = new Vector3();
const strandQuat = new Quaternion();
const Y_AXIS = new Vector3(0, 1, 0);

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function createAnchorUniforms(flatAnchors: number[]) {
  const points: Vector3[] = [];
  for (let i = 0; i < flatAnchors.length; i += 3) {
    points.push(new Vector3(flatAnchors[i], flatAnchors[i + 1], flatAnchors[i + 2]));
  }
  while (points.length < DRIP_ANCHOR_COUNT) {
    points.push(new Vector3(0, 1, 0));
  }
  return {
    uAnchorPoints: { value: points },
    uAnchorSwell: { value: new Array(DRIP_ANCHOR_COUNT).fill(0) },
  };
}

function computeHeadPosition(
  anchor: { x: number; y: number; z: number },
  peelT: number,
  pull: number,
  gravity: Vector3,
  out: Vector3,
): void {
  axisDir.set(anchor.x, anchor.y, anchor.z).normalize();
  const peelLen = 0.02 + peelT * 0.32;
  anchorToPosition(anchor, ORB_RADIUS + peelLen, headPos);

  gravityBias.copy(gravity).sub(headPos).normalize();
  const bias = peelT * pull * 0.12 * easeInOutCubic(peelT);
  out.copy(headPos).addScaledVector(gravityBias, bias);
}

function updateStrand(
  strand: Mesh,
  anchor: { x: number; y: number; z: number },
  head: Vector3,
  pinch: number,
  thick: number,
) {
  axisDir.set(anchor.x, anchor.y, anchor.z).normalize();
  anchorToPosition(anchor, ORB_RADIUS * 0.992, basePos);

  const length = Math.max(0.02, basePos.distanceTo(head) - thick * 0.35);
  const mid = basePos.clone().add(head).multiplyScalar(0.5);

  strand.position.copy(mid);
  strandQuat.setFromUnitVectors(Y_AXIS, axisDir);
  strand.quaternion.copy(strandQuat);
  strand.scale.set(1, length, 1);
  strand.visible = length > 0.025;

  const mat = strand.material as ShaderMaterial;
  mat.uniforms.uPinch.value = pinch;
  mat.uniforms.uThick.value = thick;
}

export function OrbDrips({
  pointer,
  assemblyRef,
  reducedMotion,
  isMobile,
}: OrbDripsProps) {
  const anchors = useMemo(() => createOrbAnchors(), []);
  const flatAnchors = useMemo(() => anchorsToFlatArray(anchors), [anchors]);
  const anchorUniforms = useMemo(
    () => createAnchorUniforms(flatAnchors),
    [flatAnchors],
  );

  const headMeshes = useRef<(Mesh | null)[]>([]);
  const strandMeshes = useRef<(Mesh | null)[]>([]);
  const timer = useRef<Timer | null>(null);
  const camera = useThree((state) => state.camera);

  const pool = useRef<Drip[]>(
    anchors.map((anchor, i) => ({
      state: "idle" as DripState,
      peel: 0,
      swell: 0,
      snapT: 0,
      returnT: 0,
      anchorX: anchor.x,
      anchorY: anchor.y,
      anchorZ: anchor.z,
      activateAt: 0.12 + ((i * 0.13) % 1.05) + (i % 4) * 0.07,
      vx: 0,
      vy: 0,
      vz: 0,
      scale: 0.06 + (i % 5) * 0.012,
      seed: i * 13.7,
      cooldown: i * 0.05,
    })),
  );

  const headGeometry = useMemo(
    () => new IcosahedronGeometry(1, isMobile ? 4 : 5),
    [isMobile],
  );

  const strandGeometry = useMemo(
    () => new CylinderGeometry(1, 1, 1, 14, 6, false),
    [],
  );

  const headMaterials = useMemo(
    () =>
      Array.from(
        { length: DRIP_ANCHOR_COUNT },
        () =>
          new ShaderMaterial({
            vertexShader: dripVertexShader,
            fragmentShader: dripFragmentShader,
            uniforms: {
              uTime: { value: 0 },
              uPointer: { value: [0, 0] },
              uPointerStrength: { value: 0.3 },
              uPullStrength: { value: 0 },
              uGravityDir: { value: [0, 0, 1] },
              uBreathe: { value: 0.5 },
              ...anchorUniforms,
            },
          }),
      ),
    [anchorUniforms],
  );

  const strandMaterials = useMemo(
    () =>
      Array.from(
        { length: DRIP_ANCHOR_COUNT },
        () =>
          new ShaderMaterial({
            vertexShader: strandVertexShader,
            fragmentShader: strandFragmentShader,
            uniforms: {
              uPinch: { value: 0 },
              uThick: { value: 0.05 },
            },
          }),
      ),
    [],
  );

  useEffect(() => {
    const t = new Timer();
    t.connect(document);
    timer.current = t;
    return () => {
      t.disconnect();
      headGeometry.dispose();
      strandGeometry.dispose();
      headMaterials.forEach((m) => m.dispose());
      strandMaterials.forEach((m) => m.dispose());
    };
  }, [headGeometry, strandGeometry, headMaterials, strandMaterials]);

  const detachedCount = () =>
    pool.current.filter((d) => d.state === "detached").length;

  const setAnchorSwell = (ptr: GravityPointer) => {
    for (let i = 0; i < DRIP_ANCHOR_COUNT; i++) {
      const d = pool.current[i];
      if (
        d.state === "idle" ||
        d.state === "detached" ||
        d.state === "returning" ||
        d.state === "snapping"
      ) {
        ptr.anchorSwell[i] = 0;
      } else if (d.state === "swelling") {
        ptr.anchorSwell[i] = 0.3 + d.swell * 0.4;
      } else if (d.state === "peeling") {
        ptr.anchorSwell[i] = 0.65 + d.peel * 0.3;
      }
    }
  };

  const beginSwell = (index: number) => {
    const d = pool.current[index];
    const head = headMeshes.current[index];
    const strand = strandMeshes.current[index];
    if (!head || !strand || d.state !== "idle") return;

    d.state = "swelling";
    d.swell = 0;
    d.peel = 0;
    d.snapT = 0;
    d.vx = 0;
    d.vy = 0;
    d.vz = 0;

    anchorToPosition(
      { x: d.anchorX, y: d.anchorY, z: d.anchorZ },
      ORB_RADIUS * 0.985,
      head.position,
    );
    head.scale.setScalar(d.scale * 0.18);
    head.visible = true;
    strand.visible = false;
  };

  useFrame((_, delta) => {
    if (!timer.current) return;

    timer.current.update();
    const time = timer.current.getElapsed();
    const dt = Math.min(delta, 0.033);
    const ptr = pointer.current;
    const assembly = assemblyRef.current;

    updateGravityState(ptr, camera, 0);

    gravityWorld.set(ptr.gravity[0], ptr.gravity[1], ptr.gravity[2]);
    if (assembly) {
      assembly.worldToLocal(gravityLocal.copy(gravityWorld));
    } else {
      gravityLocal.copy(gravityWorld);
    }

    const pull = reducedMotion ? 0 : ptr.smoothPull;
    const sustain = reducedMotion ? 0 : ptr.sustainTime;

    if (pull > 0.12 && sustain > 0) {
      for (let i = 0; i < DRIP_ANCHOR_COUNT; i++) {
        const d = pool.current[i];
        if (
          d.state === "idle" &&
          d.cooldown <= 0 &&
          sustain >= d.activateAt &&
          detachedCount() < MAX_DETACHED
        ) {
          beginSwell(i);
        }
      }
    }

    for (let i = 0; i < DRIP_ANCHOR_COUNT; i++) {
      const d = pool.current[i];
      const head = headMeshes.current[i];
      const strand = strandMeshes.current[i];
      if (!head || !strand) continue;

      if (d.cooldown > 0) d.cooldown -= dt;

      const mat = head.material as ShaderMaterial;
      mat.uniforms.uTime.value = time;
      mat.uniforms.uPointer.value = [ptr.x, ptr.y];
      mat.uniforms.uPullStrength.value = pull;
      mat.uniforms.uPointerStrength.value = 0.2 + pull * 0.35;

      if (d.state === "idle") {
        head.visible = false;
        strand.visible = false;
        continue;
      }

      const anchor = { x: d.anchorX, y: d.anchorY, z: d.anchorZ };

      if (d.state === "swelling") {
        d.swell = Math.min(1, d.swell + dt / SWELL_DURATION);
        const t = easeInOutCubic(d.swell);

        anchorToPosition(anchor, ORB_RADIUS * (0.985 + t * 0.008), head.position);
        head.scale.setScalar(d.scale * (0.18 + t * 0.14));
        strand.visible = false;

        if (d.swell >= 1) {
          d.state = "peeling";
          d.peel = 0;
        }
      } else if (d.state === "peeling") {
        d.peel = Math.min(1, d.peel + dt / PEEL_DURATION);
        const t = easeInOutCubic(d.peel);

        computeHeadPosition(anchor, t, pull, gravityLocal, head.position);
        const headR = d.scale * (0.32 + t * 0.38);
        head.scale.setScalar(headR);

        const pinch = smoothstep(0.55, 1.0, t) * (0.4 + pull * 0.45);
        const thick = d.scale * (0.55 + (1.0 - t * 0.35) * 0.35);
        updateStrand(strand, anchor, head.position, pinch, thick);
        strand.visible = t > 0.06;

        if (d.peel >= 1) {
          d.state = "snapping";
          d.snapT = 0;
        }
      } else if (d.state === "snapping") {
        d.snapT = Math.min(1, d.snapT + dt / SNAP_DURATION);
        const snap = d.snapT;

        computeHeadPosition(anchor, 1, pull, gravityLocal, headPos);
        head.position.lerp(headPos, 0.35 + snap * 0.4);
        head.scale.setScalar(d.scale * (0.7 - snap * 0.15));

        const pinch = 0.85 + snap * 0.15;
        const thick = d.scale * (0.35 * (1 - snap));
        updateStrand(strand, anchor, head.position, pinch, thick);

        if (d.snapT >= 1) {
          d.state = "detached";
          strand.visible = false;
          const dx = gravityLocal.x - head.position.x;
          const dy = gravityLocal.y - head.position.y;
          const dz = gravityLocal.z - head.position.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.001;
          d.vx = (dx / dist) * 0.35;
          d.vy = (dy / dist) * 0.35;
          d.vz = (dz / dist) * 0.35;
        }
      } else if (d.state === "detached") {
        strand.visible = false;

        const dx = gravityLocal.x - head.position.x;
        const dy = gravityLocal.y - head.position.y;
        const dz = gravityLocal.z - head.position.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.001;

        const force = pull * (2.2 + 1.0 / dist);
        d.vx += (dx / dist) * force * dt;
        d.vy += (dy / dist) * force * dt;
        d.vz += (dz / dist) * force * dt;

        const wobble = 0.04 * pull;
        d.vx += Math.sin(time * 2 + d.seed) * wobble * dt;
        d.vy += Math.cos(time * 1.6 + d.seed) * wobble * dt;

        d.vx *= 0.962;
        d.vy *= 0.962;
        d.vz *= 0.962;

        head.position.x += d.vx * dt;
        head.position.y += d.vy * dt;
        head.position.z += d.vz * dt;

        const pulse = 1 + Math.sin(time * 2.5 + d.seed) * 0.05;
        head.scale.setScalar(d.scale * 0.82 * pulse);

        if (dist < 0.14 || pull < 0.04) {
          d.state = "returning";
          d.returnT = 0;
        }
      } else if (d.state === "returning") {
        strand.visible = false;
        d.returnT = Math.min(1, d.returnT + dt / RETURN_DURATION);
        const t = easeInOutCubic(d.returnT);

        anchorToPosition(anchor, ORB_RADIUS * 0.99, returnTarget);
        head.position.lerp(returnTarget, 0.1 + t * 0.12);
        head.scale.setScalar(d.scale * (1 - t) * 0.3);

        if (d.returnT >= 1) {
          d.state = "idle";
          d.cooldown = 0.7 + (i % 3) * 0.15;
          head.visible = false;
        }
      }

      head.rotation.x += dt * (0.2 + d.seed * 0.004);
      head.rotation.y += dt * (0.35 + d.seed * 0.003);
    }

    setAnchorSwell(ptr);
  }, -1);

  return (
    <>
      {Array.from({ length: DRIP_ANCHOR_COUNT }, (_, i) => (
        <group key={i}>
          <mesh
            ref={(node) => {
              strandMeshes.current[i] = node;
            }}
            geometry={strandGeometry}
            material={strandMaterials[i]}
            visible={false}
            renderOrder={4}
          />
          <mesh
            ref={(node) => {
              headMeshes.current[i] = node;
            }}
            geometry={headGeometry}
            material={headMaterials[i]}
            visible={false}
            renderOrder={5}
          />
        </group>
      ))}
    </>
  );
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}