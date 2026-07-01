import type { CSSProperties } from "react";
import {
  LEFT_FACADE,
  RIGHT_FACADE,
  VP,
  leftStreetEdge,
  rightStreetEdge,
} from "./streetGeometry";
import { C } from "./streetColors";

type VillageMidgroundProps = {
  style?: CSSProperties;
};

function SignBoard({
  x,
  y,
  height,
  width = 24,
  variant = "cream",
}: {
  x: number;
  y: number;
  height: number;
  width?: number;
  variant?: "cream" | "green";
}) {
  const bg = variant === "green" ? C.signGreen : C.signCream;
  const stroke = variant === "green" ? C.signGreenDark : "#d4cfc4";
  const ink = variant === "green" ? "#fff" : "#2a2a2a";

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={2} fill={bg} stroke={stroke} strokeWidth={1.5} />
      <line x1={x + 4} y1={y + 12} x2={x + width - 4} y2={y + 12} stroke={ink} strokeWidth={variant === "green" ? 1.5 : 2} />
      <line x1={x + 4} y1={y + 24} x2={x + width - 4} y2={y + 24} stroke={ink} strokeWidth={1.5} />
      <line x1={x + 4} y1={y + 36} x2={x + width - 4} y2={y + 36} stroke={ink} strokeWidth={1} />
      {variant === "cream" && (
        <line x1={x + 6} y1={y + 48} x2={x + width - 6} y2={y + 48} stroke={ink} strokeWidth={1} />
      )}
    </g>
  );
}

function Lantern({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g className="lantern-pulse" transform={`translate(${x}, ${y}) scale(${scale})`}>
      <line x1={0} y1={-10} x2={0} y2={0} stroke={C.woodTrim} strokeWidth={2} />
      <rect x={-11} y={-2} width={22} height={6} rx={2} fill={C.woodTrim} />
      <ellipse cx={0} cy={14} rx={11} ry={14} fill={C.lanternRed} />
      <ellipse cx={0} cy={14} rx={6} ry={8} fill={C.lanternGlow} opacity={0.55} />
      <line x1={-4} y1={8} x2={4} y2={8} stroke="#fff" strokeWidth={1} opacity={0.4} />
      <rect x={-4} y={26} width={8} height={5} rx={1} fill="#b71c1c" />
    </g>
  );
}

function SakuraCluster({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={C.sakuraPink} opacity={0.92} />
      <circle cx={cx - r * 0.55} cy={cy + r * 0.25} r={r * 0.72} fill={C.sakuraDeep} opacity={0.8} />
      <circle cx={cx + r * 0.5} cy={cy + r * 0.15} r={r * 0.68} fill={C.sakuraPale} />
      <circle cx={cx} cy={cy - r * 0.35} r={r * 0.55} fill={C.sakuraHot} opacity={0.75} />
      <circle cx={cx + r * 0.3} cy={cy + r * 0.4} r={r * 0.35} fill={C.sakuraPale} opacity={0.7} />
    </g>
  );
}

function Walker({ x, y, scale, kimono, obi }: { x: number; y: number; scale: number; kimono: string; obi?: string }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={-30} rx={8} ry={9} fill="#3e2720" />
      <path d="M-14,2 Q0,-10 14,2 L12,36 Q0,44 -12,36 Z" fill={kimono} />
      {obi && <rect x={-10} y={14} width={20} height={6} rx={2} fill={obi} />}
      <path d="M-11,36 L-15,58 M11,36 L15,58" stroke="#3e2720" strokeWidth={3.5} strokeLinecap="round" />
    </g>
  );
}

