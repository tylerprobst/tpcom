# Village Hero 3D (archived iteration)

Japanese village hero experiments archived from `feature/nextjs-village-hero`.

## What’s included

- **Three.js / R3F** — `VillageHero3D`, parallax texture planes, sakura particles, lantern lights
- **Image parallax** — `VillageHero`, illustrated layer stack
- **SVG street** — earlier 2D village components in `src/components/village/`
- **Assets** — `public/assets/village/` (hero-scene, layer images, reference)

## Dependencies (see `package.snapshot.json`)

```
three @react-three/fiber @react-three/drei @types/three
```

## To restore as the live homepage

1. Copy `src/` files back into project `src/`
2. Copy `public/assets/village/` back into `public/assets/`
3. `npm install three @react-three/fiber @react-three/drei`
4. `npm install -D @types/three`
5. Set `src/app/page.tsx` to import `VillageHero3D` (or `VillageHero` for image-only)
6. Merge `globals.css` animation styles if needed

Last archived from commit on branch `feature/nextjs-village-hero`.