/** Vanishing point and street trapezoid for one-point perspective. */
export const VP = { x: 720, y: 340 } as const;

export const STREET = {
  bottomLeft: { x: 400, y: 900 },
  bottomRight: { x: 1040, y: 900 },
  topLeft: { x: 698, y: VP.y },
  topRight: { x: 742, y: VP.y },
} as const;

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Interpolate a point along the left street edge (t=0 bottom, t=1 horizon). */
export function leftStreetEdge(t: number) {
  return {
    x: lerp(STREET.bottomLeft.x, STREET.topLeft.x, t),
    y: lerp(STREET.bottomLeft.y, STREET.topLeft.y, t),
  };
}

/** Interpolate a point along the right street edge. */
export function rightStreetEdge(t: number) {
  return {
    x: lerp(STREET.bottomRight.x, STREET.topRight.x, t),
    y: lerp(STREET.bottomRight.y, STREET.topRight.y, t),
  };
}

export const LEFT_FACADE = `0,${VP.y} 0,900 ${STREET.bottomLeft.x},900 ${STREET.topLeft.x},${STREET.topLeft.y}`;
export const RIGHT_FACADE = `${STREET.topRight.x},${STREET.topRight.y} ${STREET.bottomRight.x},900 1440,900 1440,${VP.y}`;
export const STREET_SURFACE = `${STREET.bottomLeft.x},${STREET.bottomLeft.y} ${STREET.bottomRight.x},${STREET.bottomRight.y} ${STREET.topRight.x},${STREET.topRight.y} ${STREET.topLeft.x},${STREET.topLeft.y}`;