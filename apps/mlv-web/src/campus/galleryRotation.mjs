/**
 * Pure rotation helpers shared by the Gallery UI and Node behavioral tests.
 * Rotation is deterministic: the first source is always the initial exhibit.
 */

/**
 * @param {number} length
 * @param {number} current
 * @param {number} delta
 */
export function advanceRotationIndex(length, current, delta = 1) {
  if (!Number.isInteger(length) || length <= 0) return 0;
  const normalized = Number.isFinite(current) ? Math.trunc(current) : 0;
  return ((normalized + delta) % length + length) % length;
}

/**
 * @template T
 * @param {T[]} exhibits
 * @param {number} index
 * @returns {T | null}
 */
export function rotationAt(exhibits, index) {
  if (!Array.isArray(exhibits) || exhibits.length === 0) return null;
  return exhibits[advanceRotationIndex(exhibits.length, index, 0)] ?? null;
}

