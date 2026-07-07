import type { FluidSolver } from "@/components/fluid/FluidSolver";
import {
  MAX_SCROLL_DELTA_PX,
  SCROLL_INTENSITY_SCALE,
  SCROLL_MIN_DELTA,
} from "@/components/fluid/fluidConstants";
import { speedIntensity } from "@/components/fluid/fluidInput";

export function applyScrollSplats(
  solver: FluidSolver,
  lastScrollY: number,
): number {
  const scrollY = window.scrollY;
  const delta = scrollY - lastScrollY;

  if (Math.abs(delta) < SCROLL_MIN_DELTA) {
    return scrollY;
  }

  const clamped =
    Math.sign(delta) * Math.min(Math.abs(delta), MAX_SCROLL_DELTA_PX);
  const height = window.innerHeight;
  const x = 0.5 + Math.sin(scrollY * 0.008) * 0.18;
  const y = clamped > 0 ? 0.38 : 0.62;
  const dy = -(clamped / height) * 2.6;
  const dx = Math.sin(scrollY * 0.011) * (clamped / height) * 1.6;
  const intensity =
    SCROLL_INTENSITY_SCALE *
    speedIntensity(Math.abs(clamped) / height, 0.5, 1.8, 0.85);

  solver.splatPointer(x, y, dx, dy, intensity);
  return scrollY;
}