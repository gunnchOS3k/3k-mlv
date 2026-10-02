export type AABB = { min: [number, number, number]; max: [number, number, number]; id: string };

export function pointInAabb(p: [number, number, number], box: AABB): boolean {
  return (
    p[0] >= box.min[0] && p[0] <= box.max[0] &&
    p[1] >= box.min[1] && p[1] <= box.max[1] &&
    p[2] >= box.min[2] && p[2] <= box.max[2]
  );
}

export function resolveXZ(pos: [number, number, number], boxes: AABB[]): [number, number, number] {
  let [x, y, z] = pos;
  for (const b of boxes) {
    if (x >= b.min[0] && x <= b.max[0] && z >= b.min[2] && z <= b.max[2] && y < b.max[1]) {
      // push out to nearest edge
      const dl = Math.abs(x - b.min[0]);
      const dr = Math.abs(b.max[0] - x);
      const db = Math.abs(z - b.min[2]);
      const df = Math.abs(b.max[2] - z);
      const m = Math.min(dl, dr, db, df);
      if (m === dl) x = b.min[0] - 0.05;
      else if (m === dr) x = b.max[0] + 0.05;
      else if (m === db) z = b.min[2] - 0.05;
      else z = b.max[2] + 0.05;
    }
  }
  return [x, y, z];
}