function ShopBay({
  t,
  side,
  plaster = false,
}: {
  t: number;
  side: "left" | "right";
  plaster?: boolean;
}) {
  const depth = 0.07;
  const tFar = Math.max(0, t - depth);
  const near = side === "left" ? leftStreetEdge(t) : rightStreetEdge(t);
  const far = side === "left" ? leftStreetEdge(tFar) : rightStreetEdge(tFar);
  const wallX = side === "left" ? 0 : 1440;
  const protrusion = side === "left" ? 60 * (1 - t) + 20 : -(60 * (1 - t) + 20);

  const x1 = side === "left" ? wallX + protrusion * 0.3 : wallX + protrusion * 0.3;
  const x2 = near.x;
  const x3 = far.x;
  const x4 = side === "left" ? wallX + protrusion * 0.1 : wallX + protrusion * 0.1;

  const wallFill = plaster ? C.plasterWarm : C.woodMid;
  const trim = C.woodTrim;

  const points =
    side === "left"
      ? `${x1},${near.y} ${x2},${near.y} ${x3},${far.y} ${x4},${far.y}`
      : `${x2},${near.y} ${x1},${near.y} ${x4},${far.y} ${x3},${far.y}`;

  const signX = side === "left" ? near.x - 28 : near.x + 4;
  const lanternX = side === "left" ? near.x - 10 : near.x + 10;
  const scale = 0.5 + (1 - t) * 0.8;

  return (
    <g>
      <polygon points={points} fill={wallFill} stroke={trim} strokeWidth={1} opacity={0.95} />
      {/* Roof cap */}
      <polygon
        points={
          side === "left"
            ? `${x1 - 5},${near.y} ${x2 + 8},${near.y} ${x3 + 4},${far.y} ${x4 - 3},${far.y}`
            : `${x2 - 8},${near.y} ${x1 + 5},${near.y} ${x4 + 3},${far.y} ${x3 - 4},${far.y}`
        }
        fill={C.roofAccent}
        opacity={0.9}
      />
      {/* Awning */}
      <polygon
        points={
          side === "left"
            ? `${x2 - 5},${near.y + 5} ${x2 + 35 * scale},${near.y + 18} ${x3 + 20 * scale},${far.y + 5} ${x3 - 5},${far.y}`
            : `${x2 + 5},${near.y + 5} ${x2 - 35 * scale},${near.y + 18} ${x3 - 20 * scale},${far.y + 5} ${x3 + 5},${far.y}`
        }
        fill={C.awningRed}
        opacity={0.85}
      />
      {/* Window glow */}
      <rect
        x={side === "left" ? near.x - 40 * scale : near.x + 8}
        y={near.y - 45 * scale}
        width={22 * scale}
        height={28 * scale}
        fill={C.woodTrim}
        rx={2}
        opacity={0.7}
      />
      <rect
        x={side === "left" ? near.x - 36 * scale : near.x + 12}
        y={near.y - 40 * scale}
        width={14 * scale}
        height={18 * scale}
        fill={C.windowGlow}
        rx={1}
        opacity={0.75}
      />
      <SignBoard x={signX} y={near.y - 75 * scale} height={55 * scale} width={20 * scale} variant={t < 0.3 ? "green" : "cream"} />
      <Lantern x={lanternX} y={near.y - 15 * scale} scale={scale} />
    </g>
  );
}

