import type { CSSProperties } from "react";
import { C } from "./streetColors";

type SkyGradientProps = {
  style?: CSSProperties;
};

export function SkyGradient({ style }: SkyGradientProps) {
  return (
    <div className="village-layer" style={style}>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${C.skyTop} 0%, ${C.skyMid} 50%, ${C.skyHorizon} 100%)`,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          top: "8%",
          left: "55%",
          width: "clamp(100px, 20vw, 200px)",
          height: "clamp(100px, 20vw, 200px)",
          background:
            "radial-gradient(circle, rgba(255, 248, 220, 0.7) 0%, rgba(255, 230, 180, 0.2) 50%, transparent 70%)",
        }}
      />
    </div>
  );
}