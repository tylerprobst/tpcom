import type { FluidSolver } from "@/components/fluid/FluidSolver";
import {
  SCROLL_INTENSITY_SCALE,
  SCROLL_MIN_DELTA,
} from "@/components/fluid/fluidConstants";

export function applyScrollSplats(
  solver: FluidSolver,
  lastScrollY: number,
): number {
  const scrollY = window.scrollY;
  const delta = scrollY - lastScrollY;

  if (Math.abs(delta) < SCROLL_MIN_DELTA) {
    return scrollY;
  }

  const height = window.innerHeight;
  const x = 0.5 + Math.sin(scrollY * 0.008) * 0.18;
  const y = delta > 0 ? 0.38 : 0.62;
  const dx = Math.sin(scrollY * 0.011) * (delta / height) * 2.8;
  const dy = -(delta / height) * 4.2;
  const intensity =
    SCROLL_INTENSITY_SCALE * (0.65 + Math.min(Math.abs(delta) * 0.04, 1.3));

  solver.splatPointer(x, y, dx, dy, intensity);
  return scrollY;
}