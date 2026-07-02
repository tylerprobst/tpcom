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
      <ambientLight intensity={0.35} color="#d4e0e8" />
      <pointLight position={[3, 2, 4]} intensity={1.2} color="#f5e6d0" />
      <pointLight position={[-3, -1, 2]} intensity={0.5} color="#6b8fa3" />

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