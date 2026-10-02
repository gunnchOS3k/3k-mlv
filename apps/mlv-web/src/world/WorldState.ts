import type { ReturnContext, WorldId, WorldMode } from './types';

const KEY = 'mlv.v4_2.world_state';

export type WorldRuntimeState = {
  mode: WorldMode;
  world: WorldId;
  zone: string;
  avatarPosition: [number, number, number];
  avatarFacing: number;
  seated: boolean;
  screenPower: boolean;
  returnContext: ReturnContext | null;
  reducedMotion: boolean;
};

export const defaultWorldState = (world: WorldId = 'HOME'): WorldRuntimeState => ({
  mode: 'WORLD',
  world,
  zone: 'ENTRY',
  avatarPosition: [0, 0, 4],
  avatarFacing: Math.PI,
  seated: false,
  screenPower: false,
  returnContext: null,
  reducedMotion: false,
});

export function loadWorldState(): WorldRuntimeState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultWorldState();
    return { ...defaultWorldState(), ...JSON.parse(raw) };
  } catch {
    return defaultWorldState();
  }
}

export function saveWorldState(state: WorldRuntimeState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}
