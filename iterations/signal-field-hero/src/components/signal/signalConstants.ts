export const GLYPH_TARGET = 6800;
export const DUST_COUNT = 1600;
export const TOTAL_PARTICLES = GLYPH_TARGET + DUST_COUNT;

export const SPRING_K = 42;
export const DAMPING = 14;
export const PUSH_STRENGTH = 28;
export const CURSOR_RADIUS = 0.55;

export type SignalPointer = {
  x: number;
  y: number;
  active: number;
  worldX: number;
  worldY: number;
  strength: number;
};

export function createSignalPointer(): SignalPointer {
  return {
    x: 0,
    y: 0,
    active: 0,
    worldX: 0,
    worldY: 0,
    strength: 0,
  };
}