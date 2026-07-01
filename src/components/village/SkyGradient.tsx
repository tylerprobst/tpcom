import type { CSSProperties } from "react";

type SkyGradientProps = {
  style?: CSSProperties;
};

export function SkyGradient({ style }: SkyGradientProps) {
  return (
    <div className="village-layer" style={style}>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            180deg,
            var(--sky-lavender) 0%,
            var(--sky-peach) 35%,
            var(--sky-blue) 70%,
            var(--sky-deep) 100%
          )`,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          top: "12%",
          right: "18%",
          width: "clamp(80px, 18vw, 180px)",
          height: "clamp(80px, 18vw, 180px)",
          background:
            "radial-gradient(circle, rgba(255, 236, 179, 0.95) 0%, rgba(255, 212, 168, 0.4) 50%, transparent 70%)",
          boxShadow: "0 0 60px rgba(255, 220, 150, 0.5)",
        }}
      />
    </div>
  );
}