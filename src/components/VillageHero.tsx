"use client";

import { useParallax } from "@/hooks/useParallax";
import { AtmosphereLayer } from "@/components/village/AtmosphereLayer";
import { CloudLayer } from "@/components/village/CloudLayer";
import { DistantMountains } from "@/components/village/DistantMountains";
import { ForegroundDetails } from "@/components/village/ForegroundDetails";
import { HeroOverlay } from "@/components/village/HeroOverlay";
import { SkyGradient } from "@/components/village/SkyGradient";
import { VillageMidground } from "@/components/village/VillageMidground";

const LAYER_DEPTHS = {
  sky: 0.015,
  depth: 0.03,
  clouds: 0.045,
  village: 0.07,
  foreground: 0.1,
  atmosphere: 0.02,
} as const;

export function VillageHero() {
  const { handleMouseMove, layerStyle } = useParallax();

  return (
    <section
      className="relative h-screen w-full overflow-hidden"
      onMouseMove={handleMouseMove}
      aria-label="Hero"
    >
      <SkyGradient style={layerStyle(LAYER_DEPTHS.sky)} />
      <DistantMountains style={layerStyle(LAYER_DEPTHS.depth)} />
      <CloudLayer style={layerStyle(LAYER_DEPTHS.clouds)} />
      <VillageMidground style={layerStyle(LAYER_DEPTHS.village)} />
      <ForegroundDetails style={layerStyle(LAYER_DEPTHS.foreground)} />
      <AtmosphereLayer style={layerStyle(LAYER_DEPTHS.atmosphere)} />
      <HeroOverlay />
    </section>
  );
}