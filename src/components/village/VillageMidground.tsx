import type { CSSProperties } from "react";
import {
  LEFT_FACADE,
  RIGHT_FACADE,
  VP,
  leftStreetEdge,
  rightStreetEdge,
} from "./streetGeometry";

type VillageMidgroundProps = {
  style?: CSSProperties;
};

function SignBoard({
  x,
  y,
  height,
  width = 22,
}: {
  x: number;
  y: number;
  height: number;
  width?: number;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={2}
        fill="var(--sign-cream)"
        stroke="#d4cfc4"
        strokeWidth={1}
      />
      <line x1={x + 5} y1={y + 10} x2={x + width - 5} y2={y + 10} stroke="#2a2a2a" strokeWidth={2} />
      <line x1={x + 5} y1={y + 22} x2={x + width - 5} y2={y + 22} stroke="#2a2a2a" strokeWidth={1.5} />
      <line x1={x + 5} y1={y + 34} x2={x + width - 5} y2={y + 34} stroke="#2a2a2a" strokeWidth={1.5} />
      <line x1={x + 8} y1={y + 46} x2={x + width - 8} y2={y + 46} stroke="#2a2a2a" strokeWidth={1} />
    </g>
  );
}

function Lantern({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g className="lantern-pulse" transform={`translate(${x}, ${y}) scale(${scale})`}>
      <line x1={0} y1={-8} x2={0} y2={0} stroke="#4a3020" strokeWidth={1.5} />
      <ellipse cx={0} cy={10} rx={9} ry={12} fill="var(--lantern-red)" />
      <ellipse cx={0} cy={10} rx={5} ry={7} fill="#ff6b4a" opacity={0.5} />
      <rect x={-3} y={20} width={6} height={4} rx={1} fill="#8b2020" />
    </g>
  );
}

function SakuraCluster({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g opacity={0.9}>
      <circle cx={cx} cy={cy} r={r} fill="var(--sakura-pink)" />
      <circle cx={cx - r * 0.6} cy={cy + r * 0.3} r={r * 0.7} fill="var(--sakura-deep)" opacity={0.8} />
      <circle cx={cx + r * 0.55} cy={cy + r * 0.2} r={r * 0.65} fill="var(--sakura-pale)" />
      <circle cx={cx} cy={cy - r * 0.4} r={r * 0.5} fill="var(--sakura-pale)" opacity={0.85} />
    </g>
  );
}

function Walker({ x, y, scale, kimono }: { x: number; y: number; scale: number; kimono: string }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={0.9}>
      <ellipse cx={0} cy={-28} rx={7} ry={8} fill="#2a2018" />
      <path d="M-12,0 Q0,-8 12,0 L10,32 Q0,38 -10,32 Z" fill={kimono} />
      <path d="M-10,32 L-14,52 M10,32 L14,52" stroke="#2a2018" strokeWidth={3} strokeLinecap="round" />
      <path d="M-6,0 Q0,6 6,0" fill="none" stroke={kimono} strokeWidth={1} opacity={0.5} />
    </g>
  );
}

function BuildingBeams({ side }: { side: "left" | "right" }) {
  const lines = [];
  for (let i = 0; i < 14; i++) {
    const t = i / 14;
    const left = leftStreetEdge(t);
    const right = rightStreetEdge(t);
    const y = left.y;

    if (side === "left") {
      lines.push(
        <line
          key={i}
          x1={0}
          y1={y}
          x2={left.x}
          y2={y}
          stroke="var(--wood-dark)"
          strokeWidth={1.5}
          opacity={0.35 + t * 0.2}
        />,
      );
    } else {
      lines.push(
        <line
          key={i}
          x1={right.x}
          y1={y}
          x2={1440}
          y2={y}
          stroke="var(--wood-dark)"
          strokeWidth={1.5}
          opacity={0.35 + t * 0.2}
        />,
      );
    }
  }
  return <g>{lines}</g>;
}

