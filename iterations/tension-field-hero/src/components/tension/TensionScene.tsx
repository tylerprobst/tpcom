"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  IcosahedronGeometry,
  InstancedBufferAttribute,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Object3D,
  PointLight,
  Quaternion,
  ShaderMaterial,
  SphereGeometry,
  Timer,
  Vector3,
  type Group,
  type Mesh,
} from "three";
import { beadFragmentShader, beadVertexShader } from "./beadShader";
import { updateGravityState } from "./gravityState";
import { nodeFragmentShader, nodeVertexShader } from "./nodeShader";
import { strandFragmentShader, strandVertexShader } from "./strandShader";
import { buildTensionGraph } from "./tensionGraph";
import {
  LATTICE_RADIUS,
  NEIGHBORS,
  NODE_COUNT,
  type TensionPointer,
} from "./tensionConstants";
import {
  createPeelPool,
  TensionSim,
  type PeelSlot,
} from "./tensionPhysics";

const gravityWorld = new Vector3();
const gravityLocal = new Vector3();
const basePos = new Vector3();
const headPos = new Vector3();
const axisDir = new Vector3();
const strandQuat = new Quaternion();
const Y_AXIS = new Vector3(0, 1, 0);
const dummy = new Object3D();

type TensionSceneProps = {
  pointer: React.MutableRefObject<TensionPointer>;
  assemblyRef: React.RefObject<Group | null>;
  reducedMotion: boolean;
  isMobile: boolean;
};

function updateStrandMesh(
  strand: Mesh,
  rest: Vector3,
  head: Vector3,
  pinch: number,
  thick: number,
) {
  const length = Math.max(0.02, rest.distanceTo(head) - thick * 0.3);
  axisDir.subVectors(head, rest).normalize();
  const mid = rest.clone().add(head).multiplyScalar(0.5);

  strand.position.copy(mid);
  strandQuat.setFromUnitVectors(Y_AXIS, axisDir);
  strand.quaternion.copy(strandQuat);
  strand.scale.set(1, length, 1);
  strand.visible = length > 0.02;

  const mat = strand.material as ShaderMaterial;
  mat.uniforms.uPinch.value = pinch;
  mat.uniforms.uThick.value = thick;
}

