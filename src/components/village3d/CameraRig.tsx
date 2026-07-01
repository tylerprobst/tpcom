"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { Vector3 } from "three";
import { useMouseParallaxRef } from "./MouseParallaxContext";
import { useScrollProgressRef } from "./ScrollProgressContext";
import { SCROLL_CAMERA, easeInOutCubic } from "./sceneConfig";

export function CameraRig() {
  const { camera } = useThree();
  const mouse = useMouseParallaxRef();
  const scroll = useScrollProgressRef();
  const lookAt = useRef(new Vector3());

  useFrame(() => {
    const isMobile = window.innerWidth <= 768;
    const eased = easeInOutCubic(scroll.current);

    const baseX = isMobile ? 0 : mouse.current.x * 0.12 * (1 - eased * 0.5);
    const baseY =
      SCROLL_CAMERA.startY +
      (SCROLL_CAMERA.endY - SCROLL_CAMERA.startY) * eased +
      (isMobile ? 0 : mouse.current.y * 0.06 * (1 - eased * 0.5));

    const baseZ =
      SCROLL_CAMERA.startZ +
      (SCROLL_CAMERA.endZ - SCROLL_CAMERA.startZ) * eased;

    camera.position.x += (baseX - camera.position.x) * 0.06;
    camera.position.y += (baseY - camera.position.y) * 0.06;
    camera.position.z += (baseZ - camera.position.z) * 0.06;

    lookAt.current.set(
      SCROLL_CAMERA.lookAtStart[0] +
        (SCROLL_CAMERA.lookAtEnd[0] - SCROLL_CAMERA.lookAtStart[0]) * eased,
      SCROLL_CAMERA.lookAtStart[1] +
        (SCROLL_CAMERA.lookAtEnd[1] - SCROLL_CAMERA.lookAtStart[1]) * eased,
      SCROLL_CAMERA.lookAtStart[2] +
        (SCROLL_CAMERA.lookAtEnd[2] - SCROLL_CAMERA.lookAtStart[2]) * eased,
    );
    camera.lookAt(lookAt.current);
  });

  return null;
}