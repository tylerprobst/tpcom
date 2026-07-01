import type { CSSProperties } from "react";

type CloudLayerProps = {
  style?: CSSProperties;
};

function Cloud({ className, style }: { className: string; style: CSSProperties }) {
  return (
    <div className={`absolute ${className}`} style={style} aria-hidden>
      <svg viewBox="0 0 200 80" className="h-full w-full">
        <ellipse cx="60" cy="50" rx="50" ry="28" fill="#ffffff" opacity={0.95} />
        <ellipse cx="100" cy="42" rx="52" ry="32" fill="#f8fcff" opacity={0.9} />
        <ellipse cx="145" cy="48" rx="42" ry="26" fill="#ffffff" opacity={0.85} />
      </svg>
    </div>
  );
}

export function CloudLayer({ style }: CloudLayerProps) {
  return (
    <div className="village-layer pointer-events-none" style={style}>
      <Cloud
        className="cloud-drift"
        style={{ top: "5%", left: "22%", width: "clamp(110px, 18vw, 200px)", height: "clamp(44px, 7vw, 80px)", opacity: 0.85 }}
      />
      <Cloud
        className="cloud-drift-slow"
        style={{ top: "9%", right: "20%", width: "clamp(100px, 16vw, 180px)", height: "clamp(40px, 6vw, 72px)", opacity: 0.75 }}
      />
      <Cloud
        className="cloud-drift-fast"
        style={{ top: "3%", left: "48%", width: "clamp(80px, 12vw, 140px)", height: "clamp(32px, 5vw, 56px)", opacity: 0.65 }}
      />
    </div>
  );
}