export function TensionScene({
  pointer,
  assemblyRef,
  reducedMotion,
  isMobile,
}: TensionSceneProps) {
  const graph = useMemo(
    () => buildTensionGraph(NODE_COUNT, LATTICE_RADIUS, NEIGHBORS),
    [],
  );
  const sim = useRef(
    new TensionSim(NODE_COUNT, graph.rests, graph.edges),
  ).current;
  const peels = useRef(createPeelPool()).current;
  const timer = useRef<Timer | null>(null);
  const camera = useThree((state) => state.camera);

  const nodes = useRef<InstancedMesh>(null);
  const edges = useRef<LineSegments>(null);
  const core = useRef<Mesh>(null);
  const pullLight = useRef<PointLight>(null);
  const smoothTilt = useRef({ x: 0, z: 0 });
  const smoothCam = useRef({ x: 0, y: 0, z: 4.8 });
  const headMeshes = useRef<(Mesh | null)[]>([]);
  const strandMeshes = useRef<(Mesh | null)[]>([]);

  const nodeGeo = useMemo(
    () => new IcosahedronGeometry(1, isMobile ? 2 : 3),
    [isMobile],
  );

  const strainAttr = useMemo(
    () => new InstancedBufferAttribute(new Float32Array(NODE_COUNT), 1),
    [],
  );

  useEffect(() => {
    nodeGeo.setAttribute("aStrain", strainAttr);
  }, [nodeGeo, strainAttr]);

  const nodeMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: nodeVertexShader,
        fragmentShader: nodeFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uPull: { value: 0 },
        },
      }),
    [],
  );

  const edgePositions = useMemo(
    () => new Float32Array(graph.edges.length * 2 * 3),
    [graph.edges.length],
  );
  const edgeColors = useMemo(
    () => new Float32Array(graph.edges.length * 2 * 3),
    [graph.edges.length],
  );

  const edgeGeo = useMemo(() => {
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(edgePositions, 3));
    geo.setAttribute("color", new BufferAttribute(edgeColors, 3));
    return geo;
  }, [edgePositions, edgeColors]);

  const edgeMat = useMemo(
    () =>
      new LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 1,
      }),
    [],
  );

  const coreGeo = useMemo(() => new SphereGeometry(0.16, 24, 24), []);
  const coreMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: beadVertexShader,
        fragmentShader: beadFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uPull: { value: 0 },
          uHot: { value: 0.2 },
        },
      }),
    [],
  );

  const headGeo = useMemo(
    () => new IcosahedronGeometry(1, isMobile ? 3 : 4),
    [isMobile],
  );
  const strandGeo = useMemo(() => new CylinderGeometry(1, 1, 1, 12, 4), []);

  const headMats = useMemo(
    () =>
      Array.from({ length: peels.length }, () =>
        new ShaderMaterial({
          vertexShader: beadVertexShader,
          fragmentShader: beadFragmentShader,
          uniforms: {
            uTime: { value: 0 },
            uPull: { value: 0 },
            uHot: { value: 0.5 },
          },
        }),
      ),
    [peels.length],
  );

  const strandMats = useMemo(
    () =>
      Array.from({ length: peels.length }, () =>
        new ShaderMaterial({
          vertexShader: strandVertexShader,
          fragmentShader: strandFragmentShader,
          uniforms: {
            uPinch: { value: 0 },
            uThick: { value: 0.04 },
            uPull: { value: 0 },
          },
        }),
      ),
    [peels.length],
  );

  const coolEdge = useMemo(() => new Color("#2a3540"), []);
  const warmEdge = useMemo(() => new Color("#6a9ac8"), []);
  const hotEdge = useMemo(() => new Color("#ffe8c8"), []);
  const blazeEdge = useMemo(() => new Color("#ffffff"), []);

  useEffect(() => {
    const t = new Timer();
    t.connect(document);
    timer.current = t;
    return () => {
      t.disconnect();
      nodeGeo.dispose();
      nodeMat.dispose();
      edgeGeo.dispose();
      edgeMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      headGeo.dispose();
      strandGeo.dispose();
      headMats.forEach((m) => m.dispose());
      strandMats.forEach((m) => m.dispose());
    };
  }, [
    nodeGeo,
    nodeMat,
    edgeGeo,
    edgeMat,
    coreGeo,
    coreMat,
    headGeo,
    strandGeo,
    headMats,
    strandMats,
  ]);

  useFrame((_, delta) => {
    if (!timer.current) return;

    timer.current.update();
    const time = timer.current.getElapsed();
    const dt = Math.min(delta, 0.033);
    const ptr = pointer.current;
    const assembly = assemblyRef.current;
    const orbY = Math.sin(time * 0.12) * 0.015;

    updateGravityState(ptr, camera, orbY);

    const targetPull = reducedMotion ? 0 : ptr.pullStrength;
    ptr.smoothPull += (targetPull - ptr.smoothPull) * 0.08;

    if (ptr.active && ptr.smoothPull > 0.1) {
      ptr.sustainTime += dt * ptr.smoothPull;
    } else {
      ptr.sustainTime = Math.max(0, ptr.sustainTime - dt * 2);
    }

    gravityWorld.set(ptr.gravity[0], ptr.gravity[1], ptr.gravity[2]);
    if (assembly) {
      assembly.worldToLocal(gravityLocal.copy(gravityWorld));
    } else {
      gravityLocal.copy(gravityWorld);
    }

    if (!reducedMotion) {
      sim.step(dt, ptr.smoothPull, gravityLocal, peels);
    }

    const pull = reducedMotion ? 0 : ptr.smoothPull;
    const pos = sim.positions;
    const strainArr = strainAttr.array as Float32Array;
    let maxStress = 0;

    if (assembly) {
      const spin = 0.012 + pull * 0.055;
      assembly.rotation.y = time * spin;
      smoothTilt.current.x += (gravityLocal.y * pull * 0.22 - smoothTilt.current.x) * 0.06;
      smoothTilt.current.z += (-gravityLocal.x * pull * 0.22 - smoothTilt.current.z) * 0.06;
      assembly.rotation.x = smoothTilt.current.x;
      assembly.rotation.z = smoothTilt.current.z;
      assembly.position.y = orbY;
      assembly.updateMatrixWorld();
    }

    smoothCam.current.x += (ptr.x * pull * 0.45 - smoothCam.current.x) * 0.05;
    smoothCam.current.y += (ptr.y * pull * 0.32 - smoothCam.current.y) * 0.05;
    smoothCam.current.z += (4.65 - pull * 0.35 - smoothCam.current.z) * 0.04;
    camera.position.set(
      smoothCam.current.x,
      smoothCam.current.y,
      smoothCam.current.z,
    );
    camera.lookAt(0, orbY, 0);

    const light = pullLight.current;
    if (light) {
      light.position.lerp(gravityLocal, 0.12);
    }

    const inst = nodes.current;
    if (inst) {
      for (let i = 0; i < NODE_COUNT; i++) {
        const i3 = i * 3;
        if (sim.hidden[i]) {
          dummy.position.set(0, -99, 0);
          dummy.scale.setScalar(0.001);
        } else {
          dummy.position.set(pos[i3], pos[i3 + 1], pos[i3 + 2]);
          const s = 0.036 + sim.nodeStrain[i] * 0.042 + pull * 0.008;
          dummy.scale.setScalar(s);
        }
        strainArr[i] = sim.nodeStrain[i];
        maxStress = Math.max(maxStress, sim.nodeStrain[i]);
        dummy.updateMatrix();
        inst.setMatrixAt(i, dummy.matrix);
      }
      strainAttr.needsUpdate = true;
      inst.instanceMatrix.needsUpdate = true;
      nodeMat.uniforms.uTime.value = time;
      nodeMat.uniforms.uPull.value = pull;
    }

    const line = edges.current;
    if (line) {
      const cArr = edgeColors;
      for (let e = 0; e < graph.edges.length; e++) {
        const { a, b: bi } = graph.edges[e];
        const a3 = a * 3;
        const b3 = bi * 3;
        const e6 = e * 6;

        edgePositions[e6] = pos[a3];
        edgePositions[e6 + 1] = pos[a3 + 1];
        edgePositions[e6 + 2] = pos[a3 + 2];
        edgePositions[e6 + 3] = pos[b3];
        edgePositions[e6 + 4] = pos[b3 + 1];
        edgePositions[e6 + 5] = pos[b3 + 2];

        const stress = Math.max(0, sim.strain[e] - 1);
        maxStress = Math.max(maxStress, stress);
        const t1 = Math.min(1, stress * 3.2);
        const t2 = Math.min(1, stress * 1.8) * pull;
        const t3 = Math.min(1, Math.max(0, stress - 0.35) * 2.5) * pull;
        const cr =
          coolEdge.r +
          (warmEdge.r - coolEdge.r) * t1 +
          (hotEdge.r - warmEdge.r) * t2 +
          (blazeEdge.r - hotEdge.r) * t3;
        const cg =
          coolEdge.g +
          (warmEdge.g - coolEdge.g) * t1 +
          (hotEdge.g - warmEdge.g) * t2 +
          (blazeEdge.g - hotEdge.g) * t3;
        const cb =
          coolEdge.b +
          (warmEdge.b - coolEdge.b) * t1 +
          (hotEdge.b - warmEdge.b) * t2 +
          (blazeEdge.b - hotEdge.b) * t3;

        cArr[e6] = cr;
        cArr[e6 + 1] = cg;
        cArr[e6 + 2] = cb;
        cArr[e6 + 3] = cr;
        cArr[e6 + 4] = cg;
        cArr[e6 + 5] = cb;
      }
      line.geometry.attributes.position.needsUpdate = true;
      line.geometry.attributes.color.needsUpdate = true;
    }

    if (light) {
      light.intensity = 0.15 + pull * 2.2 + maxStress * 0.8;
    }

    edgeMat.opacity = 0.55 + pull * 0.35 + maxStress * 0.25;

    if (core.current) {
      coreMat.uniforms.uTime.value = time;
      coreMat.uniforms.uPull.value = pull;
      coreMat.uniforms.uHot.value = 0.35 + pull * 0.65 + maxStress * 0.4;
      const pulse = 1 + Math.sin(time * 0.8) * 0.06 + pull * 0.18;
      core.current.scale.setScalar(0.16 * pulse);
    }

    for (let p = 0; p < peels.length; p++) {
      const peel = peels[p] as PeelSlot;
      const head = headMeshes.current[p];
      const strand = strandMeshes.current[p];
      if (!head || !strand) continue;

      if (!peel.active) {
        head.visible = false;
        strand.visible = false;
        continue;
      }

      head.visible = true;
      head.position.set(peel.headX, peel.headY, peel.headZ);
      const headScale =
        peel.scale * (peel.detached ? 1.05 : 0.4 + peel.peel * 0.65);
      head.scale.setScalar(headScale);
      const hMat = head.material as ShaderMaterial;
      hMat.uniforms.uTime.value = time;
      hMat.uniforms.uPull.value = pull;
      hMat.uniforms.uHot.value = 0.6 + pull * 0.4;

      basePos.set(peel.restX, peel.restY, peel.restZ);
      headPos.set(peel.headX, peel.headY, peel.headZ);

      if (!peel.detached) {
        const pinch =
          peel.peel > 0.45 ? ((peel.peel - 0.45) / 0.55) * (0.55 + pull * 0.55) : 0;
        const thick = peel.scale * (0.65 + (1 - peel.peel) * 0.45);
        updateStrandMesh(strand, basePos, headPos, pinch, thick);
        const sMat = strand.material as ShaderMaterial;
        sMat.uniforms.uPull.value = pull;
      } else {
        strand.visible = false;
      }
    }
  });

  return (
    <group>
      <mesh
        position={[0, 0, 1.5]}
        onPointerMove={(event) => {
          pointer.current.x = event.pointer.x;
          pointer.current.y = event.pointer.y;
          pointer.current.active = true;
        }}
        onPointerOut={() => {
          pointer.current.active = false;
          pointer.current.pullStrength = 0;
        }}
        onPointerDown={() => {
          pointer.current.active = true;
        }}
      >
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <pointLight
        ref={pullLight}
        color="#ffe4c8"
        distance={9}
        decay={2}
        intensity={0}
      />

      <mesh ref={core} geometry={coreGeo} material={coreMat} renderOrder={1} />
      <lineSegments
        ref={edges}
        geometry={edgeGeo}
        material={edgeMat}
        renderOrder={2}
      />
      <instancedMesh
        ref={nodes}
        args={[nodeGeo, nodeMat, NODE_COUNT]}
        renderOrder={3}
      />
      {peels.map((_, i) => (
        <group key={i}>
          <mesh
            ref={(n) => {
              strandMeshes.current[i] = n;
            }}
            geometry={strandGeo}
            material={strandMats[i]}
            visible={false}
            renderOrder={4}
          />
          <mesh
            ref={(n) => {
              headMeshes.current[i] = n;
            }}
            geometry={headGeo}
            material={headMats[i]}
            visible={false}
            renderOrder={5}
          />
        </group>
      ))}
    </group>
  );
}