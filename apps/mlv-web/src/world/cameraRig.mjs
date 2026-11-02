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
