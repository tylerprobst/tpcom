"use client";

import { useEffect, useRef } from "react";
import type { FluidSolver } from "@/components/fluid/FluidSolver";
import {
  resolveGestureMode,
  uvFromClient,
  type GestureMode,
} from "@/components/fluid/mobileGesture";

const POINTER_OPTIONS: AddEventListenerOptions = { passive: false };

type MobileGestureLayerProps = {
  solverRef: React.RefObject<FluidSolver | null>;
  reducedMotionRef: React.RefObject<boolean>;
};

export function MobileGestureLayer({
  solverRef,
  reducedMotionRef,
}: MobileGestureLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    let mode: GestureMode = "idle";
    let pointerId: number | null = null;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;

    const reset = () => {
      mode = "idle";
      pointerId = null;
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;

      pointerId = e.pointerId;
      mode = "pending";
      startX = e.clientX;
      startY = e.clientY;
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "touch" || e.pointerId !== pointerId) return;
      if (reducedMotionRef.current) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const nextMode = resolveGestureMode(dx, dy, mode);

      if (nextMode === "scroll" && mode === "pending") {
        mode = "scroll";
        pointerId = null;
        return;
      }

      if (nextMode === "fluid" && mode === "pending") {
        mode = "fluid";
        layer.setPointerCapture(e.pointerId);
        const uv = uvFromClient(e.clientX, e.clientY);
        solverRef.current?.setPointer(uv.x, uv.y, true, true, true);
        lastX = e.clientX;
        lastY = e.clientY;
        e.preventDefault();
        return;
      }

      if (mode === "fluid") {
        e.preventDefault();
        const events = e.getCoalescedEvents?.() ?? [e];

        for (const ev of events) {
          const uv = uvFromClient(ev.clientX, ev.clientY);
          const prevUv = uvFromClient(lastX, lastY);
          solverRef.current?.feedTouch(
            uv.x,
            uv.y,
            uv.x - prevUv.x,
            uv.y - prevUv.y,
          );
          lastX = ev.clientX;
          lastY = ev.clientY;
        }
      }
    };

    const onEnd = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;

      if (mode === "fluid" && e.pointerId === pointerId) {
        const uv = uvFromClient(e.clientX, e.clientY);
        solverRef.current?.setPointer(uv.x, uv.y, false, false, false);
        if (layer.hasPointerCapture(e.pointerId)) {
          layer.releasePointerCapture(e.pointerId);
        }
      }

      reset();
    };

    layer.addEventListener("pointerdown", onDown, POINTER_OPTIONS);
    layer.addEventListener("pointermove", onMove, POINTER_OPTIONS);
    layer.addEventListener("pointerup", onEnd);
    layer.addEventListener("pointercancel", onEnd);

    return () => {
      layer.removeEventListener("pointerdown", onDown, POINTER_OPTIONS);
      layer.removeEventListener("pointermove", onMove, POINTER_OPTIONS);
      layer.removeEventListener("pointerup", onEnd);
      layer.removeEventListener("pointercancel", onEnd);
    };
  }, [reducedMotionRef, solverRef]);

  return (
    <div
      ref={layerRef}
      className="fixed inset-0 z-[5] touch-pan-y md:hidden"
      aria-hidden
    />
  );
}