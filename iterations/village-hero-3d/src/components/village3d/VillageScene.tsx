"use client";

import { Suspense } from "react";
import { CameraRig } from "./CameraRig";
import { LanternLights } from "./LanternLights";
import { ParallaxLayer } from "./ParallaxLayer";
import { SakuraParticles } from "./SakuraParticles";
import { SCENE_LAYERS } from "./sceneConfig";

function SceneContent() {
  return (
    <>
      <CameraRig />
      <ambientLight intensity={0.55} color="#fff5eb" />
      <directionalLight
        position={[2, 4, 5]}
        intensity={0.35}
        color="#ffe8c8"
      />
      <LanternLights />

      {SCENE_LAYERS.map((layer) => (
        <ParallaxLayer key={layer.texture} layer={layer} />
      ))}

      <SakuraParticles />
    </>
  );
}

export function VillageScene() {
  return (
    <Suspense fallback={null}>
      <fog attach="fog" args={["#c8dff0", 6, 16]} />
      <SceneContent />
    </Suspense>
  );
}