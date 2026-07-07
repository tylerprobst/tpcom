import type { TensionEdge } from "./tensionGraph";

export type PeelSlot = {
  active: boolean;
  nodeIndex: number;
  peel: number;
  snapT: number;
  detached: boolean;
  headX: number;
  headY: number;
  headZ: number;
  restX: number;
  restY: number;
  restZ: number;
  farX: number;
  farY: number;
  farZ: number;
  vx: number;
  vy: number;
  vz: number;
  scale: number;
  sustain: number;
};

export const MAX_PEELS = 14;

export function createPeelPool(): PeelSlot[] {
  return Array.from({ length: MAX_PEELS }, () => ({
    active: false,
    nodeIndex: -1,
    peel: 0,
    snapT: 0,
    detached: false,
    headX: 0,
    headY: 0,
    headZ: 0,
    restX: 0,
    restY: 0,
    restZ: 0,
    farX: 0,
    farY: 0,
    farZ: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    scale: 0.055,
    sustain: 0,
  }));
}

export class TensionSim {
  readonly count: number;
  readonly positions: Float32Array;
  readonly velocities: Float32Array;
  readonly rests: Float32Array;
  readonly strain: Float32Array;
  readonly nodeStrain: Float32Array;
  readonly hidden: Uint8Array;
  readonly edges: TensionEdge[];

