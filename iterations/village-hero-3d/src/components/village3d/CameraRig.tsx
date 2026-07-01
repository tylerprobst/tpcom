"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMouseParallaxRef } from "./MouseParallaxContext";

export function CameraRig() {
  const { camera } = useThree();
  const mouse = useMouseParallaxRef();

  useFrame(() => {
    const isMobile = window.innerWidth <= 768;
    const targetX = isMobile ? 0 : mouse.current.x * 0.12;
    const targetY = isMobile ? 0 : mouse.current.y * 0.06;

    camera.position.x += (targetX - camera.position.x) * 0.04;
    camera.position.y += (targetY - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return null;
}