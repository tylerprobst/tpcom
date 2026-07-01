"use client";

import { Canvas } from "@react-three/fiber";
import { HeroOverlay } from "@/components/village/HeroOverlay";
import { MouseParallaxProvider } from "@/components/village3d/MouseParallaxContext";
import { VillageScene } from "@/components/village3d/VillageScene";

export default function VillageHero3D() {
  return (
    <section className="relative h-screen w-full overflow-hidden" aria-label="Hero">
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

      <HeroOverlay />
    </section>
  );
}