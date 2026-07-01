import type { CSSProperties } from "react";

type VillageMidgroundProps = {
  style?: CSSProperties;
};

function House({
  x,
  width,
  roofColor = "var(--roof-teal)",
}: {
  x: number;
  width: number;
  roofColor?: string;
}) {
  const height = width * 0.85;
  return (
    <g transform={`translate(${x}, ${320 - height})`}>
      <rect
        x={width * 0.1}
        y={height * 0.35}
        width={width * 0.8}
        height={height * 0.65}
        rx={8}
        fill="var(--wood-warm)"
      />
      <path
        d={`M0,${height * 0.4} Q${width / 2},${height * 0.05} ${width},${height * 0.4} Z`}
        fill={roofColor}
      />
      <path
        d={`M${width * 0.08},${height * 0.38} Q${width / 2},${height * 0.12} ${width * 0.92},${height * 0.38}`}
        fill="none"
        stroke="var(--roof-dark)"
        strokeWidth={3}
        opacity={0.4}
      />
      <rect
        x={width * 0.35}
        y={height * 0.55}
        width={width * 0.3}
        height={height * 0.25}
        rx={4}
        fill="#4a3728"
        opacity={0.6}
      />
      <rect
        x={width * 0.15}
        y={height * 0.5}
        width={width * 0.18}
        height={width * 0.18}
        rx={3}
        fill="#ffe8b8"
        opacity={0.8}
      />
      <rect
        x={width * 0.67}
        y={height * 0.5}
        width={width * 0.18}
        height={width * 0.18}
        rx={3}
        fill="#ffe8b8"
        opacity={0.8}
      />
    </g>
  );
}

function CherryTree({ x }: { x: number }) {
  return (
    <g transform={`translate(${x}, 200)`}>
      <rect x={42} y={80} width={16} height={70} rx={4} fill="#8B5E3C" />
      <circle cx={50} cy={55} r={45} fill="#f9a8c4" opacity={0.9} />
      <circle cx={30} cy={70} r={30} fill="#fda4b8" opacity={0.85} />
      <circle cx={72} cy={68} r={32} fill="#fb7185" opacity={0.8} />
      <circle cx={50} cy={40} r={25} fill="#fecdd3" opacity={0.9} />
    </g>
  );
}

function ToriiGate() {
  return (
    <g transform="translate(620, 180)">
      <rect x={-8} y={0} width={16} height={140} rx={4} fill="var(--accent-red)" />
      <rect x={132} y={0} width={16} height={140} rx={4} fill="var(--accent-red)" />
      <rect x={-20} y={0} width={176} height={14} rx={4} fill="var(--accent-red)" />
      <rect x={-12} y={28} width={160} height={10} rx={3} fill="var(--accent-red)" opacity={0.9} />
      <rect x={60} y={14} width={20} height={8} rx={2} fill="#b91c1c" />
    </g>
  );
}

function Lantern({ x, y }: { x: number; y: number }) {
  return (
    <g className="lantern-pulse" transform={`translate(${x}, ${y})`}>
      <line x1={0} y1={0} x2={0} y2={20} stroke="#8B5E3C" strokeWidth={2} />
      <rect x={-10} y={18} width={20} height={24} rx={6} fill="var(--lantern-glow)" />
      <rect x={-6} y={22} width={12} height={14} rx={3} fill="#fff5d6" opacity={0.6} />
    </g>
  );
}

export function VillageMidground({ style }: VillageMidgroundProps) {
  return (
    <div className="village-layer" style={style}>
      <svg
        viewBox="0 0 1440 400"
        preserveAspectRatio="xMidYMax meet"
        className="absolute bottom-[18%] left-1/2 h-[55%] w-[min(100%,1200px)] -translate-x-1/2"
        aria-hidden
      >
        <ellipse cx={720} cy={380} rx={520} ry={40} fill="#3d6b4f" opacity={0.3} />

        <House x={180} width={120} roofColor="#4a9e8f" />
        <House x={340} width={100} />
        <House x={980} width={110} roofColor="#5ba394" />
        <House x={1120} width={95} />

        <CherryTree x={80} />
        <CherryTree x={1240} />

        <ToriiGate />

        <Lantern x={280} y={260} />
        <Lantern x={520} y={270} />
        <Lantern x={900} y={265} />
        <Lantern x={1100} y={268} />

        <rect x={600} y={310} width={240} height={8} rx={4} fill="var(--path-sand)" opacity={0.5} />
      </svg>
    </div>
  );
}