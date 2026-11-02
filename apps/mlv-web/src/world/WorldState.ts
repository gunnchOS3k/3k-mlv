import { isReturnContext } from './ReturnContext.ts';
import type { StorageLike } from './ReturnContext.ts';
import type { ReturnContext, WorldId, WorldMode } from './types';

export const WORLD_STATE_KEY = 'mlv.v4_2.world_state';

const WORLD_IDS = new Set<WorldId>([
  'COMMONS',
  'HOME',
  'TRANSIT',
  'GARY',
  'GHANA',
  'GUYANA',
  'GEELONG',
  'GERMANY',
  'GAZA',
  'GRAHAM_LAND',
  'GALLERY',
]);
const WORLD_MODES = new Set<WorldMode>(['WORLD', 'MAP', 'LIST']);
const MAX_COORDINATE = 1_000_000;
const MAX_ZONE_LENGTH = 160;

const ENTRY_ZONE: Record<WorldId, string> = {
  COMMONS: 'commons',
  HOME: 'home-yard',
  TRANSIT: 'transit',
  GALLERY: 'gallery-lobby',
  GARY: 'gary-arrival',
  GHANA: 'ghana-arrival',
  GUYANA: 'guyana-arrival',
  GEELONG: 'geelong-arrival',
  GERMANY: 'germany-arrival',
  GAZA: 'gaza-arrival',
  GRAHAM_LAND: 'graham-land-arrival',
};

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

export type WorldStateSaveResult =
  | { ok: true }
  | { ok: false; reason: 'invalid_state' | 'storage_unavailable' | 'storage_write_failed' };

export const defaultWorldState = (world: WorldId = 'HOME'): WorldRuntimeState => ({
  mode: 'WORLD',
  world,
  zone: ENTRY_ZONE[world],
  avatarPosition: [0, 0, 4],
  avatarFacing: Math.PI,
  seated: false,
  screenPower: false,
  returnContext: null,
  reducedMotion: false,
});

function browserLocalStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function validPosition(value: unknown): value is [number, number, number] {
  return (
    Array.isArray(value)
    && value.length === 3
    && value.every(
      (coordinate) => typeof coordinate === 'number'
        && Number.isFinite(coordinate)
        && Math.abs(coordinate) <= MAX_COORDINATE,
    )
  );
}

export function isWorldRuntimeState(value: unknown): value is WorldRuntimeState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const state = value as Partial<WorldRuntimeState>;
  return (
    typeof state.mode === 'string'
    && WORLD_MODES.has(state.mode as WorldMode)
    && typeof state.world === 'string'
    && WORLD_IDS.has(state.world as WorldId)
    && typeof state.zone === 'string'
    && state.zone.length > 0
    && state.zone.length <= MAX_ZONE_LENGTH
    && validPosition(state.avatarPosition)
    && typeof state.avatarFacing === 'number'
    && Number.isFinite(state.avatarFacing)
    && typeof state.seated === 'boolean'
    && typeof state.screenPower === 'boolean'
    && (state.returnContext === null || isReturnContext(state.returnContext))
    && typeof state.reducedMotion === 'boolean'
  );
}

/**
 * Restore every persisted runtime field. Passing `world` rejects stale state
 * from a different world instead of placing the avatar in the wrong scene.
 */
export function loadWorldState(
  world?: WorldId,
  storage: StorageLike | null = browserLocalStorage(),
): WorldRuntimeState {
  const fallback = defaultWorldState(world || 'HOME');
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(WORLD_STATE_KEY);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (!isWorldRuntimeState(parsed)) return fallback;
    if (world && parsed.world !== world) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

export function restoreWorldState(
  world: WorldId,
  storage: StorageLike | null = browserLocalStorage(),
): WorldRuntimeState {
  return loadWorldState(world, storage);
}

export function saveWorldState(
  state: WorldRuntimeState,
  storage: StorageLike | null = browserLocalStorage(),
): WorldStateSaveResult {
  if (!isWorldRuntimeState(state)) return { ok: false, reason: 'invalid_state' };
  if (!storage) return { ok: false, reason: 'storage_unavailable' };
  try {
    storage.setItem(WORLD_STATE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch {
    return { ok: false, reason: 'storage_write_failed' };
  }
}

export function clearWorldState(storage: StorageLike | null = browserLocalStorage()): void {
  if (!storage) return;
  try {
    storage.removeItem(WORLD_STATE_KEY);
  } catch {
    // Best-effort in browsers that deny storage access.
  }
}
