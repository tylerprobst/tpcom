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
      <svg viewBox="0 0 200 80" className="h-full w-full drop-shadow-md">
        <ellipse cx="60" cy="50" rx="50" ry="30" fill="var(--cloud-white)" />
        <ellipse cx="100" cy="40" rx="55" ry="35" fill="var(--cloud-white)" />
        <ellipse cx="145" cy="48" rx="45" ry="28" fill="var(--cloud-white)" />
        <ellipse cx="85" cy="55" rx="70" ry="22" fill="var(--cloud-white)" />
      </svg>
    </div>
  );
}

export function CloudLayer({ style }: CloudLayerProps) {
  return (
    <div className="village-layer pointer-events-none" style={style}>
      <Cloud
        className="cloud-drift"
        style={{ top: "8%", left: "5%", width: "clamp(120px, 22vw, 220px)", height: "clamp(48px, 9vw, 88px)" }}
      />
      <Cloud
        className="cloud-drift-slow"
        style={{ top: "14%", right: "8%", width: "clamp(100px, 18vw, 180px)", height: "clamp(40px, 7vw, 72px)" }}
      />
      <Cloud
        className="cloud-drift-fast"
        style={{ top: "22%", left: "40%", width: "clamp(90px, 16vw, 160px)", height: "clamp(36px, 6vw, 64px)", opacity: 0.85 }}
      />
      <Cloud
        className="cloud-drift"
        style={{ top: "6%", left: "65%", width: "clamp(80px, 14vw, 140px)", height: "clamp(32px, 5vw, 56px)", opacity: 0.7 }}
      />
    </div>
  );
}