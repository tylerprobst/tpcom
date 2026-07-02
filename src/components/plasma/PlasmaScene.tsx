"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { PlasmaOrb } from "./PlasmaOrb";

export function PlasmaScene() {
  const pointer = useRef({ x: 0, y: 0, active: false });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  return (
    <Suspense fallback={null}>
      <ambientLight intensity={0.55} color="#c8d4dc" />
      <pointLight position={[2, 3, 5]} intensity={0.7} color="#f0e8dc" />
      <pointLight position={[-3, 0, 3]} intensity={0.35} color="#8aa8b8" />

      <PlasmaOrb
        pointer={pointer}
        reducedMotion={reducedMotion}
        isMobile={isMobile}
      />

      <mesh
        position={[0, 0, 1.5]}
        onPointerMove={(event) => {
          pointer.current.x = event.pointer.x;
          pointer.current.y = event.pointer.y;
          pointer.current.active = true;
        }}
        onPointerOut={() => {
          pointer.current.active = false;
        }}
        onPointerDown={() => {
          pointer.current.active = true;
        }}
      >
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </Suspense>
  );
}