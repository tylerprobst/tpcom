export const SIM_RES_DESKTOP = 256;
export const SIM_RES_MOBILE = 192;

export const FIXED_TIMESTEP = 1 / 60;
export const MAX_FRAME_DELTA = 0.05;
export const PRESSURE_ITERATIONS = 22;
export const INTENSITY_SCALE = 0.5;
export const CURL_STRENGTH = 7;
export const SPLAT_RADIUS = 0.014;
export const SPLAT_FORCE = 2200;
export const MAX_SPLAT_DELTA = 0.011;
export const MAX_SPLAT_FORCE = 110;
export const MAX_SCROLL_DELTA_PX = 42;
export const VELOCITY_DISSIPATION = 0.994;
export const DENSITY_DISSIPATION = 0.972;
export const DENSITY_DISSIPATION_MOBILE = 0.988;
export const POINTER_SMOOTH_RATE = 16;
export const MAX_POINTER_STEP = 0.01;
export const MAX_POINTER_STEP_TOUCH = 0.012;
export const TOUCH_INTENSITY_BOOST = 1.25;
export const SCROLL_MIN_DELTA = 2;
export const SCROLL_INTENSITY_SCALE = 0.72;

export type FluidPointer = {
  targetX: number;
  targetY: number;
  smoothX: number;
  smoothY: number;
  prevX: number;
  prevY: number;
  down: boolean;
  active: boolean;
  touch: boolean;
};

export function createFluidPointer(): FluidPointer {
  return {
    targetX: 0.5,
    targetY: 0.5,
    smoothX: 0.5,
    smoothY: 0.5,
    prevX: 0.5,
    prevY: 0.5,
    down: false,
    active: false,
    touch: false,
  };
}