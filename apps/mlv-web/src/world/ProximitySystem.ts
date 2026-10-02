import type { WorldInteractable } from './types';

export function nearestInteractable(
  pos: [number, number, number],
  items: WorldInteractable[],
  radius = 1.6,
): WorldInteractable | null {
  let best: WorldInteractable | null = null;
  let bestD = radius;
  for (const it of items) {
    const dx = it.position[0] - pos[0];
    const dy = it.position[1] - pos[1];
    const dz = it.position[2] - pos[2];
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (d <= bestD) {
      bestD = d;
      best = it;
    }
  }
  return best;
}
