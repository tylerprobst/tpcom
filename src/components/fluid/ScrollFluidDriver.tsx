"use client";

import { useEffect } from "react";
import type { FluidSolver } from "@/components/fluid/FluidSolver";
import {
  SCROLL_INTENSITY_SCALE,
  SCROLL_MIN_DELTA,
} from "@/components/fluid/fluidConstants";

type ScrollFluidDriverProps = {
  solverRef: React.RefObject<FluidSolver | null>;
  reducedMotionRef: React.RefObject<boolean>;
};

export function ScrollFluidDriver({
  solverRef,
  reducedMotionRef,
}: ScrollFluidDriverProps) {
  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 768px)");

    let lastScrollY = window.scrollY;
    let frame = 0;
    let queued = false;

    const applyScrollSplat = () => {
      queued = false;
      const solver = solverRef.current;
      const scrollY = window.scrollY;
      const delta = scrollY - lastScrollY;
      lastScrollY = scrollY;

      if (!solver || reducedMotionRef.current || Math.abs(delta) < SCROLL_MIN_DELTA) {
        return;
      }

      const height = window.innerHeight;
      const phase = scrollY * 0.01;
      const x = 0.5 + Math.sin(phase) * 0.2;
      const y = 0.48 + Math.cos(phase * 0.85) * 0.12;
      const dx = Math.sin(phase * 1.4) * (delta / height) * 2.4;
      const dy = -(delta / height) * 3.4;
      const intensity =
        SCROLL_INTENSITY_SCALE *
        (0.55 + Math.min(Math.abs(delta) * 0.035, 1.1));

      solver.splatPointer(x, y, dx, dy, intensity);
    };

    const onScroll = () => {
      if (!mobile.matches || queued) return;
      queued = true;
      frame = requestAnimationFrame(applyScrollSplat);
    };

    const attach = () => {
      lastScrollY = window.scrollY;
      window.addEventListener("scroll", onScroll, { passive: true });
    };

    const detach = () => {
      window.removeEventListener("scroll", onScroll);
    };

    if (mobile.matches) attach();

    const onMobileChange = () => {
      detach();
      if (mobile.matches) attach();
    };

    mobile.addEventListener("change", onMobileChange);

    return () => {
      mobile.removeEventListener("change", onMobileChange);
      detach();
      cancelAnimationFrame(frame);
    };
  }, [reducedMotionRef, solverRef]);

  return null;
}