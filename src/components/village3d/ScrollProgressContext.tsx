"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

type ScrollProgressContextValue = {
  progress: React.MutableRefObject<number>;
  sectionRef: React.RefObject<HTMLElement | null>;
};

const ScrollProgressContext = createContext<ScrollProgressContextValue | null>(
  null,
);

export function ScrollProgressProvider({
  children,
  sectionRef,
  progress,
}: {
  children: ReactNode;
  sectionRef: React.RefObject<HTMLElement | null>;
  progress: React.MutableRefObject<number>;
}) {
  useEffect(() => {
    const update = () => {
      const section = sectionRef.current;
      if (!section) return;

      const scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable <= 0) {
        progress.current = 0;
        return;
      }

      const scrolled = -section.getBoundingClientRect().top;
      progress.current = Math.min(1, Math.max(0, scrolled / scrollable));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sectionRef, progress]);

  return (
    <ScrollProgressContext.Provider value={{ progress, sectionRef }}>
      {children}
    </ScrollProgressContext.Provider>
  );
}

export function useScrollProgressRef() {
  const ctx = useContext(ScrollProgressContext);
  if (!ctx) {
    throw new Error("useScrollProgressRef must be used within ScrollProgressProvider");
  }
  return ctx.progress;
}