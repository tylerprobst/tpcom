# Tension Field Hero (archived iteration)

Interactive geodesic lattice with spring physics, elastic edges, cursor gravity, and peel-on-strand disconnect — archived from `feature/nextjs-village-hero`.

## What's included

- **42-node lattice** — icosahedron-derived graph with instanced bead rendering
- **Spring simulation** — force-directed layout with stress-driven edge visuals
- **Gravity pointer** — misalignment-driven pull toward cursor
- **Peel physics** — nodes detach on overstressed strands with tapered strand shader

## Key files

```
src/components/TensionHero.tsx
src/components/tension/
  TensionScene.tsx, tensionPhysics.ts, tensionGraph.ts
  nodeShader.ts, beadShader.ts, strandShader.ts
  gravityState.ts, tensionConstants.ts
```

## Dependencies (see `package.snapshot.json`)

```
three @react-three/fiber @react-three/drei @types/three
```

## To restore as the live homepage

1. Copy `src/components/tension/` and `TensionHero.tsx` into project `src/components/`
2. Set `src/app/page.tsx` to `import TensionHero from "@/components/TensionHero"`
3. Ensure three.js deps are installed (already in main `package.json`)
4. Background color `#06080c` in `globals.css` matches this iteration

Last archived July 2026 from branch `feature/nextjs-village-hero`.