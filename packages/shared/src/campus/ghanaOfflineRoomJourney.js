/**
 * Ghana offline resume → portfolio → regional exchange (room-bound).
 * Mobile-first planning concept; pop-up routes are planning layers only.
 */

import { createPrivateNode, VISIBILITY } from '../privacyPolicy.js';
import { specialistWaikeDeepLink, SPECIALIST_WAIKE_TRACKS } from './waikeContract.js';

export const GHANA_OFFLINE_ROOM_JOURNEY_ID = 'ghana.offline.cache_to_exchange';

export const GHANA_OFFLINE_ROOM_STEPS = Object.freeze([
  {
    id: 'cache_lesson',
    room_key: 'FLEXIBLE_CLASSROOM',
    phase_hint: 'pilot',
    title: 'Cache civic lesson for offline',
    produces: 'cached_lesson',
    min_chars: 12,
  },
  {
    id: 'resume_cached',
    room_key: 'HYBRID_LEARNING_RECORDING',
    phase_hint: 'pilot',
    title: 'Resume cached lesson offline',
    produces: 'resume_receipt',
    min_chars: 8,
  },
  {
    id: 'prepare_portfolio',
    room_key: 'CAREER_PORTFOLIO_STUDIO',
    phase_hint: 'semi',
    title: 'Prepare private regional portfolio',
    produces: 'portfolio_item',
    min_chars: 16,
  },
  {
    id: 'regional_exchange',
    room_key: 'COMMUNITY_ROOM',
    phase_hint: 'semi',
    title: 'Credit regional exchange (planning route)',
    produces: 'regional_exchange',
    min_chars: 12,
  },
  {
    id: 'save_and_return',
    room_key: 'PRESENTATION_WALL',
    phase_hint: 'pilot',
    title: 'Save and return Home',
    produces: 'home_return_receipt',
    min_chars: 2,
  },
]);

export function createGhanaOfflineRoomJourney({ learnerId, now = new Date().toISOString() } = {}) {
  if (!learnerId) return { ok: false, reason: 'learner_required' };
  return {
    ok: true,
    journey: {
      journey_id: GHANA_OFFLINE_ROOM_JOURNEY_ID,
      learner_id: learnerId,
      campus_slug: 'ghana',
      representation_state: 'planning_concept',
      location_id: 'loc.campus.ghana',
      created_at: now,
      updated_at: now,
      completed_step_ids: [],
      artifacts: {},
      offline: true,
      active_room_key: null,
      active_phase_hint: 'pilot',
      saved: false,
      returned_home: false,
      waike_deep_link: specialistWaikeDeepLink(SPECIALIST_WAIKE_TRACKS.OFFLINE_LEARNING_STUDIO || 'DIGITAL_CONFIDENCE'),
    },
  };
}