function BuildingBeams({ side }: { side: "left" | "right" }) {
  const lines = [];
  for (let i = 0; i < 16; i++) {
    const t = i / 16;
    const left = leftStreetEdge(t);
    const right = rightStreetEdge(t);
    const y = left.y;
    const color = i % 3 === 0 ? C.woodTrim : C.woodDark;

    if (side === "left") {
      lines.push(
        <line key={i} x1={0} y1={y} x2={left.x} y2={y} stroke={color} strokeWidth={i % 3 === 0 ? 2.5 : 1} opacity={0.25 + t * 0.35} />,
      );
    } else {
      lines.push(
        <line key={i} x1={right.x} y1={y} x2={1440} y2={y} stroke={color} strokeWidth={i % 3 === 0 ? 2.5 : 1} opacity={0.25 + t * 0.35} />,
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
          <linearGradient id="woodLeft" x1="0" y1="0" x2="1" y2="0.3">
            <stop offset="0%" stopColor={C.woodDark} />
            <stop offset="50%" stopColor={C.woodMid} />
            <stop offset="100%" stopColor={C.woodLight} />
          </linearGradient>
          <linearGradient id="woodRight" x1="1" y1="0" x2="0" y2="0.3">
            <stop offset="0%" stopColor={C.woodDark} />
            <stop offset="50%" stopColor={C.woodMid} />
            <stop offset="100%" stopColor={C.woodLight} />
          </linearGradient>
          <clipPath id="clipLeft">
            <polygon points={LEFT_FACADE} />
          </clipPath>
          <clipPath id="clipRight">
            <polygon points={RIGHT_FACADE} />
          </clipPath>
        </defs>

        {/* Cherry blossom canopy */}
        <g>
          <SakuraCluster cx={100} cy={50} r={100} />
          <SakuraCluster cx={300} cy={20} r={80} />
          <SakuraCluster cx={50} cy={170} r={65} />
          <SakuraCluster cx={220} cy={120} r={75} />
          <SakuraCluster cx={1340} cy={45} r={95} />
          <SakuraCluster cx={1140} cy={18} r={82} />
          <SakuraCluster cx={1390} cy={160} r={68} />
          <SakuraCluster cx={1220} cy={115} r={72} />
          <SakuraCluster cx={500} cy={5} r={55} />
          <SakuraCluster cx={940} cy={3} r={52} />
          <SakuraCluster cx={720} cy={40} r={45} />
          <path d="M0,220 Q250,60 520,110 Q680,150 720,90" fill="none" stroke={C.woodDark} strokeWidth={10} opacity={0.35} strokeLinecap="round" />
          <path d="M1440,210 Q1190,55 920,105 Q760,145 720,85" fill="none" stroke={C.woodDark} strokeWidth={10} opacity={0.35} strokeLinecap="round" />
        </g>

        {/* Base building walls */}
        <polygon points={LEFT_FACADE} fill="url(#woodLeft)" />
        <polygon points={RIGHT_FACADE} fill="url(#woodRight)" />

        <g clipPath="url(#clipLeft)">
          <BuildingBeams side="left" />
          <path d="M0,260 L0,295 L430,880 L405,860 Z" fill={C.roofTile} opacity={0.9} />
          <path d="M0,285 L200,410 L175,395 L0,275 Z" fill={C.roofTileHi} opacity={0.35} />
        </g>

        <g clipPath="url(#clipRight)">
          <BuildingBeams side="right" />
          <path d="M1440,255 L1440,290 L1050,875 L1075,855 Z" fill={C.roofTile} opacity={0.9} />
        </g>

        {/* Protruding shop bays with color */}
        <ShopBay t={0.12} side="left" plaster />
        <ShopBay t={0.28} side="left" />
        <ShopBay t={0.48} side="left" plaster />
        <ShopBay t={0.68} side="left" />
        <ShopBay t={0.12} side="right" />
        <ShopBay t={0.28} side="right" plaster />
        <ShopBay t={0.48} side="right" />
        <ShopBay t={0.68} side="right" plaster />

        {/* Hanging lanterns down center */}
        {[0.2, 0.38, 0.55, 0.72].map((t) => (
          <g key={t}>
            <Lantern x={leftStreetEdge(t).x + 12} y={leftStreetEdge(t).y - 25} scale={0.35 + (1 - t) * 0.4} />
            <Lantern x={rightStreetEdge(t).x - 12} y={rightStreetEdge(t).y - 25} scale={0.35 + (1 - t) * 0.4} />
          </g>
        ))}

        {/* Potted plants & details near foreground */}
        <g transform="translate(350, 780)">
          <rect x={0} y={15} width={28} height={22} rx={3} fill={C.woodMid} />
          <circle cx={14} cy={8} r={14} fill={C.foliage} />
          <circle cx={8} cy={4} r={8} fill={C.sakuraPink} opacity={0.7} />
        </g>
        <g transform="translate(1050, 790)">
          <rect x={0} y={12} width={24} height={20} rx={3} fill={C.woodMid} />
          <ellipse cx={12} cy={5} rx={12} ry={10} fill={C.foliageDark} />
        </g>

        {/* Stone lantern (tōrō) */}
        <g transform={`translate(${rightStreetEdge(0.15).x - 30}, ${rightStreetEdge(0.15).y - 10})`} opacity={0.85}>
          <rect x={8} y={30} width={14} height={25} fill="#78909c" rx={2} />
          <path d="M0,30 L30,30 L25,20 L5,20 Z" fill="#90a4ae" />
          <rect x={5} y={10} width={20} height={12} fill="#b0bec5" rx={2} />
          <rect x={10} y={0} width={10} height={12} fill="#cfd8dc" rx={1} />
        </g>

        {/* Walkers */}
        <Walker x={690} y={570} scale={0.9} kimono={C.kimonoPink} obi="#fff" />
        <Walker x={728} y={565} scale={0.9} kimono={C.kimonoPurple} obi="#f8e8f0" />
        <Walker x={VP.x - 5} y={VP.y + 95} scale={0.38} kimono={C.kimonoBlue} />
      </svg>
    </div>
  );
}