"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import { SignalScene } from "@/components/signal/SignalScene";
import { createSignalPointer } from "@/components/signal/signalConstants";

export default function SignalHero() {
  const pointer = useRef(createSignalPointer());
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
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_0%,#06080c_68%)]"
        aria-hidden
      />

      <header className="pointer-events-none absolute left-6 top-6 z-10 md:left-8 md:top-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#5c6878]">
          Software Engineer
        </p>
        <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-[#6b7580]">
          Typographic signal field · particle sampling · interference shader
        </p>
      </header>

      <Canvas
        className="absolute inset-0 touch-none"
        camera={{ position: [0, 0, 5.2], fov: 42, near: 0.1, far: 20 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#06080c"]} />
        <fog attach="fog" args={["#06080c", 4, 9]} />
        <Suspense fallback={null}>
          <SignalScene
            pointer={pointer}
            reducedMotion={reducedMotion}
            isMobile={isMobile}
          />
        </Suspense>
      </Canvas>

      <p className="pointer-events-none absolute inset-x-0 bottom-8 z-10 text-center text-[11px] tracking-[0.18em] text-[#3d4854] uppercase">
        Disrupt the signal
      </p>
    </section>
  );
}