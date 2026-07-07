import { GLYPH_TARGET } from "./signalConstants";

export type GlyphPoint = {
  x: number;
  y: number;
  z: number;
  weight: number;
};

const FALLBACK: GlyphPoint[] = [
  { x: -0.8, y: 0.1, z: 0, weight: 1 },
  { x: 0, y: 0.1, z: 0, weight: 1 },
  { x: 0.8, y: 0.1, z: 0, weight: 1 },
];

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sampleGlyphPoints(
  targetCount = GLYPH_TARGET,
  isMobile = false,
): GlyphPoint[] {
  if (typeof document === "undefined") return FALLBACK;

  const width = isMobile ? 900 : 1400;
  const height = isMobile ? 320 : 420;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return FALLBACK;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const titleSize = isMobile ? 118 : 168;
  const subSize = isMobile ? 52 : 72;

  ctx.font = `700 ${titleSize}px Inter, system-ui, sans-serif`;
  ctx.fillText("TYLER", width * 0.5, height * 0.46);

  ctx.font = `600 ${subSize}px Inter, system-ui, sans-serif`;
  ctx.fillText("PROBST", width * 0.5, height * 0.68);

  const image = ctx.getImageData(0, 0, width, height);
  const candidates: GlyphPoint[] = [];
  const stride = isMobile ? 2 : 1;

  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      const alpha = image.data[(y * width + x) * 4 + 3];
      if (alpha > 140) {
        const nx = (x / width - 0.5) * (isMobile ? 3.6 : 4.8);
        const ny = (0.5 - y / height) * (isMobile ? 1.35 : 1.65);
        candidates.push({
          x: nx,
          y: ny,
          z: 0,
          weight: alpha / 255,
        });
      }
    }
  }

  if (candidates.length === 0) return FALLBACK;

  const rand = mulberry32(90210);
  const points: GlyphPoint[] = [];

  if (candidates.length <= targetCount) {
    for (const p of candidates) {
      points.push({
        x: p.x + (rand() - 0.5) * 0.004,
        y: p.y + (rand() - 0.5) * 0.004,
        z: (rand() - 0.5) * 0.22,
        weight: p.weight,
      });
    }
    while (points.length < targetCount) {
      const p = candidates[(rand() * candidates.length) | 0];
      points.push({
        x: p.x + (rand() - 0.5) * 0.012,
        y: p.y + (rand() - 0.5) * 0.012,
        z: (rand() - 0.5) * 0.22,
        weight: p.weight * (0.7 + rand() * 0.3),
      });
    }
  } else {
    const used = new Set<number>();
    while (points.length < targetCount) {
      const idx = (rand() * candidates.length) | 0;
      if (used.has(idx)) continue;
      used.add(idx);
      const p = candidates[idx];
      points.push({
        x: p.x + (rand() - 0.5) * 0.006,
        y: p.y + (rand() - 0.5) * 0.006,
        z: (rand() - 0.5) * 0.22,
        weight: p.weight,
      });
    }
  }

  return points;
}