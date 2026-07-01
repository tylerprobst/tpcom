import Image from "next/image";
import type { CSSProperties } from "react";
import type { VillageLayer } from "./villageLayers";

type ImageParallaxLayerProps = {
  layer: VillageLayer;
  style?: CSSProperties;
};

export function ImageParallaxLayer({ layer, style }: ImageParallaxLayerProps) {
  const scale = layer.scale ?? 1.1;

  return (
    <div className="village-layer" style={style}>
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ opacity: layer.opacity ?? 1 }}
      >
        <Image
          src={layer.src}
          alt=""
          fill
          priority={layer.depth < 0.05}
          sizes="100vw"
          className="pointer-events-none select-none"
          style={{
            objectFit: "cover",
            objectPosition: layer.objectPosition ?? "center center",
            transform: `scale(${scale})`,
            transformOrigin: layer.objectPosition ?? "center center",
            ...(layer.fadeTop
              ? {
                  maskImage:
                    "linear-gradient(to bottom, transparent 0%, black 35%, black 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, transparent 0%, black 35%, black 100%)",
                }
              : {}),
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}