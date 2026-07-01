import type { CSSProperties } from "react";
import { VP } from "./streetGeometry";

type DistantMountainsProps = {
  style?: CSSProperties;
};

/** Alley depth — sky corridor, distant rooftops, and greenery at vanishing point. */
export function DistantMountains({ style }: DistantMountainsProps) {
  return (
    <div className="village-layer" style={style}>
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="skyCorridor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8ecae6" />
            <stop offset="100%" stopColor="#d4e8f5" />
          </linearGradient>
        </defs>

        {/* Sky visible through the alley */}
        <polygon
          points={`${VP.x - 60},80 ${VP.x + 60},80 ${VP.x + 42},${VP.y} ${VP.x - 42},${VP.y}`}
          fill="url(#skyCorridor)"
        />

        {/* Distant green hills */}
        <path
          d={`M${VP.x - 120},${VP.y + 20} Q${VP.x - 40},${VP.y - 30} ${VP.x},${VP.y + 5} Q${VP.x + 40},${VP.y - 30} ${VP.x + 120},${VP.y + 20} L${VP.x + 100},${VP.y + 60} L${VP.x - 100},${VP.y + 60} Z`}
          fill="var(--foliage-green)"
          opacity={0.75}
        />

        {/* Far buildings silhouetted at end of street */}
        <rect x={VP.x - 90} y={VP.y - 10} width={36} height={50} fill="var(--wood-mid)" opacity={0.6} />
        <rect x={VP.x - 48} y={VP.y - 18} width={30} height={58} fill="var(--wood-dark)" opacity={0.55} />
        <rect x={VP.x - 10} y={VP.y - 22} width={28} height={62} fill="var(--wood-mid)" opacity={0.5} />
        <rect x={VP.x + 22} y={VP.y - 15} width={32} height={55} fill="var(--wood-dark)" opacity={0.55} />
        <rect x={VP.x + 58} y={VP.y - 8} width={34} height={48} fill="var(--wood-mid)" opacity={0.5} />

        {/* Distant roofline */}
        <path
          d={`M${VP.x - 95},${VP.y - 12} L${VP.x - 72},${VP.y - 28} L${VP.x - 54},${VP.y - 12} L${VP.x - 30},${VP.y - 32} L${VP.x - 8},${VP.y - 14} L${VP.x + 14},${VP.y - 30} L${VP.x + 36},${VP.y - 14} L${VP.x + 60},${VP.y - 26} L${VP.x + 92},${VP.y - 10}`}
          fill="none"
          stroke="var(--roof-tile)"
          strokeWidth={4}
          opacity={0.5}
        />
      </svg>
    </div>
  );
}