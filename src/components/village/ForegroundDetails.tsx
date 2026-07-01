import type { CSSProperties } from "react";
import {
  STREET,
  STREET_SURFACE,
  leftStreetEdge,
  rightStreetEdge,
} from "./streetGeometry";

type ForegroundDetailsProps = {
  style?: CSSProperties;
};

function Cobblestones() {
  const rows = [];
  for (let row = 0; row < 16; row++) {
    const t = row / 16;
    const tNext = (row + 1) / 16;
    const left = leftStreetEdge(t);
    const right = rightStreetEdge(t);
    const leftNext = leftStreetEdge(tNext);
    const rightNext = rightStreetEdge(tNext);

    const stonesInRow = Math.max(3, Math.floor(8 - t * 5));
    for (let s = 0; s < stonesInRow; s++) {
      const st = s / stonesInRow;
      const stNext = (s + 1) / stonesInRow;

      const x1 = left.x + (right.x - left.x) * st;
      const y1 = left.y + (right.y - left.y) * st;
      const x2 = left.x + (right.x - left.x) * stNext;
      const y2 = left.y + (right.y - left.y) * stNext;
      const x3 = leftNext.x + (rightNext.x - leftNext.x) * stNext;
      const y3 = leftNext.y + (rightNext.y - leftNext.y) * stNext;
      const x4 = leftNext.x + (rightNext.x - leftNext.x) * st;
      const y4 = leftNext.y + (rightNext.y - leftNext.y) * st;

      const shade = (row + s) % 3;
      const fill =
        shade === 0
          ? "var(--stone-light)"
          : shade === 1
            ? "var(--stone-mid)"
            : "var(--stone-dark)";

      rows.push(
        <polygon
          key={`${row}-${s}`}
          points={`${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`}
          fill={fill}
          stroke="#4a4a44"
          strokeWidth={0.5}
          opacity={0.85 + t * 0.1}
        />,
      );
    }
  }
  return <g>{rows}</g>;
}

function Rickshaw() {
  return (
    <g transform="translate(130, 620)">
      {/* Puller */}
      <ellipse cx={-30} cy={-50} rx={10} ry={11} fill="#2a2018" />
      <path d="M-42,-38 Q-30,-48 -18,-38 L-14,10 Q-30,16 -46,10 Z" fill="#4a7cb8" />
      <ellipse cx={-30} cy={-58} rx={14} ry={5} fill="#c4a86a" />
      <path d="M-38,10 L-42,42 M-22,10 L-18,42" stroke="#2a2018" strokeWidth={3} strokeLinecap="round" />

      {/* Rickshaw body */}
      <ellipse cx={30} cy={30} rx={55} ry={18} fill="#1a1a1a" />
      <ellipse cx={30} cy={22} rx={48} ry={14} fill="#222" />
      <path d="M-20,5 Q30,-20 80,5 L75,30 Q30,45 -25,30 Z" fill="#1a1a1a" />
      <path d="M-10,0 Q30,-14 70,0 L68,18 Q30,28 -12,18 Z" fill="#c62828" />
      <circle cx={-15} cy={38} r={10} fill="#2a2a2a" stroke="#444" strokeWidth={2} />
      <circle cx={75} cy={38} r={10} fill="#2a2a2a" stroke="#444" strokeWidth={2} />

      {/* Passenger */}
      <ellipse cx={35} cy={-8} rx={8} ry={9} fill="#2a2018" />
      <path d="M22,2 Q35,-6 48,2 L44,28 Q35,34 26,28 Z" fill="#f0e8d8" />
      <ellipse cx={35} cy={-16} rx={12} ry={5} fill="#c4a86a" />
    </g>
  );
}

export function ForegroundDetails({ style }: ForegroundDetailsProps) {
  return (
    <div className="village-layer pointer-events-none" style={style}>
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="streetShadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
          </linearGradient>
        </defs>

        {/* Street surface */}
        <polygon points={STREET_SURFACE} fill="var(--stone-mid)" />
        <Cobblestones />
        <polygon points={STREET_SURFACE} fill="url(#streetShadow)" />

        {/* Building shadows cast onto street */}
        <polygon
          points={`0,900 0,700 ${leftStreetEdge(0.15).x},${leftStreetEdge(0.15).y} ${STREET.bottomLeft.x},${STREET.bottomLeft.y}`}
          fill="rgba(0,0,0,0.12)"
        />
        <polygon
          points={`1440,900 1440,700 ${rightStreetEdge(0.15).x},${rightStreetEdge(0.15).y} ${STREET.bottomRight.x},${STREET.bottomRight.y}`}
          fill="rgba(0,0,0,0.12)"
        />

        <Rickshaw />
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