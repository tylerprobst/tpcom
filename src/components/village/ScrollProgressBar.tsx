"use client";

type ScrollProgressBarProps = {
  progress: number;
};

export function ScrollProgressBar({ progress }: ScrollProgressBarProps) {
  return (
    <div
      className="pointer-events-none absolute right-4 top-1/2 z-10 h-32 w-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/15"
      aria-hidden
    >
      <div
        className="w-full rounded-full bg-[#ffc8d8] transition-[height] duration-150"
        style={{ height: `${progress * 100}%` }}
      />
    </div>
  );
}