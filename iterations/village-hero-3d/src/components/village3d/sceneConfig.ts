export type SceneLayer = {
  texture: string;
  z: number;
  /** How much this layer shifts with mouse movement */
  parallax: number;
  opacity?: number;
  /** Slightly enlarge layer to avoid edge gaps during parallax */
  coverScale?: number;
};

export const CAMERA_Z = 5;

export const SCENE_LAYERS: SceneLayer[] = [
  {
    texture: "/assets/village/layer-sky.jpg",
    z: -7,
    parallax: 0.15,
    coverScale: 1.08,
  },
  {
    texture: "/assets/village/layer-back.jpg",
    z: -5,
    parallax: 0.35,
    opacity: 0.88,
    coverScale: 1.06,
  },
  {
    texture: "/assets/village/hero-scene.png",
    z: -3.2,
    parallax: 0.6,
    coverScale: 1.05,
  },
  {
    texture: "/assets/village/layer-front.jpg",
    z: -1.4,
    parallax: 1,
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