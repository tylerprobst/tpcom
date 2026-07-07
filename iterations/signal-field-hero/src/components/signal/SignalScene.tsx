"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  ShaderMaterial,
  Timer,
} from "three";
import { updateSignalPointer } from "./signalPointer";
import { SignalSim } from "./signalPhysics";
import { signalFragmentShader, signalVertexShader } from "./signalShader";
import { type SignalPointer } from "./signalConstants";
import { sampleGlyphPoints } from "./signalTypography";

type SignalSceneProps = {
  pointer: React.MutableRefObject<SignalPointer>;
  reducedMotion: boolean;
  isMobile: boolean;
};

export function SignalScene({
  pointer,
  reducedMotion,
  isMobile,
}: SignalSceneProps) {
  const { camera, gl } = useThree();
  const geometryRef = useRef<BufferGeometry>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const simRef = useRef<SignalSim | null>(null);
  const timer = useMemo(() => new Timer(), []);

  const glyphPoints = useMemo(
    () => sampleGlyphPoints(undefined, isMobile),
    [isMobile],
  );

  const geometry = useMemo(() => {
    const sim = new SignalSim(glyphPoints);
    simRef.current = sim;

    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(sim.pos, 3));
    geo.setAttribute(
      "aGlyph",
      new BufferAttribute(
        Float32Array.from(sim.isGlyph, (v) => v),
        1,
      ),
    );
    geo.setAttribute("aWeight", new BufferAttribute(sim.weight, 1));
    geo.setAttribute("aDisplace", new BufferAttribute(sim.displace, 1));
    geometryRef.current = geo;
    return geo;
  }, [glyphPoints]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: signalVertexShader,
        fragmentShader: signalFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
        },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [],
  );

  useEffect(() => {
    materialRef.current = material;
  }, [material]);

  useEffect(() => {
    const canvas = gl.domElement;

    const setFromEvent = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      pointer.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      pointer.current.active = 1;
    };

    const onMove = (e: PointerEvent) => setFromEvent(e.clientX, e.clientY);
    const onLeave = () => {
      pointer.current.active = 0;
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerup", onLeave);

    return () => {
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerup", onLeave);
    };
  }, [gl, pointer]);

  useFrame(() => {
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.033);
    const time = timer.getElapsed();

    updateSignalPointer(pointer.current, camera, dt);

    const sim = simRef.current;
    const geo = geometryRef.current;
    const mat = materialRef.current;
    if (!sim || !geo || !mat) return;

    sim.step(dt, pointer.current, time, reducedMotion);

    const posAttr = geo.getAttribute("position") as BufferAttribute;
    const dispAttr = geo.getAttribute("aDisplace") as BufferAttribute;
    posAttr.needsUpdate = true;
    dispAttr.needsUpdate = true;

    mat.uniforms.uTime.value = time;
    mat.uniforms.uPixelRatio.value = gl.getPixelRatio();
  });

  return <points geometry={geometry} material={material} />;
}