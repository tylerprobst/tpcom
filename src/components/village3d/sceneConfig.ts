export type SceneLayer = {
  texture: string;
  z: number;
  /** How much this layer shifts with mouse movement */
  parallax: number;
  /** Vertical drift when scrolling (simulates depth while walking) */
  scrollDrift?: number;
  opacity?: number;
  /** Slightly enlarge layer to avoid edge gaps during parallax */
  coverScale?: number;
};

export const CAMERA_Z = 5;

/** Total scrollable height as multiples of viewport height */
export const SCROLL_HEIGHT_VH = 320;

export const SCROLL_CAMERA = {
  startZ: 5,
  endZ: 2.4,
  startY: 0,
  endY: -0.18,
  lookAtStart: [0, 0, 0] as [number, number, number],
  lookAtEnd: [0, -0.12, -4] as [number, number, number],
};

export const SCENE_LAYERS: SceneLayer[] = [
  {
    texture: "/assets/village/layer-sky.jpg",
    z: -7,
    parallax: 0.15,
    scrollDrift: 0.08,
    coverScale: 1.08,
  },
  {
    texture: "/assets/village/layer-back.jpg",
    z: -5,
    parallax: 0.35,
    scrollDrift: 0.18,
    opacity: 0.88,
    coverScale: 1.06,
  },
  {
    texture: "/assets/village/hero-scene.png",
    z: -3.2,
    parallax: 0.6,
    scrollDrift: 0.28,
    coverScale: 1.05,
  },
  {
    texture: "/assets/village/layer-front.jpg",
    z: -1.4,
    parallax: 1,
    scrollDrift: 0.42,
    opacity: 0.42,
    coverScale: 1.04,
  },
];

export const LANTERNS = [
  { position: [-2.8, 0.2, -1.8] as [number, number, number], intensity: 1.2 },
  { position: [2.6, 0.1, -1.6] as [number, number, number], intensity: 1.0 },
  { position: [-1.4, 0.5, -2.8] as [number, number, number], intensity: 0.7 },
  { position: [1.2, 0.45, -2.6] as [number, number, number], intensity: 0.65 },
  { position: [-0.5, 0.7, -3.8] as [number, number, number], intensity: 0.45 },
  { position: [0.4, 0.65, -3.6] as [number, number, number], intensity: 0.4 },
] as const;

export const SAKURA_COUNT = 280;

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}