"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import type { Group } from "three";
import { TensionScene } from "@/components/tension/TensionScene";
import { createTensionPointer } from "@/components/tension/tensionConstants";

export default function TensionHero() {
  const pointer = useRef(createTensionPointer());
  const assemblyRef = useRef<Group>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 768px)");
    const update = () => {
      setReducedMotion(motion.matches);
      setIsMobile(mobile.matches);
    };
    update();
    motion.addEventListener("change", update);
    mobile.addEventListener("change", update);
    return () => {
      motion.removeEventListener("change", update);
      mobile.removeEventListener("change", update);
    };
  }, []);

  return (
    <section
      className="relative h-screen w-full overflow-hidden bg-[#06080c]"
      aria-label="Hero"
    >
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_0%,#06080c_72%)]"
        aria-hidden
      />

      <header className="pointer-events-none absolute left-6 top-6 z-10 md:left-8 md:top-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#5c6878]">
          Software Engineer
        </p>
        <h1 className="mt-1 text-lg font-semibold tracking-tight text-[#e8eaed] md:text-xl">
          Tyler Probst
        </h1>
        <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-[#6b7580]">
          Force-directed lattice · spring simulation · peel physics
        </p>
      </header>

      <Canvas
        className="absolute inset-0 touch-none"
        camera={{ position: [0, 0, 4.8], fov: 44, near: 0.1, far: 30 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#06080c"]} />
        <fog attach="fog" args={["#06080c", 4.5, 11]} />
        <Suspense fallback={null}>
          <group ref={assemblyRef}>
            <ambientLight intensity={0.32} color="#a8b8c8" />
            <pointLight position={[2, 3, 5]} intensity={0.85} color="#fff0e0" />
            <pointLight position={[-3, -1, 4]} intensity={0.45} color="#5a8ab8" />
            <pointLight position={[0, -2, 2]} intensity={0.25} color="#3a5070" />
            <TensionScene
              pointer={pointer}
              assemblyRef={assemblyRef}
              reducedMotion={reducedMotion}
              isMobile={isMobile}
            />
          </group>
        </Suspense>
      </Canvas>

      <p className="pointer-events-none absolute inset-x-0 bottom-8 z-10 text-center text-[11px] tracking-[0.18em] text-[#3d4854] uppercase">
        Pull the field
      </p>
    </section>
  );
}