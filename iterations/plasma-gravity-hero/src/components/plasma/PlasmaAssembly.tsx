"use client";

import { useRef } from "react";
import type { Group } from "three";
import { OrbDrips } from "./OrbDrips";
import { PlasmaOrb } from "./PlasmaOrb";
import type { GravityPointer } from "./plasmaConstants";

type PlasmaAssemblyProps = {
  pointer: React.MutableRefObject<GravityPointer>;
  reducedMotion: boolean;
  isMobile: boolean;
};

export function PlasmaAssembly({
  pointer,
  reducedMotion,
  isMobile,
}: PlasmaAssemblyProps) {
  const assemblyRef = useRef<Group>(null);

  return (
    <group ref={assemblyRef}>
      <PlasmaOrb
        pointer={pointer}
        assemblyRef={assemblyRef}
        reducedMotion={reducedMotion}
        isMobile={isMobile}
      />
      <OrbDrips
        pointer={pointer}
        assemblyRef={assemblyRef}
        reducedMotion={reducedMotion}
        isMobile={isMobile}
      />
    </group>
  );
}