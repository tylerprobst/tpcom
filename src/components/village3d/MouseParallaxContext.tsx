"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

type MouseState = { x: number; y: number };

const MouseParallaxContext = createContext<React.MutableRefObject<MouseState>>({
  current: { x: 0, y: 0 },
});

export function MouseParallaxProvider({ children }: { children: ReactNode }) {
  const mouse = useRef<MouseState>({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(event.clientY / window.innerHeight - 0.5) * 2;
    };

    const media = window.matchMedia("(max-width: 768px)");
    if (!media.matches) {
      window.addEventListener("mousemove", onMove);
    }

    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <MouseParallaxContext.Provider value={mouse}>
      {children}
    </MouseParallaxContext.Provider>
  );
}

export function useMouseParallaxRef() {
  return useContext(MouseParallaxContext);
}