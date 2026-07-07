export const LATTICE_RADIUS = 1.12;
export const NODE_COUNT = 42;
export const NEIGHBORS = 4;

export const ALIGN_THRESHOLD = 0.035;
export const MAX_MISALIGN = 0.32;
export const GRAVITY_DEPTH = 2.45;

export type TensionPointer = {
  x: number;
  y: number;
  active: boolean;
  misalignment: number;
  pullStrength: number;
  sustainTime: number;
  smoothPull: number;
  gravity: [number, number, number];
};

export function createTensionPointer(): TensionPointer {
  return {
    x: 0,
    y: 0,
    active: false,
    misalignment: 0,
    pullStrength: 0,
    sustainTime: 0,
    smoothPull: 0,
    gravity: [0, 0, GRAVITY_DEPTH],
  };
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}