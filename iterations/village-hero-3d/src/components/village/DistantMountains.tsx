import type { CSSProperties } from "react";
import { VP } from "./streetGeometry";
import { C } from "./streetColors";

type DistantMountainsProps = {
  style?: CSSProperties;
};

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
            <stop offset="0%" stopColor={C.skyTop} />
            <stop offset="100%" stopColor={C.skyHorizon} />
          </linearGradient>
        </defs>

        <polygon
          points={`${VP.x - 80},60 ${VP.x + 80},60 ${VP.x + 50},${VP.y} ${VP.x - 50},${VP.y}`}
          fill="url(#skyCorridor)"
        />

        <path
          d={`M${VP.x - 140},${VP.y + 30} Q${VP.x - 50},${VP.y - 40} ${VP.x},${VP.y} Q${VP.x + 50},${VP.y - 40} ${VP.x + 140},${VP.y + 30} L${VP.x + 120},${VP.y + 80} L${VP.x - 120},${VP.y + 80} Z`}
          fill={C.foliage}
          opacity={0.85}
        />
        <path
          d={`M${VP.x - 100},${VP.y + 20} Q${VP.x - 30},${VP.y - 20} ${VP.x + 20},${VP.y + 15} Q${VP.x + 60},${VP.y - 10} ${VP.x + 110},${VP.y + 25}`}
          fill="none"
          stroke={C.sakuraPink}
          strokeWidth={12}
          opacity={0.5}
          strokeLinecap="round"
        />

        {/* Distant colorful shop row */}
        {[
          { x: VP.x - 100, w: 38, h: 55, c: C.woodMid },
          { x: VP.x - 58, w: 32, h: 62, c: C.plasterWarm },
          { x: VP.x - 22, w: 30, h: 68, c: C.woodLight },
          { x: VP.x + 14, w: 34, h: 58, c: C.plaster },
          { x: VP.x + 52, w: 36, h: 52, c: C.woodMid },
          { x: VP.x + 92, w: 32, h: 48, c: C.plasterWarm },
        ].map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={VP.y + 70 - b.h} width={b.w} height={b.h} fill={b.c} rx={2} />
            <path
              d={`M${b.x - 2},${VP.y + 70 - b.h + 8} L${b.x + b.w / 2},${VP.y + 70 - b.h - 6} L${b.x + b.w + 2},${VP.y + 70 - b.h + 8}`}
              fill={C.roofTile}
            />
            <rect
              x={b.x + b.w * 0.3}
              y={VP.y + 70 - b.h * 0.4}
              width={b.w * 0.35}
              height={b.h * 0.2}
              fill={C.windowGlow}
              opacity={0.6}
              rx={1}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}