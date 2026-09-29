import type { ReturnContext } from './types';

const KEY = 'mlv.v4_2.return_context';

export function persistReturnContext(ctx: ReturnContext): void {
  localStorage.setItem(KEY, JSON.stringify(ctx));
  sessionStorage.setItem(KEY, JSON.stringify(ctx));
}

export function readReturnContext(): ReturnContext | null {
  const raw = sessionStorage.getItem(KEY) || localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ReturnContext;
  } catch {
    return null;
  }
}

export function clearReturnContext(): void {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
}

export function serializeReturnContext(ctx: ReturnContext): string {
  return JSON.stringify(ctx);
}

export function parseReturnContext(raw: string): ReturnContext {
  const ctx = JSON.parse(raw) as ReturnContext;
  if (!ctx.world || !ctx.anchor || !ctx.avatarPosition) {
    throw new Error('invalid return context');
  }
  return ctx;
}
