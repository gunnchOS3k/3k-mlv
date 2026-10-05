import { persistReturnContext } from './ReturnContext';
import { createHandoffPlan, returnSceneHash } from './handoffRoutes.mjs';
import type { ReturnContext } from './types';

export const ANIME_PACKAGE = 'com.gunnchos.animeaggressors';
export const PHYSICAL_EDGE_IO_RINGS_VALIDATION_PENDING = true;

export type HandoffMethod = 'intent' | 'fallback_prompt' | 'web_fallback' | 'protocol' | 'web' | 'internal_contract_surface';
export type HandoffResult =
  | { ok: true; method: HandoffMethod; target?: string; returnTo?: string }
  | { ok: false; reason: string };

type HandoffPlan = {
  ok: boolean;
  reason?: string;
  method?: HandoffMethod;
  url?: string;
  target?: string;
  returnTo?: string;
};

function persistForHandoff(returnCtx: ReturnContext): HandoffResult | null {
  const saved = persistReturnContext(returnCtx);
  return saved.ok ? null : { ok: false, reason: `return_context_${saved.reason}` };
}

function executePlan(plan: HandoffPlan): HandoffResult {
  if (!plan.ok || !plan.method || !plan.url) {
    return { ok: false, reason: plan.reason || 'invalid_handoff_plan' };
  }
  if (typeof window === 'undefined') return { ok: false, reason: 'browser_unavailable' };
  try {
    if (plan.method === 'internal_contract_surface') window.location.hash = plan.url;
    else window.location.assign(plan.url);
    return { ok: true, method: plan.method, target: plan.target, returnTo: plan.returnTo };
  } catch (error) {
    return { ok: false, reason: String(error) };
  }
}

/** Launch only from an explicit user gesture. */
export function launchAnimeAggressors(returnCtx: ReturnContext): HandoffResult {
  const persistenceFailure = persistForHandoff(returnCtx);
  if (persistenceFailure) return persistenceFailure;
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const android = /Android/i.test(ua);
  if (android) {
    try {
      const intent = `intent://#Intent;scheme=gunnchos;package=${ANIME_PACKAGE};end`;
      window.location.href = intent;
      return { ok: true, method: 'intent', returnTo: returnSceneHash(returnCtx) };
    } catch (error) {
      return { ok: false, reason: String(error) };
    }
  }
  const web = import.meta.env.VITE_ANIME_WEB_URL;
  if (web) {
    window.open(web, '_blank', 'noopener,noreferrer');
    return { ok: true, method: 'web_fallback', returnTo: returnSceneHash(returnCtx) };
  }
  return { ok: true, method: 'fallback_prompt', returnTo: returnSceneHash(returnCtx) };
}

export function launchWaike(destination: string, returnCtx: ReturnContext): HandoffResult {
  const persistenceFailure = persistForHandoff(returnCtx);
  if (persistenceFailure) return persistenceFailure;
  const plan = createHandoffPlan('waike', destination, {
    returnContext: returnCtx,
    webBaseUrl: import.meta.env.VITE_WAIKE_WEB_URL,
    protocolEnabled: import.meta.env.VITE_WAIKE_PROTOCOL_ENABLED === 'true',
  }) as HandoffPlan;
  return executePlan(plan);
}

export function launchResearch(destination: string, returnCtx: ReturnContext): HandoffResult {
  const persistenceFailure = persistForHandoff(returnCtx);
  if (persistenceFailure) return persistenceFailure;
  const plan = createHandoffPlan('research', destination, {
    returnContext: returnCtx,
    webBaseUrl: import.meta.env.VITE_RESEARCH_WEB_URL,
    protocolEnabled: import.meta.env.VITE_RESEARCH_PROTOCOL_ENABLED === 'true',
  }) as HandoffPlan;
  return executePlan(plan);
}

export const CROSS_REPO_APP_RETURN_CONTRACT = Object.freeze({
  schema: 'mlv_capability_return_contract/v1',
  package: ANIME_PACKAGE,
  resume_query: 'mlv_return=1',
  context_storage_keys: ['mlv.v4_2.return_context'],
  world_return_route: '#/mlv/scene/<scene_id>',
  required_external_behavior: 'preserve return_to or return to MLV; MLV restores validated local context',
  status: 'MLV_SIDE_PERSISTENCE_READY',
});

export const WAIKE_HANDOFF_CONTRACT = Object.freeze({
  schema: 'mlv_waike_handoff/v1',
  targets: ['courses', 'study', 'assignments', 'calendar'],
  source_of_record: 'gunnchOS3k/gunnchos-waike-learning-platform',
  fallback: 'MLV WAIKE contract consumer surface; no duplicated learner records',
});

export const RESEARCH_HANDOFF_CONTRACT = Object.freeze({
  schema: 'mlv_research_handoff/v1',
  project_prefix: '7gc-',
  source_project: 'gunnchOS3k/gunnchos-research-portal',
  evidence_label: 'simulation / digital twin / prototype',
  physical_claim: false,
});
