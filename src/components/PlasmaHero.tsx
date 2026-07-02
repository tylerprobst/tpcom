"use client";

import { Canvas } from "@react-three/fiber";
import { PlasmaScene } from "@/components/plasma/PlasmaScene";

export default function PlasmaHero() {
  return (
    <section
      className="relative h-screen w-full overflow-hidden bg-[#0e1116]"
      aria-label="Hero"
    >
      <header className="pointer-events-none absolute left-6 top-6 z-10 md:left-8 md:top-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#6b7580]">
          Software Engineer
        </p>
        <h1 className="mt-1 text-lg font-semibold tracking-tight text-[#e8eaed] md:text-xl">
          Tyler Probst
        </h1>
      </header>

      <Canvas
        className="absolute inset-0 touch-none"
        camera={{ position: [0, 0, 4.2], fov: 45, near: 0.1, far: 20 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#0e1116"]} />
        <PlasmaScene />
      </Canvas>

      <p className="pointer-events-none absolute inset-x-0 bottom-8 z-10 text-center text-[11px] tracking-[0.18em] text-[#4a5560] uppercase">
        Move to disturb
      </p>
    </section>
  );
}