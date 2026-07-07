export type Vec3 = { x: number; y: number; z: number };

export type TensionEdge = {
  a: number;
  b: number;
  restLength: number;
};

const PHI = Math.PI * (3 - Math.sqrt(5));

export function fibonacciSphere(count: number, radius: number): Vec3[] {
  const points: Vec3[] = [];
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = PHI * i;
    points.push({
      x: Math.cos(theta) * r * radius,
      y: y * radius,
      z: Math.sin(theta) * r * radius,
    });
  }
  return points;
}

function dist2(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

export function buildTensionGraph(
  nodeCount: number,
  radius: number,
  neighbors = 4,
): { rests: Vec3[]; edges: TensionEdge[] } {
  const rests = fibonacciSphere(nodeCount, radius);
  const edges: TensionEdge[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < nodeCount; i++) {
    const nearby = rests
      .map((p, j) => ({ j, d: dist2(rests[i], p) }))
      .filter((n) => n.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, neighbors);

    for (const { j } of nearby) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const a = rests[i];
      const b = rests[j];
      const restLength = Math.sqrt(dist2(a, b));
      edges.push({ a: i, b: j, restLength });
    }
  }

  return { rests, edges };
}