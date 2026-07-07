"use client";

import { useEffect, useRef, useState } from "react";
import { FluidSolver } from "@/components/fluid/FluidSolver";
import {
  createFluidPointer,
  SIM_RES_DESKTOP,
  SIM_RES_MOBILE,
} from "@/components/fluid/fluidConstants";

const POINTER_OPTIONS: AddEventListenerOptions = { passive: false };

export default function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const solverRef = useRef<FluidSolver | null>(null);
  const pointerRef = useRef(createFluidPointer());
  const activePointerIdRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 768px)");
    const update = () => {
      setReducedMotion(motion.matches);
      setIsMobile(mobile.matches);
    };
    update();
    motion.addEventListener("change", update);
    mobile.addEventListener("change", update);
    return () => {
      motion.removeEventListener("change", update);
      mobile.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let solver: FluidSolver;
    try {
      solver = new FluidSolver(
        canvas,
        isMobile ? SIM_RES_MOBILE : SIM_RES_DESKTOP,
      );
      solverRef.current = solver;
      setFailed(false);
    } catch {
      setFailed(true);
      return;
    }

    let raf = 0;
    const loop = () => {
      solver.resize();
      solver.tick(reducedMotionRef.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onResize = () => solver.resize();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      solver.destroy();
      solverRef.current = null;
    };
  }, [isMobile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pointer = pointerRef.current;

    const isTouch = (e: PointerEvent) => e.pointerType === "touch";

    const uvFromEvent = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) / rect.width,
        y: 1 - (e.clientY - rect.top) / rect.height,
      };
    };

    const syncPointer = (
      uv: { x: number; y: number },
      down: boolean,
      active: boolean,
      touch = false,
    ) => {
      pointer.down = down;
      pointer.targetX = uv.x;
      pointer.targetY = uv.y;
      pointer.active = active;
      solverRef.current?.setPointer(uv.x, uv.y, down, active, touch);
    };

    const releasePointer = (e: PointerEvent) => {
      if (activePointerIdRef.current !== e.pointerId) return;

      activePointerIdRef.current = null;
      const touch = isTouch(e);
      const stayActive = !touch && e.pointerType === "mouse";

      syncPointer(
        touch ? uvFromEvent(e) : { x: pointer.targetX, y: pointer.targetY },
        false,
        stayActive,
        false,
      );

      if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
    };

    const onEnter = (e: PointerEvent) => {
      if (isTouch(e)) return;
      syncPointer(uvFromEvent(e), pointer.down, true, false);
    };

    const onLeave = (e: PointerEvent) => {
      if (isTouch(e)) return;
      syncPointer(
        { x: pointer.targetX, y: pointer.targetY },
        false,
        false,
        false,
      );
    };

    const onDown = (e: PointerEvent) => {
      if (activePointerIdRef.current !== null && isTouch(e)) return;

      e.preventDefault();
      activePointerIdRef.current = e.pointerId;
      canvas.setPointerCapture(e.pointerId);
      syncPointer(uvFromEvent(e), true, true, isTouch(e));
    };

    const onMove = (e: PointerEvent) => {
      if (
        activePointerIdRef.current !== null &&
        e.pointerId !== activePointerIdRef.current
      ) {
        return;
      }

      if (isTouch(e)) {
        e.preventDefault();
        const events = e.getCoalescedEvents?.() ?? [e];
        let prevX = pointer.targetX;
        let prevY = pointer.targetY;

        for (const ev of events) {
          const uv = uvFromEvent(ev);
          const dx = uv.x - prevX;
          const dy = uv.y - prevY;
          prevX = uv.x;
          prevY = uv.y;
          pointer.targetX = uv.x;
          pointer.targetY = uv.y;
          solverRef.current?.feedTouch(uv.x, uv.y, dx, dy);
        }
        return;
      }

      const uv = uvFromEvent(e);
      pointer.targetX = uv.x;
      pointer.targetY = uv.y;
      solverRef.current?.setPointer(uv.x, uv.y, pointer.down, true, false);
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    canvas.addEventListener("pointerenter", onEnter);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onDown, POINTER_OPTIONS);
    canvas.addEventListener("pointermove", onMove, POINTER_OPTIONS);
    canvas.addEventListener("pointerup", releasePointer);
    canvas.addEventListener("pointercancel", releasePointer);
    canvas.addEventListener("touchmove", onTouchMove, POINTER_OPTIONS);

    return () => {
      canvas.removeEventListener("pointerenter", onEnter);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown, POINTER_OPTIONS);
      canvas.removeEventListener("pointermove", onMove, POINTER_OPTIONS);
      canvas.removeEventListener("pointerup", releasePointer);
      canvas.removeEventListener("pointercancel", releasePointer);
      canvas.removeEventListener("touchmove", onTouchMove, POINTER_OPTIONS);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden bg-[#06080c]"
      aria-hidden
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
      />
      {failed && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-[#6b7580]">
          WebGL2 fluid simulation unavailable in this browser.
        </p>
      )}
    </div>
  );
}