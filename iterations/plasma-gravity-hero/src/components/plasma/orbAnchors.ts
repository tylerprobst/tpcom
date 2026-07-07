import { Vector3 } from "three";

export type OrbAnchor = {
  x: number;
  y: number;
  z: number;
};

export const DRIP_ANCHOR_COUNT = 16;

/** Evenly distributed focal points across the full orb surface. */
export function createOrbAnchors(count = DRIP_ANCHOR_COUNT): OrbAnchor[] {
  const anchors: OrbAnchor[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = phi * i;
    anchors.push({
      x: Math.cos(theta) * radius,
      y,
      z: Math.sin(theta) * radius,
    });
  }

  return anchors;
}

export function anchorToPosition(
  anchor: OrbAnchor,
  radius: number,
  out: Vector3,
): void {
  out.set(anchor.x * radius, anchor.y * radius, anchor.z * radius);
}

export function anchorsToFlatArray(anchors: OrbAnchor[]): number[] {
  const flat: number[] = [];
  for (const anchor of anchors) {
    flat.push(anchor.x, anchor.y, anchor.z);
  }
  return flat;
}