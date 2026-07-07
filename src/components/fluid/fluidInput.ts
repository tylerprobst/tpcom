import { MAX_SPLAT_DELTA } from "@/components/fluid/fluidConstants";

export function clampDelta(
  dx: number,
  dy: number,
  max = MAX_SPLAT_DELTA,
): { dx: number; dy: number; speed: number } {
  const speed = Math.hypot(dx, dy);
  if (speed <= max || speed === 0) {
    return { dx, dy, speed };
  }
  const scale = max / speed;
  return { dx: dx * scale, dy: dy * scale, speed: max };
}

export function clampForce(
  fx: number,
  fy: number,
  max: number,
): [number, number] {
  const mag = Math.hypot(fx, fy);
  if (mag <= max) return [fx, fy];
  const scale = max / mag;
  return [fx * scale, fy * scale];
}

export function speedIntensity(speed: number, base: number, gain: number, cap: number) {
  return base + Math.min(Math.sqrt(speed) * gain, cap);
}