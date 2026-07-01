import type { CSSProperties } from "react";

type ForegroundDetailsProps = {
  style?: CSSProperties;
};

export function ForegroundDetails({ style }: ForegroundDetailsProps) {
  return (
    <div className="village-layer pointer-events-none" style={style}>
      <svg
        viewBox="0 0 1440 300"
        preserveAspectRatio="none"
        className="absolute bottom-0 h-[38%] w-full"
        aria-hidden
      >
        <path
          d="M0,180 C200,120 400,200 600,150 C800,100 1000,180 1200,130 C1320,100 1380,140 1440,120 L1440,300 L0,300 Z"
          fill="var(--grass-dark)"
        />
        <path
          d="M0,210 C250,160 450,230 700,175 C950,120 1150,200 1440,160 L1440,300 L0,300 Z"
          fill="var(--grass-light)"
          opacity={0.85}
        />

        <path
          d="M480,210 C600,195 700,205 820,195 C900,188 960,200 1020,195 L1020,300 L480,300 Z"
          fill="var(--path-sand)"
        />
        <path
          d="M540,210 C660,200 760,208 880,200"
          fill="none"
          stroke="#d4a574"
          strokeWidth={3}
          opacity={0.5}
        />

        <g fill="#8B5E3C">
          <rect x={120} y={195} width={8} height={50} rx={2} />
          <rect x={118} y={190} width={12} height={8} rx={2} />
          <rect x={1280} y={200} width={8} height={45} rx={2} />
          <rect x={1278} y={195} width={12} height={8} rx={2} />
        </g>

        <circle cx={200} cy={230} r={18} fill="#f9a8c4" opacity={0.7} />
        <circle cx={220} cy={245} r={14} fill="#fda4b8" opacity={0.6} />
        <circle cx={1250} cy={235} r={16} fill="#fb7185" opacity={0.65} />
      </svg>

      <div className="petal petal-1" />
      <div className="petal petal-2" />
      <div className="petal petal-3" />
      <div className="petal petal-4" />
      <div className="petal petal-5" />
      <div className="petal petal-6" />
    </div>
  );
}