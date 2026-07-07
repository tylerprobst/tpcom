import {
  CURSOR_RADIUS,
  DAMPING,
  DUST_COUNT,
  PUSH_STRENGTH,
  SPRING_K,
  type SignalPointer,
} from "./signalConstants";
import type { GlyphPoint } from "./signalTypography";

export class SignalSim {
  readonly count: number;
  readonly home: Float32Array;
  readonly pos: Float32Array;
  readonly vel: Float32Array;
  readonly isGlyph: Uint8Array;
  readonly weight: Float32Array;
  readonly displace: Float32Array;

  constructor(glyphPoints: GlyphPoint[], dustCount = DUST_COUNT) {
    this.count = glyphPoints.length + dustCount;
    this.home = new Float32Array(this.count * 3);
    this.pos = new Float32Array(this.count * 3);
    this.vel = new Float32Array(this.count * 3);
    this.isGlyph = new Uint8Array(this.count);
    this.weight = new Float32Array(this.count);
    this.displace = new Float32Array(this.count);

    let i = 0;
    for (const p of glyphPoints) {
      const base = i * 3;
      this.home[base] = p.x;
      this.home[base + 1] = p.y;
      this.home[base + 2] = p.z;
      this.pos[base] = p.x;
      this.pos[base + 1] = p.y;
      this.pos[base + 2] = p.z;
      this.isGlyph[i] = 1;
      this.weight[i] = p.weight;
      i++;
    }

    for (let d = 0; d < dustCount; d++, i++) {
      const base = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.4 + Math.random() * 2.4;
      const x = Math.cos(angle) * radius * 1.35;
      const y = Math.sin(angle) * radius * 0.75 + 0.05;
      const z = (Math.random() - 0.5) * 0.6;

      this.home[base] = x;
      this.home[base + 1] = y;
      this.home[base + 2] = z;
      this.pos[base] = x;
      this.pos[base + 1] = y;
      this.pos[base + 2] = z;
      this.isGlyph[i] = 0;
      this.weight[i] = 0.25 + Math.random() * 0.35;
    }
  }

  step(
    dt: number,
    pointer: SignalPointer,
    time: number,
    reducedMotion: boolean,
  ): void {
    const cx = pointer.worldX;
    const cy = pointer.worldY;
    const pull = reducedMotion ? 0 : pointer.strength;
    const radiusSq = CURSOR_RADIUS * CURSOR_RADIUS;

    for (let i = 0; i < this.count; i++) {
      const base = i * 3;
      const px = this.pos[base];
      const py = this.pos[base + 1];
      const pz = this.pos[base + 2];

      const hx = this.home[base];
      const hy = this.home[base + 1];
      const hz = this.home[base + 2];

      const dx = px - hx;
      const dy = py - hy;
      const dz = pz - hz;

      let ax = 0;
      let ay = 0;
      let az = 0;

      if (this.isGlyph[i]) {
        ax -= SPRING_K * dx + DAMPING * this.vel[base];
        ay -= SPRING_K * dy + DAMPING * this.vel[base + 1];
        az -= SPRING_K * dz + DAMPING * this.vel[base + 2];

        const toX = px - cx;
        const toY = py - cy;
        const distSq = toX * toX + toY * toY;
        if (pull > 0.01 && distSq < radiusSq * 2.5) {
          const dist = Math.sqrt(distSq) + 1e-4;
          const falloff = Math.exp(-distSq / radiusSq);
          const push = PUSH_STRENGTH * pull * falloff;
          ax += (toX / dist) * push;
          ay += (toY / dist) * push;
        }

        const shimmer = reducedMotion ? 0.15 : 0.35;
        ax += Math.sin(time * 1.8 + hx * 9 + hy * 7) * shimmer;
        ay += Math.cos(time * 1.6 + hy * 8) * shimmer * 0.7;
      } else {
        ax +=
          Math.sin(time * 0.7 + hx * 3.2) * 0.45 -
          DAMPING * 0.35 * this.vel[base];
        ay +=
          Math.cos(time * 0.65 + hy * 2.8) * 0.35 -
          DAMPING * 0.35 * this.vel[base + 1];
        az -= DAMPING * 0.25 * this.vel[base + 2];

        if (pull > 0.01) {
          const toX = px - cx;
          const toY = py - cy;
          const distSq = toX * toX + toY * toY;
          if (distSq > 1e-4) {
            const dist = Math.sqrt(distSq);
            const swirl = pull * 2.2 * Math.exp(-distSq / (radiusSq * 3));
            ax += (-toY / dist) * swirl;
            ay += (toX / dist) * swirl;
          }
        }
      }

      this.vel[base] += ax * dt;
      this.vel[base + 1] += ay * dt;
      this.vel[base + 2] += az * dt;

      this.pos[base] += this.vel[base] * dt;
      this.pos[base + 1] += this.vel[base + 1] * dt;
      this.pos[base + 2] += this.vel[base + 2] * dt;

      this.displace[i] = Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
  }
}