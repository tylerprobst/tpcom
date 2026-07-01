import type { CSSProperties } from "react";

type DistantMountainsProps = {
  style?: CSSProperties;
};

export function DistantMountains({ style }: DistantMountainsProps) {
  return (
    <div className="village-layer" style={style}>
      <svg
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        className="absolute bottom-[28%] h-[45%] w-full"
        aria-hidden
      >
        <path
          d="M0,320 C200,200 350,280 500,180 C650,80 800,200 950,140 C1100,80 1250,220 1440,160 L1440,400 L0,400 Z"
          fill="var(--mountain-far)"
          opacity="0.55"
        />
        <path
          d="M0,360 C180,260 320,340 480,240 C640,140 820,300 1000,220 C1180,140 1320,280 1440,240 L1440,400 L0,400 Z"
          fill="var(--mountain-near)"
          opacity="0.7"
        />
      </svg>
    </div>
  );
}