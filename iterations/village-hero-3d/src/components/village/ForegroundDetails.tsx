import type { CSSProperties } from "react";
import {
  STREET,
  STREET_SURFACE,
  leftStreetEdge,
  rightStreetEdge,
} from "./streetGeometry";
import { C } from "./streetColors";

type ForegroundDetailsProps = {
  style?: CSSProperties;
};

function Cobblestones() {
  const rows = [];
  for (let row = 0; row < 18; row++) {
    const t = row / 18;
    const tNext = (row + 1) / 18;
    const left = leftStreetEdge(t);
    const right = rightStreetEdge(t);
    const leftNext = leftStreetEdge(tNext);
    const rightNext = rightStreetEdge(tNext);

    const stonesInRow = Math.max(4, Math.floor(10 - t * 6));
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
      const fill = shade === 0 ? C.stoneLight : shade === 1 ? C.stoneMid : C.stoneDark;

      rows.push(
        <polygon
          key={`${row}-${s}`}
          points={`${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`}
          fill={fill}
          stroke="#7a7268"
          strokeWidth={0.6}
          opacity={0.92}
        />,
      );
    }
  }
  return <g>{rows}</g>;
}

function Rickshaw() {
  return (
    <g transform="translate(145, 640)">
      {/* Puller */}
      <ellipse cx={-32} cy={-52} rx={11} ry={12} fill="#3e2720" />
      <path d="M-46,-40 Q-32,-52 -18,-40 L-14,12 Q-32,18 -50,12 Z" fill={C.kimonoBlue} />
      <ellipse cx={-32} cy={-62} rx={15} ry={6} fill="#d4a76a" />
      <path d="M-40,12 L-44,48 M-24,12 L-20,48" stroke="#3e2720" strokeWidth={3.5} strokeLinecap="round" />

      {/* Rickshaw */}
      <ellipse cx={35} cy={32} rx={58} ry={20} fill="#2d2d2d" />
      <path d="M-22,4 Q35,-22 88,4 L84,32 Q35,48 -28,32 Z" fill="#2d2d2d" />
      <path d="M-12,-2 Q35,-16 78,-2 L76,20 Q35,30 -14,20 Z" fill={C.lanternRed} />
      <path d="M-8,6 Q35,-4 72,6 L70,16 Q35,22 -10,16 Z" fill={C.awningStripe} opacity={0.6} />
      <circle cx={-18} cy={42} r={11} fill="#3a3a3a" stroke="#555" strokeWidth={2} />
      <circle cx={82} cy={42} r={11} fill="#3a3a3a" stroke="#555" strokeWidth={2} />
      <circle cx={-18} cy={42} r={4} fill="#666" />
      <circle cx={82} cy={42} r={4} fill="#666" />

      {/* Passenger */}
      <ellipse cx={38} cy={-10} rx={9} ry={10} fill="#3e2720" />
      <path d="M24,2 Q38,-8 52,2 L48,30 Q38,36 28,30 Z" fill={C.plasterWarm} />
      <ellipse cx={38} cy={-18} rx={13} ry={5} fill="#d4a76a" />
      <path d="M20,8 Q38,18 56,8" fill="none" stroke={C.kimonoPink} strokeWidth={3} opacity={0.5} />
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
          <linearGradient id="streetWarmth" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={C.pathWarm} />
            <stop offset="60%" stopColor={C.stoneBase} />
            <stop offset="100%" stopColor={C.stoneLight} />
          </linearGradient>
          <linearGradient id="streetShadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(60,40,20,0.1)" />
          </linearGradient>
          <radialGradient id="sunPatch" cx="50%" cy="30%" r="50%">
            <stop offset="0%" stopColor="rgba(255,240,200,0.25)" />
            <stop offset="100%" stopColor="rgba(255,240,200,0)" />
          </radialGradient>
        </defs>

        <polygon points={STREET_SURFACE} fill="url(#streetWarmth)" />
        <Cobblestones />
        <polygon points={STREET_SURFACE} fill="url(#sunPatch)" />
        <polygon points={STREET_SURFACE} fill="url(#streetShadow)" />

        {/* Soft building shadows */}
        <polygon
          points={`0,900 0,680 ${leftStreetEdge(0.12).x},${leftStreetEdge(0.12).y} ${STREET.bottomLeft.x},${STREET.bottomLeft.y}`}
          fill="rgba(60,40,20,0.08)"
        />
        <polygon
          points={`1440,900 1440,680 ${rightStreetEdge(0.12).x},${rightStreetEdge(0.12).y} ${STREET.bottomRight.x},${STREET.bottomRight.y}`}
          fill="rgba(60,40,20,0.08)"
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