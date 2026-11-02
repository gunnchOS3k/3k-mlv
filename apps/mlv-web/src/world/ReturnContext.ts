import type { ReturnContext } from './types';

export const RETURN_CONTEXT_KEY = 'mlv.v4_2.return_context';

const MAX_LABEL_LENGTH = 160;
const MAX_SESSION_LENGTH = 256;
const MAX_COORDINATE = 1_000_000;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type ReturnContextStorage = {
  local?: StorageLike | null;
  session?: StorageLike | null;
};

export type ReturnContextParseResult =
  | { ok: true; value: ReturnContext }
  | { ok: false; reason: 'invalid_json' | 'invalid_shape' };

export type ReturnContextPersistenceResult =
  | { ok: true; persisted: Array<'local' | 'session'> }
  | {
      ok: false;
      reason: 'invalid_context' | 'storage_unavailable' | 'storage_write_failed';
      persisted: Array<'local' | 'session'>;
    };

function browserStorage(name: 'localStorage' | 'sessionStorage'): StorageLike | null {
  if (typeof window === 'undefined') return null;
  try {
    return window[name];
  } catch {
    return null;
  }
}

function resolveStorage(storage?: ReturnContextStorage): Required<ReturnContextStorage> {
  return {
    local: storage?.local === undefined ? browserStorage('localStorage') : storage.local,
    session: storage?.session === undefined ? browserStorage('sessionStorage') : storage.session,
  };
}

function validLabel(value: unknown, maxLength = MAX_LABEL_LENGTH): value is string {
  return (
    typeof value === 'string'
    && value.length > 0
    && value.length <= maxLength
    && !CONTROL_CHARACTERS.test(value)
  );
}

function validCoordinate(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= MAX_COORDINATE;
}

export function isReturnContext(value: unknown): value is ReturnContext {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Partial<ReturnContext>;
  return (
    validLabel(candidate.world)
    && validLabel(candidate.zone)
    && validLabel(candidate.anchor)
    && validLabel(candidate.session, MAX_SESSION_LENGTH)
    && Array.isArray(candidate.avatarPosition)
    && candidate.avatarPosition.length === 3
    && candidate.avatarPosition.every(validCoordinate)
    && typeof candidate.avatarFacing === 'number'
    && Number.isFinite(candidate.avatarFacing)
  );
}

export function tryParseReturnContext(raw: string): ReturnContextParseResult {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'invalid_json' };
  }
  return isReturnContext(value)
    ? { ok: true, value }
    : { ok: false, reason: 'invalid_shape' };
}

export function serializeReturnContext(ctx: ReturnContext): string {
  if (!isReturnContext(ctx)) throw new Error('invalid return context');
  return JSON.stringify(ctx);
}

export function parseReturnContext(raw: string): ReturnContext {
  const parsed = tryParseReturnContext(raw);
  if (!parsed.ok) throw new Error(`invalid return context: ${parsed.reason}`);
  return parsed.value;
}

/**
 * Persist to both scopes before an external handoff. A single successful scope
 * is enough to recover, but the result names the scopes that actually wrote.
 */
export function persistReturnContext(
  ctx: ReturnContext,
  storage?: ReturnContextStorage,
): ReturnContextPersistenceResult {
  if (!isReturnContext(ctx)) {
    return { ok: false, reason: 'invalid_context', persisted: [] };
  }

  const targets = resolveStorage(storage);
  const raw = JSON.stringify(ctx);
  const persisted: Array<'local' | 'session'> = [];
  let attempted = false;

  for (const [scope, target] of Object.entries(targets) as Array<
    ['local' | 'session', StorageLike | null]
  >) {
    if (!target) continue;
    attempted = true;
    try {
      target.setItem(RETURN_CONTEXT_KEY, raw);
      persisted.push(scope);
    } catch {
      // Try the other storage scope before reporting failure.
    }
  }

  if (persisted.length > 0) return { ok: true, persisted };
  return {
    ok: false,
    reason: attempted ? 'storage_write_failed' : 'storage_unavailable',
    persisted,
  };
}

export function readReturnContext(storage?: ReturnContextStorage): ReturnContext | null {
  const targets = resolveStorage(storage);
  for (const target of [targets.session, targets.local]) {
    if (!target) continue;
    try {
      const raw = target.getItem(RETURN_CONTEXT_KEY);
      if (!raw) continue;
      const parsed = tryParseReturnContext(raw);
      if (parsed.ok) return parsed.value;
    } catch {
      // A denied or corrupted scope must not prevent fallback to the other one.
    }
  }
  return null;
}

export function clearReturnContext(storage?: ReturnContextStorage): void {
  const targets = resolveStorage(storage);
  for (const target of [targets.local, targets.session]) {
    if (!target) continue;
    try {
      target.removeItem(RETURN_CONTEXT_KEY);
    } catch {
      // Clearing is best-effort because browser privacy modes may deny storage.
    }
  }
}
