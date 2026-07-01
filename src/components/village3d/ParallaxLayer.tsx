"use client";

import { Image } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { CAMERA_Z, type SceneLayer } from "./sceneConfig";
import { useMouseParallaxRef } from "./MouseParallaxContext";

type ParallaxLayerProps = {
  layer: SceneLayer;
};

export function ParallaxLayer({ layer }: ParallaxLayerProps) {
  const group = useRef<Group>(null);
  const mouse = useMouseParallaxRef();
  const viewport = useThree((state) => state.viewport);
  const target = useRef({ x: 0, y: 0 });

  const distance = CAMERA_Z - layer.z;
  const scaleFactor = (distance / 5) * (layer.coverScale ?? 1.05);

  useFrame(() => {
    if (!group.current) return;

    const isMobile = window.innerWidth <= 768;
    const mx = isMobile ? 0 : mouse.current.x;
    const my = isMobile ? 0 : mouse.current.y;

    target.current.x = mx * layer.parallax * 0.45;
    target.current.y = my * layer.parallax * 0.28;

    group.current.position.x += (target.current.x - group.current.position.x) * 0.06;
    group.current.position.y += (target.current.y - group.current.position.y) * 0.06;
  });

  return (
    <group ref={group} position={[0, 0, layer.z]}>
      <Image
        url={layer.texture}
        scale={[viewport.width * scaleFactor, viewport.height * scaleFactor]}
        transparent
        opacity={layer.opacity ?? 1}
        toneMapped={false}
      />
    </group>
  );
}