export type VillageLayer = {
  src: string;
  depth: number;
  scale?: number;
  objectPosition?: string;
  opacity?: number;
  /** Fade the top of the layer so it blends with layers behind */
  fadeTop?: boolean;
};

/**
 * Illustrated parallax stack.
 *
 * Assets in /public/assets/village/:
 * - hero-scene.png  — primary illustration (user reference)
 * - layer-sky.jpg   — sky / atmosphere
 * - layer-front.jpg — close foreground depth
 * - layer-back.jpg, layer-mid.jpg — spare layers for manual tuning
 */
export const VILLAGE_LAYERS: VillageLayer[] = [
  {
    src: "/assets/village/layer-sky.jpg",
    depth: 0.02,
    scale: 1.04,
    objectPosition: "center top",
  },
  {
    src: "/assets/village/hero-scene.png",
    depth: 0.065,
    scale: 1.08,
    objectPosition: "center center",
  },
  {
    src: "/assets/village/layer-front.jpg",
    depth: 0.1,
    scale: 1.12,
    objectPosition: "center bottom",
    opacity: 0.5,
    fadeTop: true,
  },
];