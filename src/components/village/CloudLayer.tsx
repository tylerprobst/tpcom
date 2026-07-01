import type { CSSProperties } from "react";

type CloudLayerProps = {
  style?: CSSProperties;
};

function Cloud({
  className,
  style,
}: {
  className: string;
  style: CSSProperties;
}) {
  return (
    <div className={`absolute ${className}`} style={style} aria-hidden>
      <svg viewBox="0 0 200 80" className="h-full w-full" style={{ filter: "drop-shadow(0 2px 6px rgba(255,255,255,0.3))" }}>
        <ellipse cx="60" cy="50" rx="50" ry="28" fill="var(--cloud-white)" opacity={0.95} />
        <ellipse cx="100" cy="42" rx="52" ry="32" fill="var(--cloud-white)" opacity={0.9} />
        <ellipse cx="145" cy="48" rx="42" ry="26" fill="var(--cloud-white)" opacity={0.85} />
      </svg>
    </div>
  );
}

export function CloudLayer({ style }: CloudLayerProps) {
  return (
    <div className="village-layer pointer-events-none" style={style}>
      {/* Clouds visible above the alley opening */}
      <Cloud
        className="cloud-drift"
        style={{ top: "6%", left: "30%", width: "clamp(100px, 16vw, 180px)", height: "clamp(40px, 6vw, 72px)", opacity: 0.7 }}
      />
      <Cloud
        className="cloud-drift-slow"
        style={{ top: "10%", right: "28%", width: "clamp(90px, 14vw, 160px)", height: "clamp(36px, 5vw, 64px)", opacity: 0.6 }}
      />
      <Cloud
        className="cloud-drift-fast"
        style={{ top: "4%", left: "52%", width: "clamp(70px, 10vw, 120px)", height: "clamp(28px, 4vw, 48px)", opacity: 0.5 }}
      />
    </div>
  );
}