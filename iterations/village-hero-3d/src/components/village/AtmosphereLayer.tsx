import type { CSSProperties } from "react";

type AtmosphereLayerProps = {
  style?: CSSProperties;
};

/** Warm daylight haze and ground bounce light. */
export function AtmosphereLayer({ style }: AtmosphereLayerProps) {
  return (
    <div className="village-layer pointer-events-none" style={style}>
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 30%, rgba(255, 240, 210, 0.35) 0%, transparent 70%),
            radial-gradient(ellipse 90% 40% at 50% 100%, rgba(255, 220, 180, 0.12) 0%, transparent 60%),
            linear-gradient(180deg, transparent 0%, transparent 55%, rgba(0, 0, 0, 0.08) 100%)
          `,
        }}
      />
    </div>
  );
}