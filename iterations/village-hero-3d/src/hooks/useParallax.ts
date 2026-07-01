"use client";

import { useCallback, useEffect, useState } from "react";

type ParallaxOffset = {
  x: number;
  y: number;
};

export function useParallax() {
  const [offset, setOffset] = useState<ParallaxOffset>({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      setOffset({ x, y });
    },
    [isMobile],
  );

  const layerStyle = useCallback(
    (depth: number) => {
      if (isMobile) return {};

      const multiplier = depth * 24;
      return {
        transform: `translate(${offset.x * multiplier}px, ${offset.y * multiplier * 0.6}px)`,
      };
    },
    [offset, isMobile],
  );

  return { handleMouseMove, layerStyle, isMobile };
}