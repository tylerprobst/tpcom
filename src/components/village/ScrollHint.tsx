"use client";

import { useEffect, useState } from "react";

type ScrollHintProps = {
  progress: number;
};

export function ScrollHint({ progress }: ScrollHintProps) {
  const [visible, setVisible] = useState(true);
  const opacity = Math.max(0, 1 - progress * 3);

  useEffect(() => {
    if (progress > 0.08) setVisible(false);
  }, [progress]);

  if (!visible && opacity <= 0) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-2 transition-opacity duration-500"
      style={{ opacity }}
    >
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/80">
        Scroll to walk the street
      </p>
      <div
        className="h-8 w-5 rounded-full border-2 border-white/50 p-1"
        aria-hidden
      >
        <div className="mx-auto h-1.5 w-1 animate-bounce rounded-full bg-white/70" />
      </div>
    </div>
  );
}