"use client";

import { useParallax } from "@/hooks/useParallax";
import { AtmosphereLayer } from "@/components/village/AtmosphereLayer";
import { HeroOverlay } from "@/components/village/HeroOverlay";
import { ImageParallaxLayer } from "@/components/village/ImageParallaxLayer";
import { VILLAGE_LAYERS } from "@/components/village/villageLayers";

export function VillageHero() {
  const { handleMouseMove, layerStyle } = useParallax();

  return (
    <section
      className="relative h-screen w-full overflow-hidden bg-[#9dd4ef]"
      onMouseMove={handleMouseMove}
      aria-label="Hero"
    >
      {VILLAGE_LAYERS.map((layer) => (
        <ImageParallaxLayer
          key={layer.src}
          layer={layer}
          style={layerStyle(layer.depth)}
        />
      ))}

      <AtmosphereLayer style={layerStyle(0.015)} />

      {/* Falling cherry petals */}
      <div className="pointer-events-none absolute inset-0 z-[4]">
        <div className="petal petal-1" />
        <div className="petal petal-2" />
        <div className="petal petal-3" />
        <div className="petal petal-4" />
        <div className="petal petal-5" />
        <div className="petal petal-6" />
      </div>

      <HeroOverlay />
    </section>
  );
}