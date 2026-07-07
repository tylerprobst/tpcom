export const SCROLL_THRESHOLD = 12;
export const FLUID_THRESHOLD = 5;
export const SCROLL_DOMINANCE = 1.35;

export type GestureMode = "idle" | "pending" | "scroll" | "fluid";

export function uvFromClient(clientX: number, clientY: number) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return {
    x: clientX / w,
    y: 1 - clientY / h,
  };
}

export function resolveGestureMode(
  dx: number,
  dy: number,
  mode: GestureMode,
): GestureMode {
  if (mode !== "pending") return mode;

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (
    absDy > SCROLL_THRESHOLD &&
    absDy > absDx * SCROLL_DOMINANCE
  ) {
    return "scroll";
  }

  if (
    absDx > FLUID_THRESHOLD ||
    (Math.hypot(dx, dy) > FLUID_THRESHOLD &&
      absDy <= absDx * SCROLL_DOMINANCE)
  ) {
    return "fluid";
  }

  return "pending";
}