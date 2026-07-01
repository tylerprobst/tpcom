"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { HeroOverlay } from "@/components/village/HeroOverlay";
import { ScrollHint } from "@/components/village/ScrollHint";
import { ScrollProgressBar } from "@/components/village/ScrollProgressBar";
import { MouseParallaxProvider } from "@/components/village3d/MouseParallaxContext";
import { ScrollProgressProvider } from "@/components/village3d/ScrollProgressContext";
import { VillageScene } from "@/components/village3d/VillageScene";
import { SCROLL_HEIGHT_VH } from "@/components/village3d/sceneConfig";

export default function VillageHero3D() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollProgress = useRef(0);
  const [overlayOpacity, setOverlayOpacity] = useState(1);
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const tick = () => {
      const p = scrollProgress.current;
      setDisplayProgress(p);
      setOverlayOpacity(Math.max(0, 1 - p * 1.8));
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: `${SCROLL_HEIGHT_VH}vh` }}
      aria-label="Hero"
    >
      <ScrollProgressProvider sectionRef={sectionRef} progress={scrollProgress}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <MouseParallaxProvider>
            <Canvas
              className="absolute inset-0"
              camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 30 }}
              dpr={[1, 2]}
              gl={{ antialias: true, alpha: false }}
            >
              <color attach="background" args={["#9dd4ef"]} />
              <VillageScene />
            </Canvas>
          </MouseParallaxProvider>

          <HeroOverlay opacity={overlayOpacity} />
          <ScrollHint progress={displayProgress} />
          <ScrollProgressBar progress={displayProgress} />
        </div>
      </ScrollProgressProvider>
    </section>
  );
}