export function VillageMidground({ style }: VillageMidgroundProps) {
  return (
    <div className="village-layer" style={style}>
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="woodLeft" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--wood-dark)" />
            <stop offset="70%" stopColor="var(--wood-mid)" />
            <stop offset="100%" stopColor="var(--wood-light)" />
          </linearGradient>
          <linearGradient id="woodRight" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="var(--wood-dark)" />
            <stop offset="70%" stopColor="var(--wood-mid)" />
            <stop offset="100%" stopColor="var(--wood-light)" />
          </linearGradient>
          <clipPath id="clipLeft">
            <polygon points={LEFT_FACADE} />
          </clipPath>
          <clipPath id="clipRight">
            <polygon points={RIGHT_FACADE} />
          </clipPath>
        </defs>

        {/* Cherry blossom canopy framing the alley */}
        <g opacity={0.95}>
          <SakuraCluster cx={120} cy={60} r={90} />
          <SakuraCluster cx={280} cy={30} r={70} />
          <SakuraCluster cx={60} cy={180} r={55} />
          <SakuraCluster cx={200} cy={140} r={65} />
          <SakuraCluster cx={1320} cy={55} r={85} />
          <SakuraCluster cx={1160} cy={25} r={75} />
          <SakuraCluster cx={1380} cy={170} r={60} />
          <SakuraCluster cx={1240} cy={130} r={68} />
          <SakuraCluster cx={400} cy={10} r={50} />
          <SakuraCluster cx={1040} cy={8} r={48} />
          {/* Arching branches */}
          <path
            d="M0,200 Q200,80 500,120 Q650,140 720,100"
            fill="none"
            stroke="#5c3d2e"
            strokeWidth={8}
            opacity={0.5}
          />
          <path
            d="M1440,190 Q1240,70 940,110 Q790,130 720,95"
            fill="none"
            stroke="#5c3d2e"
            strokeWidth={8}
            opacity={0.5}
          />
        </g>

        {/* Left building row */}
        <polygon points={LEFT_FACADE} fill="url(#woodLeft)" />
        <g clipPath="url(#clipLeft)">
          <BuildingBeams side="left" />
          {/* Roof overhang left */}
          <path
            d="M0,280 L0,310 L420,870 L400,850 Z"
            fill="var(--roof-tile)"
            opacity={0.85}
          />
          <path
            d="M0,300 L180,420 L160,400 L0,290 Z"
            fill="var(--roof-tile-light)"
            opacity={0.4}
          />
          {/* Windows & doors at increasing depth */}
          <rect x={40} y={620} width={80} height={100} rx={3} fill="#2a1a0c" opacity={0.5} />
          <rect x={50} y={635} width={25} height={35} fill="#ffe8a0" opacity={0.35} />
          <rect x={85} y={635} width={25} height={35} fill="#ffe8a0" opacity={0.25} />
          <rect x={120} y={500} width={55} height={70} rx={2} fill="#2a1a0c" opacity={0.45} />
          <rect x={128} y={512} width={18} height={25} fill="#ffe8a0" opacity={0.3} />
          <rect x={200} y={400} width={40} height={55} rx={2} fill="#2a1a0c" opacity={0.4} />
          <rect x={250} y={330} width={30} height={40} rx={2} fill="#2a1a0c" opacity={0.35} />

          <SignBoard x={70} y={480} height={90} />
          <SignBoard x={160} y={370} height={75} width={18} />
          <SignBoard x={280} y={290} height={55} width={14} />

          <Lantern x={130} y={460} scale={1.2} />
          <Lantern x={220} y={360} scale={0.9} />
          <Lantern x={310} y={280} scale={0.65} />
        </g>

        {/* Right building row */}
        <polygon points={RIGHT_FACADE} fill="url(#woodRight)" />
        <g clipPath="url(#clipRight)">
          <BuildingBeams side="right" />
          <path
            d="M1440,275 L1440,305 L1040,865 L1060,845 Z"
            fill="var(--roof-tile)"
            opacity={0.85}
          />
          <rect x={1280} y={610} width={85} height={105} rx={3} fill="#2a1a0c" opacity={0.5} />
          <rect x={1290} y={625} width={26} height={36} fill="#ffe8a0" opacity={0.35} />
          <rect x={1325} y={625} width={26} height={36} fill="#ffe8a0" opacity={0.25} />
          <rect x={1180} y={490} width={58} height={72} rx={2} fill="#2a1a0c" opacity={0.45} />
          <rect x={1100} y={390} width={42} height={58} rx={2} fill="#2a1a0c" opacity={0.4} />
          <rect x={1020} y={320} width={32} height={42} rx={2} fill="#2a1a0c" opacity={0.35} />

          <SignBoard x={1340} y={475} height={88} />
          <SignBoard x={1220} y={365} height={72} width={18} />
          <SignBoard x={1120} y={285} height={52} width={14} />

          <Lantern x={1310} y={455} scale={1.2} />
          <Lantern x={1210} y={355} scale={0.9} />
          <Lantern x={1100} y={275} scale={0.65} />
        </g>

        {/* Mid-street lanterns receding */}
        <Lantern x={leftStreetEdge(0.35).x + 15} y={leftStreetEdge(0.35).y - 30} scale={0.5} />
        <Lantern x={rightStreetEdge(0.35).x - 15} y={rightStreetEdge(0.35).y - 30} scale={0.5} />
        <Lantern x={leftStreetEdge(0.55).x + 8} y={leftStreetEdge(0.55).y - 20} scale={0.35} />
        <Lantern x={rightStreetEdge(0.55).x - 8} y={rightStreetEdge(0.55).y - 20} scale={0.35} />

        {/* Figures walking away down the street */}
        <Walker x={700} y={560} scale={0.85} kimono="#d4789a" />
        <Walker x={735} y={555} scale={0.85} kimono="#8b6bae" />
        <Walker x={VP.x - 8} y={VP.y + 80} scale={0.35} kimono="#f0f0e8" />
      </svg>
    </div>
  );
}