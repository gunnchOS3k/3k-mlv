import { persistReturnContext } from './ReturnContext';
import type { ReturnContext } from './types';

export const ANIME_PACKAGE = 'com.gunnchos.animeaggressors';
export const PHYSICAL_EDGE_IO_RINGS_VALIDATION_PENDING = true;

export type HandoffResult =
  | { ok: true; method: 'intent' | 'fallback_prompt' | 'web_fallback' }
  | { ok: false; reason: string };

/** Launch only from an explicit user gesture. */
export function launchAnimeAggressors(returnCtx: ReturnContext): HandoffResult {
  persistReturnContext(returnCtx);
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const android = /Android/i.test(ua);
  if (android) {
    try {
      const intent = `intent://#Intent;scheme=gunnchos;package=${ANIME_PACKAGE};end`;
      window.location.href = intent;
      return { ok: true, method: 'intent' };
    } catch (e) {
      return { ok: false, reason: String(e) };
    }
  }
  // Browser fallback: explicit open action / web path if available
  const web = (import.meta as { env?: Record<string, string> }).env?.VITE_ANIME_WEB_URL;
  if (web) {
    window.open(web, '_blank', 'noopener,noreferrer');
    return { ok: true, method: 'web_fallback' };
  }
  return { ok: true, method: 'fallback_prompt' };
}

export const CROSS_REPO_APP_RETURN_CONTRACT = {
  schema: 'mlv_anime_return_contract/v1',
  package: ANIME_PACKAGE,
  resume_query: 'mlv_return=1',
  context_storage_keys: ['mlv.v4_2.return_context'],
  required_anime_side: 'deep_link_or_onResume_broadcast_optional',
  status: 'MLV_SIDE_PERSISTENCE_READY',
};
