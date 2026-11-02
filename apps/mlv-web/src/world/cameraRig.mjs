/**
 * Chase-camera and locomotion math shared by the runtime and the Node suite.
 *
 * Heading convention: yaw is the avatar's facing; walking forward moves along
 * (sin yaw, cos yaw) in XZ. The camera trails behind that heading so the scene
 * the avatar walks toward is in view, and strafe/turn follow screen direction.
 */

export const CAMERA_EYE_HEIGHT = 1.6;
export const CAMERA_LOOK_HEIGHT = 1.2;

export function forwardVector(yaw) {
  return [Math.sin(yaw), Math.cos(yaw)];
}

/**
 * @param {[number, number, number]} target
 * @param {number} yaw
 * @returns {[number, number, number]}
 */
export function chaseCameraPosition(target, yaw, pitch = 0.35, distance = 5.2) {
  const [fx, fz] = forwardVector(yaw);
  return [
    target[0] - fx * distance,
    target[1] + CAMERA_EYE_HEIGHT + Math.sin(pitch) * 1.2,
    target[2] - fz * distance,
  ];
}

/**
 * @param {[number, number, number]} target
 * @returns {[number, number, number]}
 */
export function cameraLookAt(target) {
  return [target[0], target[1] + CAMERA_LOOK_HEIGHT, target[2]];
}

/** Entry fraction in [0, 1] of segment a→b into box, or null when it misses or starts inside. */
function segmentEntry(a, b, box) {
  let tMin = 0;
  let tMax = 1;
  for (let axis = 0; axis < 3; axis += 1) {
    const d = b[axis] - a[axis];
    if (Math.abs(d) < 1e-9) {
      if (a[axis] < box.min[axis] || a[axis] > box.max[axis]) return null;
      continue;
    }
    let t1 = (box.min[axis] - a[axis]) / d;
    let t2 = (box.max[axis] - a[axis]) / d;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return null;
  }
  return tMin > 0 ? tMin : null;
}

/**
 * Chase camera pulled in along the boom so authored collisions (walls,
 * fixtures) never sit between the look pivot and the lens.
 * @param {[number, number, number]} target
 * @param {number} yaw
 * @param {{ min: number[], max: number[] }[]} collisions
 * @returns {[number, number, number]}
 */
export function resolveChaseCamera(target, yaw, pitch = 0.35, distance = 5.2, collisions = [], margin = 0.3) {
  const desired = chaseCameraPosition(target, yaw, pitch, distance);
  if (!collisions.length) return desired;
  const pivot = cameraLookAt(target);
  const boom = [desired[0] - pivot[0], desired[1] - pivot[1], desired[2] - pivot[2]];
  const length = Math.hypot(boom[0], boom[1], boom[2]);
  let t = 1;
  for (const box of collisions) {
    const hit = segmentEntry(pivot, desired, box);
    if (hit !== null && hit < t) t = hit;
  }
  if (t === 1) return desired;
  const scale = Math.max(t - margin / length, t * 0.5);
  return [pivot[0] + boom[0] * scale, pivot[1] + boom[1] * scale, pivot[2] + boom[2] * scale];
}

/** forward > 0 walks toward the view; strafe > 0 moves toward screen-right. */
/** @returns {[number, number]} */
export function locomotionDelta(yaw, forward, strafe, step) {
  const [fx, fz] = forwardVector(yaw);
  return [(fx * forward - fz * strafe) * step, (fz * forward + fx * strafe) * step];
}

/** lookX > 0 (stick/drag right) turns the view to the right. */
export function turnYaw(yaw, lookX, dt, rate = 1.8) {
  return yaw - lookX * dt * rate;
}
