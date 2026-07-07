import { DRIP_ANCHOR_COUNT } from "./orbAnchors";

export const ORB_RADIUS = 0.82;

export const ALIGN_THRESHOLD = 0.055;
export const MAX_MISALIGN = 0.4;
export const GRAVITY_DEPTH = 2.35;

export type GravityPointer = {
  x: number;
  y: number;
  active: boolean;
  misalignment: number;
  pullStrength: number;
  sustainTime: number;
  smoothPull: number;
  gravity: [number, number, number];
  anchorSwell: number[];
};

export function createGravityPointer(): GravityPointer {
  return {
    x: 0,
    y: 0,
    active: false,
    misalignment: 0,
    pullStrength: 0,
    sustainTime: 0,
    smoothPull: 0,
    gravity: [0, 0, GRAVITY_DEPTH],
    anchorSwell: new Array(DRIP_ANCHOR_COUNT).fill(0),
  };
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}