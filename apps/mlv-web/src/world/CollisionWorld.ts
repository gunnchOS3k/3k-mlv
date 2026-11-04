export type AABB = { min: [number, number, number]; max: [number, number, number]; id: string };

/** Horizontal clearance for avatar vs authored fixture and wall boxes. */
export const AVATAR_COLLISION_RADIUS = 0.35;

export function pointInAabb(p: [number, number, number], box: AABB): boolean {
  return (
    p[0] >= box.min[0] && p[0] <= box.max[0] &&
    p[1] >= box.min[1] && p[1] <= box.max[1] &&
    p[2] >= box.min[2] && p[2] <= box.max[2]
  );
}

function blocksAvatarAt(pos: [number, number, number], box: AABB): boolean {
  return (
    pos[0] >= box.min[0] && pos[0] <= box.max[0] &&
    pos[2] >= box.min[2] && pos[2] <= box.max[2] &&
    pos[1] < box.max[1]
  );
}

/** Entry fraction in (0, 1] for segment a→b into an XZ rectangle expanded by radius, or null. */
function segmentEntryXZ(
  a: [number, number],
  b: [number, number],
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number,
): number | null {
  let tMin = 0;
  let tMax = 1;
  for (let axis = 0; axis < 2; axis += 1) {
    const av = a[axis];
    const bv = b[axis];
    const lo = axis === 0 ? minX : minZ;
    const hi = axis === 0 ? maxX : maxZ;
    const d = bv - av;
    if (Math.abs(d) < 1e-9) {
      if (av < lo || av > hi) return null;
      continue;
    }
    let t1 = (lo - av) / d;
    let t2 = (hi - av) / d;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return null;
  }
  return tMin > 0 ? tMin : null;
}

function sweepFractionXZ(
  pos: [number, number, number],
  dx: number,
  dz: number,
  boxes: AABB[],
  radius: number,
): number {
  if (dx === 0 && dz === 0) return 1;
  let tLimit = 1;
  const a: [number, number] = [pos[0], pos[2]];
  const b: [number, number] = [pos[0] + dx, pos[2] + dz];
  for (const box of boxes) {
    if (!blocksAvatarAt(pos, box) && !blocksAvatarAt([b[0], pos[1], b[1]], box)) {
      // Still sweep when crossing through a column the endpoints miss in XZ but the segment crosses.
    }
    if (pos[1] >= box.max[1]) continue;
    const hit = segmentEntryXZ(
      a,
      b,
      box.min[0] - radius,
      box.max[0] + radius,
      box.min[2] - radius,
      box.max[2] + radius,
    );
    if (hit !== null && hit < tLimit) tLimit = hit;
  }
  const len = Math.hypot(dx, dz);
  const backoff = len > 1e-9 ? Math.min(0.08, (radius * 0.15) / len) : 0;
  return Math.max(0, tLimit - backoff);
}

function applySweep(
  pos: [number, number, number],
  dx: number,
  dz: number,
  boxes: AABB[],
  radius: number,
): [number, number, number] {
  const t = sweepFractionXZ(pos, dx, dz, boxes, radius);
  return [pos[0] + dx * t, pos[1], pos[2] + dz * t];
}

/**
 * Swept XZ movement with axis slide so a single frame cannot tunnel through thin fixtures.
 */
export function resolveMovementXZ(
  pos: [number, number, number],
  dx: number,
  dz: number,
  boxes: AABB[],
  radius = AVATAR_COLLISION_RADIUS,
): [number, number, number] {
  const targetX = pos[0] + dx;
  const targetZ = pos[2] + dz;
  let next = applySweep(pos, dx, dz, boxes, radius);
  const remainX = targetX - next[0];
  const remainZ = targetZ - next[2];
  if (Math.abs(remainX) > 1e-5 || Math.abs(remainZ) > 1e-5) {
    const slideX = applySweep(next, remainX, 0, boxes, radius);
    const slideZ = applySweep(next, 0, remainZ, boxes, radius);
    const slideXZ = applySweep(slideX, 0, remainZ - (slideX[2] - next[2]), boxes, radius);
    const dist = (p: [number, number, number]) => (p[0] - targetX) ** 2 + (p[2] - targetZ) ** 2;
    next = [slideX, slideZ, slideXZ].reduce((best, cand) => (dist(cand) < dist(best) ? cand : best), next);
  }
  return resolveXZ(next, boxes);
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
