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
            var(--sky-top) 0%,
            var(--sky-mid) 45%,
            var(--sky-horizon) 100%
          )`,
        }}
      />
    </div>
  );
}