export function advanceGhanaOfflineRoomJourney(journey, stepId, { learnerInput = '', now = new Date().toISOString(), actorId } = {}) {
  if (!journey || journey.journey_id !== GHANA_OFFLINE_ROOM_JOURNEY_ID) return { ok: false, reason: 'invalid_journey' };
  const step = GHANA_OFFLINE_ROOM_STEPS.find((s) => s.id === stepId);
  if (!step) return { ok: false, reason: 'unknown_step' };
  const expected = GHANA_OFFLINE_ROOM_STEPS[journey.completed_step_ids.length];
  if (!expected || expected.id !== stepId) return { ok: false, reason: 'out_of_order', expected: expected?.id || null };
  const text = String(learnerInput || '').trim();
  if (text.length < step.min_chars) return { ok: false, reason: 'insufficient_learner_work', required_chars: step.min_chars };

  const next = {
    ...journey,
    updated_at: now,
    completed_step_ids: [...journey.completed_step_ids, stepId],
    active_room_key: step.room_key,
    active_phase_hint: step.phase_hint,
    artifacts: {
      ...journey.artifacts,
      [step.produces]: {
        step_id: stepId,
        room_key: step.room_key,
        created_at: now,
        body: text,
        visibility: stepId === 'prepare_portfolio' ? VISIBILITY.PRIVATE : 'learner_private',
      },
    },
  };

  let privateNode = null;
  if (stepId === 'cache_lesson') {
    next.cached_lesson = {
      id: `gh-offline-${journey.learner_id}`,
      title: text.slice(0, 80),
      cached_at: now,
      resume_token: `offline:${journey.learner_id}:gh-offline-1`,
    };
  }
  if (stepId === 'resume_cached') {
    if (!next.cached_lesson && !journey.cached_lesson) return { ok: false, reason: 'no_cached_lesson' };
    next.cached_lesson = { ...(next.cached_lesson || journey.cached_lesson), resumed_at: now };
  }
  if (stepId === 'prepare_portfolio') {
    privateNode = createPrivateNode({
      ownerId: actorId || journey.learner_id,
      name: 'Ghana regional pop-up portfolio',
      mimeType: 'text/plain',
      extra: {
        id: `ghana-offline-portfolio-${now}`,
        campus_slug: 'ghana',
        journey_id: journey.journey_id,
        room_key: step.room_key,
        representation_state: 'planning_concept',
        body: text,
        gallery_zone: 'my_gallery',
        gallery_file: true,
        published: false,
        offline: true,
      },
    });
    next.artifacts.portfolio_item.private_node_id = privateNode.id;
    next.artifacts.portfolio_item.visibility = VISIBILITY.PRIVATE;
    next.portfolio_item = {
      id: `gh-art-${journey.learner_id}`,
      title: text.slice(0, 80),
      visibility: 'private_until_publish',
      created_at: now,
    };
  }
  if (stepId === 'regional_exchange') {
    if (!next.portfolio_item && !next.artifacts.portfolio_item) return { ok: false, reason: 'portfolio_required' };
    next.regional_exchange = {
      credited_project_id: next.portfolio_item?.id || 'portfolio',
      credit: { region: text, note: 'planning_layer_only' },
      created_at: now,
      pop_up_route: 'planning_layer_only',
    };
  }
  if (stepId === 'save_and_return') {
    if (!next.regional_exchange) return { ok: false, reason: 'exchange_required_before_save' };
    next.saved = true;
    next.returned_home = true;
  }

  const complete = next.completed_step_ids.length === GHANA_OFFLINE_ROOM_STEPS.length;
  return {
    ok: true,
    journey: next,
    step,
    complete,
    private_node: privateNode,
    active_room_key: step.room_key,
    active_phase_hint: step.phase_hint,
    nav_only: false,
  };
}

export function ghanaOfflineRoomProgress(journey) {
  const total = GHANA_OFFLINE_ROOM_STEPS.length;
  const done = journey?.completed_step_ids?.length || 0;
  return {
    done,
    total,
    next_step: GHANA_OFFLINE_ROOM_STEPS[done] || null,
    complete: done === total,
    active_room_key: journey?.active_room_key || null,
    representation_state: 'planning_concept',
  };
}

export function runGhanaOfflineRoomPlayable({ learnerId = 'learner-gh', now = '2026-10-30T17:00:00.000Z' } = {}) {
  const created = createGhanaOfflineRoomJourney({ learnerId, now });
  if (!created.ok) return created;
  let journey = created.journey;
  const inputs = {
    cache_lesson: 'Mobile-first civic lesson cached for Accra–Tema planning route (offline pack).',
    resume_cached: 'Resumed cached lesson on hybrid recording kit without network.',
    prepare_portfolio: 'Portfolio: regional pop-up kit plan for Tamale planning route (private until publish).',
    regional_exchange: 'Tamale planning route exchange credited — planning layer only, not field deployment.',
    save_and_return: 'OK',
  };
  const transcript = [];
  let privateNode = null;
  for (const step of GHANA_OFFLINE_ROOM_STEPS) {
    const result = advanceGhanaOfflineRoomJourney(journey, step.id, {
      learnerInput: inputs[step.id],
      now,
      actorId: learnerId,
    });
    if (!result.ok) return { ok: false, reason: result.reason, at: step.id, transcript };
    journey = result.journey;
    if (result.private_node) privateNode = result.private_node;
    transcript.push({ step_id: step.id, room_key: step.room_key, phase_hint: step.phase_hint });
  }
  return {
    ok: true,
    journey,
    transcript,
    private_node: privateNode,
    private_visibility: privateNode?.visibility === VISIBILITY.PRIVATE,
    offline_resumed: Boolean(journey.cached_lesson?.resumed_at),
    regional_exchange: journey.regional_exchange,
    rooms_include_portfolio_studio: transcript.some((t) => t.room_key === 'CAREER_PORTFOLIO_STUDIO'),
    returned_home: journey.returned_home === true,
    location_id: 'loc.campus.ghana',
    representation_state: 'planning_concept',
    nav_only: false,
  };
}