  constructor(
    count: number,
    rests: { x: number; y: number; z: number }[],
    edges: TensionEdge[],
  ) {
    this.count = count;
    this.edges = edges;
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.rests = new Float32Array(count * 3);
    this.strain = new Float32Array(edges.length);
    this.nodeStrain = new Float32Array(count);
    this.hidden = new Uint8Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      this.rests[i3] = rests[i].x;
      this.rests[i3 + 1] = rests[i].y;
      this.rests[i3 + 2] = rests[i].z;
      this.positions[i3] = rests[i].x;
      this.positions[i3 + 1] = rests[i].y;
      this.positions[i3 + 2] = rests[i].z;
    }
  }

  step(
    dt: number,
    pull: number,
    gravity: { x: number; y: number; z: number },
    peels: PeelSlot[],
  ): void {
    const pos = this.positions;
    const vel = this.velocities;
    const rest = this.rests;
    const n = this.count;

    for (let i = 0; i < n; i++) this.nodeStrain[i] = 0;

    for (let e = 0; e < this.edges.length; e++) {
      const { a, b, restLength } = this.edges[e];
      const a3 = a * 3;
      const b3 = b * 3;
      const dx = pos[b3] - pos[a3];
      const dy = pos[b3 + 1] - pos[a3 + 1];
      const dz = pos[b3 + 2] - pos[a3 + 2];
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.0001;
      const strain = len / restLength;
      this.strain[e] = strain;

      const tension = (len - restLength) * 5.2;
      const nx = dx / len;
      const ny = dy / len;
      const nz = dz / len;

      if (!this.hidden[a]) {
        vel[a3] += nx * tension * dt;
        vel[a3 + 1] += ny * tension * dt;
        vel[a3 + 2] += nz * tension * dt;
      }
      if (!this.hidden[b]) {
        vel[b3] -= nx * tension * dt;
        vel[b3 + 1] -= ny * tension * dt;
        vel[b3 + 2] -= nz * tension * dt;
      }

      const edgeStress = Math.max(0, strain - 1);
      this.nodeStrain[a] = Math.max(this.nodeStrain[a], edgeStress);
      this.nodeStrain[b] = Math.max(this.nodeStrain[b], edgeStress);
    }

    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      if (this.hidden[i]) {
        pos[i3] = rest[i3];
        pos[i3 + 1] = rest[i3 + 1];
        pos[i3 + 2] = rest[i3 + 2];
        vel[i3] = 0;
        vel[i3 + 1] = 0;
        vel[i3 + 2] = 0;
        continue;
      }

      const toRestX = rest[i3] - pos[i3];
      const toRestY = rest[i3 + 1] - pos[i3 + 1];
      const toRestZ = rest[i3 + 2] - pos[i3 + 2];
      vel[i3] += toRestX * 0.9 * dt;
      vel[i3 + 1] += toRestY * 0.9 * dt;
      vel[i3 + 2] += toRestZ * 0.9 * dt;

      if (pull > 0.05) {
        const gx = gravity.x - pos[i3];
        const gy = gravity.y - pos[i3 + 1];
        const gz = gravity.z - pos[i3 + 2];
        const gLen = Math.sqrt(gx * gx + gy * gy + gz * gz) + 0.001;
        const gForce = pull * 2.85;
        vel[i3] += (gx / gLen) * gForce * dt;
        vel[i3 + 1] += (gy / gLen) * gForce * dt;
        vel[i3 + 2] += (gz / gLen) * gForce * dt;
      }

      vel[i3] *= 0.86;
      vel[i3 + 1] *= 0.86;
      vel[i3 + 2] *= 0.86;

      pos[i3] += vel[i3] * dt;
      pos[i3 + 1] += vel[i3 + 1] * dt;
      pos[i3 + 2] += vel[i3 + 2] * dt;
    }

    this.tryPeels(dt, pull, gravity, peels);
    this.stepPeels(dt, pull, gravity, peels);
  }

  private tryPeels(
    dt: number,
    pull: number,
    gravity: { x: number; y: number; z: number },
    peels: PeelSlot[],
  ) {
    if (pull < 0.1) return;

    for (let i = 0; i < this.count; i++) {
      if (this.hidden[i]) continue;
      if (this.nodeStrain[i] < 0.14) continue;

      const i3 = i * 3;
      const dx = this.positions[i3] - this.rests[i3];
      const dy = this.positions[i3 + 1] - this.rests[i3 + 1];
      const dz = this.positions[i3 + 2] - this.rests[i3 + 2];
      const displacement = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (displacement < 0.07) continue;

      const existing = peels.find((p) => p.active && p.nodeIndex === i);
      if (existing) {
        existing.sustain += dt;
        continue;
      }

      const slot = peels.find((p) => !p.active);
      if (!slot) continue;

      slot.active = true;
      slot.nodeIndex = i;
      slot.peel = 0;
      slot.snapT = 0;
      slot.detached = false;
      slot.sustain = 0;
      slot.restX = this.rests[i3];
      slot.restY = this.rests[i3 + 1];
      slot.restZ = this.rests[i3 + 2];
      const towardGx = gravity.x - this.positions[i3];
      const towardGy = gravity.y - this.positions[i3 + 1];
      const towardGz = gravity.z - this.positions[i3 + 2];
      const boost = 0.22 + pull * 0.35;
      slot.farX = this.positions[i3] + towardGx * boost;
      slot.farY = this.positions[i3 + 1] + towardGy * boost;
      slot.farZ = this.positions[i3 + 2] + towardGz * boost;
      slot.headX = this.rests[i3];
      slot.headY = this.rests[i3 + 1];
      slot.headZ = this.rests[i3 + 2];
      slot.vx = 0;
      slot.vy = 0;
      slot.vz = 0;
      slot.scale = 0.055 + (i % 4) * 0.014;
      this.hidden[i] = 1;
    }
  }

  private stepPeels(
    dt: number,
    pull: number,
    gravity: { x: number; y: number; z: number },
    peels: PeelSlot[],
  ) {
    for (const p of peels) {
      if (!p.active) continue;

      if (!p.detached) {
        if (p.peel < 1) {
          p.peel = Math.min(1, p.peel + dt / 0.65);
          const t = p.peel * p.peel * (3 - 2 * p.peel);
          p.headX = p.restX + (p.farX - p.restX) * (0.08 + t * 1.25);
          p.headY = p.restY + (p.farY - p.restY) * (0.08 + t * 1.25);
          p.headZ = p.restZ + (p.farZ - p.restZ) * (0.08 + t * 1.25);
          if (p.peel >= 1) p.snapT = 0;
          continue;
        }

        if (p.snapT < 1) {
          p.snapT = Math.min(1, p.snapT + dt / 0.12);
          if (p.snapT >= 1) {
            p.detached = true;
            const dx = gravity.x - p.headX;
            const dy = gravity.y - p.headY;
            const dz = gravity.z - p.headZ;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.001;
            p.vx = (dx / dist) * 0.65;
            p.vy = (dy / dist) * 0.65;
            p.vz = (dz / dist) * 0.65;
          }
          continue;
        }
      }

      const dx = gravity.x - p.headX;
      const dy = gravity.y - p.headY;
      const dz = gravity.z - p.headZ;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.001;
      const force = pull * (3.8 + 1.4 / dist);
      p.vx += (dx / dist) * force * dt;
      p.vy += (dy / dist) * force * dt;
      p.vz += (dz / dist) * force * dt;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.vz *= 0.96;
      p.headX += p.vx * dt;
      p.headY += p.vy * dt;
      p.headZ += p.vz * dt;

      if (dist < 0.12 || pull < 0.04) {
        p.active = false;
        if (p.nodeIndex >= 0) {
          const i3 = p.nodeIndex * 3;
          this.positions[i3] = this.rests[i3];
          this.positions[i3 + 1] = this.rests[i3 + 1];
          this.positions[i3 + 2] = this.rests[i3 + 2];
          this.velocities[i3] = 0;
          this.velocities[i3 + 1] = 0;
          this.velocities[i3 + 2] = 0;
          this.hidden[p.nodeIndex] = 0;
        }
        p.nodeIndex = -1;
      }
    }
  }
}