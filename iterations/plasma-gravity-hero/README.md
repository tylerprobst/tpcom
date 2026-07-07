# Plasma Gravity Hero (archived iteration)

Interactive plasma orb with gravitational pull, multi-anchor drips, and string/peel disconnect — archived from `feature/nextjs-village-hero`.

## What's included

- **Plasma orb** — icosahedron + custom GLSL displacement shader
- **Gravity pointer** — misalignment-driven pull toward cursor
- **Orb drips** — 16 surface anchors, swell → peel → snap → detach lifecycle
- **Strand shader** — tapered viscous connection before disconnect
- **PlasmaAssembly** — shared transform for orb + drip meshes

## Key files

```
src/components/PlasmaHero.tsx
src/components/plasma/
  PlasmaScene.tsx, PlasmaAssembly.tsx, PlasmaOrb.tsx
  OrbDrips.tsx, plasmaShader.ts, strandShader.ts
  gravityState.ts, orbAnchors.ts, plasmaConstants.ts
```

## Dependencies (see `package.snapshot.json`)

```
three @react-three/fiber @react-three/drei @types/three
```

## To restore as the live homepage

1. Copy `src/components/plasma/` and `PlasmaHero.tsx` into project `src/components/`
2. Set `src/app/page.tsx` to `import PlasmaHero from "@/components/PlasmaHero"`
3. Ensure three.js deps are installed (already in main `package.json`)
4. Background color `#0e1116` in `globals.css` matches this iteration

Last archived July 2026 from branch `feature/nextjs-village-hero`.