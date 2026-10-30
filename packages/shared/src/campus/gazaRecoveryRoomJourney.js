/**
 * Gaza recovery offline / shared-device → portfolio recover → withdraw sharing (room-bound).
 * Trauma-informed recovery network twin — never emits site coordinates.
 */

import { createPrivateNode, VISIBILITY } from '../privacyPolicy.js';
import { gazaPublicExportSafe } from './specialtyJourneys.js';
import { specialistWaikeDeepLink, SPECIALIST_WAIKE_TRACKS } from './waikeContract.js';

export const GAZA_RECOVERY_ROOM_JOURNEY_ID = 'gaza.recovery.offline_withdraw_home';

export const GAZA_RECOVERY_ROOM_STEPS = Object.freeze([
  {
    id: 'shared_device_orient',
    room_key: 'SAFE_TEMPORARY_LEARNING_CIRCLE',
    phase_hint: 'pilot',
    title: 'Orient on shared device (no coordinates)',
    produces: 'shared_device_session',
    min_chars: 16,
  },
  {
    id: 'offline_continue',
    room_key: 'OFFLINE_LEARNING_KIT',
    phase_hint: 'pilot',
    title: 'Continue offline learning kit',
    produces: 'offline_lesson',
    min_chars: 12,
  },
  {
    id: 'recover_portfolio',
    room_key: 'RECONSTRUCTION_DOCUMENTATION_STUDIO',
    phase_hint: 'semi',
    title: 'Recover private reconstruction portfolio',
    produces: 'portfolio',
    min_chars: 16,
  },
  {
    id: 'withdraw_sharing',
    room_key: 'PSYCHOSOCIAL_DECOMPRESSION_SPACE',
    phase_hint: 'semi',
    title: 'Withdraw sharing; keep portfolio private',
    produces: 'withdraw_receipt',
    min_chars: 8,
  },
  {
    id: 'save_and_return',
    room_key: 'TEACHER_SUPPORT_STATION',
    phase_hint: 'semi',
    title: 'Confirm safe export and return Home',
    produces: 'home_return_receipt',
    min_chars: 2,
  },
]);

/** Reject real coordinate payload claims; allow honest "no coordinates" copy. */
const DEGREE_PAIR_RE = /-?\d{1,2}\.\d{4,}\s*,\s*-?\d{1,3}\.\d{4,}/;
const COORD_KEY_CLAIM_RE =
  /\b(latitude|longitude|shelter_coordinates)\s*[:=]|(\blat\b|\blon\b|\blng\b|\bgps\b)\s*[:=]/i;

export function createGazaRecoveryRoomJourney({ learnerId, now = new Date().toISOString() } = {}) {
  if (!learnerId) return { ok: false, reason: 'learner_required' };
  return {
    ok: true,
    journey: {
      journey_id: GAZA_RECOVERY_ROOM_JOURNEY_ID,
      learner_id: learnerId,
      campus_slug: 'gaza',
      representation_state: 'planning_concept',
      location_id: 'loc.campus.gaza',
      created_at: now,
      updated_at: now,
      completed_step_ids: [],
      artifacts: {},
      shared_device_session: null,
      offline_lesson: null,
      portfolio: null,
      sharing_withdrawn: false,
      public_export_fields: [],
      active_room_key: null,
      active_phase_hint: 'pilot',
      saved: false,
      returned_home: false,
      no_sensitive_locations: true,
      waike_deep_link: specialistWaikeDeepLink(SPECIALIST_WAIKE_TRACKS.RECONSTRUCTION_DOCUMENTATION_STUDIO),
    },
  };
}

export function advanceGazaRecoveryRoomJourney(journey, stepId, { learnerInput = '', now = new Date().toISOString(), actorId } = {}) {
  if (!journey || journey.journey_id !== GAZA_RECOVERY_ROOM_JOURNEY_ID) return { ok: false, reason: 'invalid_journey' };
  const step = GAZA_RECOVERY_ROOM_STEPS.find((s) => s.id === stepId);
  if (!step) return { ok: false, reason: 'unknown_step' };
  const expected = GAZA_RECOVERY_ROOM_STEPS[journey.completed_step_ids.length];
  if (!expected || expected.id !== stepId) return { ok: false, reason: 'out_of_order', expected: expected?.id || null };
  const text = String(learnerInput || '').trim();
  if (text.length < step.min_chars) return { ok: false, reason: 'insufficient_learner_work', required_chars: step.min_chars };
  if (DEGREE_PAIR_RE.test(text) || COORD_KEY_CLAIM_RE.test(text)) {
    return { ok: false, reason: 'sensitive_location_forbidden' };
  }

  if (stepId === 'shared_device_orient' && !/no (site |sensitive )?coord|shared device|sign[- ]?out|not a permanent campus/i.test(text)) {
    return { ok: false, reason: 'recovery_honesty_required' };
  }

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
        visibility: stepId === 'recover_portfolio' ? VISIBILITY.PRIVATE : 'learner_private',
      },
    },
    public_export_fields: ['representation_state', 'journey_id'],
  };

  let privateNode = null;
  if (stepId === 'shared_device_orient') {
    next.shared_device_session = { device_id: 'shared-kiosk', started_at: now, sign_out_required: true };
  }
  if (stepId === 'offline_continue') {
    next.offline_lesson = { status: 'in_progress', started_at: now, note: text.slice(0, 120) };
  }
  if (stepId === 'recover_portfolio') {
    privateNode = createPrivateNode({
      ownerId: actorId || journey.learner_id,
      name: 'Gaza reconstruction portfolio (private)',
      mimeType: 'text/plain',
      extra: {
        id: `gaza-recovery-portfolio-${now}`,
        campus_slug: 'gaza',
        journey_id: journey.journey_id,
        room_key: step.room_key,
        representation_state: 'planning_concept',
        body: text,
        gallery_zone: 'my_gallery',
        gallery_file: true,
        published: false,
        no_coordinates: true,
      },
    });
    next.portfolio = {
      id: `gz-p-${journey.learner_id}`,
      title: text.slice(0, 80),
      visibility: 'private',
      recovered_at: now,
      private_node_id: privateNode.id,
    };
    next.artifacts.portfolio.private_node_id = privateNode.id;
    next.artifacts.portfolio.visibility = VISIBILITY.PRIVATE;
  }
  if (stepId === 'withdraw_sharing') {
    if (!next.portfolio) return { ok: false, reason: 'portfolio_required_before_withdraw' };
    next.sharing_withdrawn = true;
    next.portfolio = { ...next.portfolio, visibility: 'private', shared: false };
    next.public_export_fields = ['representation_state', 'journey_id', 'sharing_withdrawn'];
  }
  if (stepId === 'save_and_return') {
    if (!next.sharing_withdrawn) return { ok: false, reason: 'withdraw_required_before_save' };
    const safety = gazaPublicExportSafe(next);
    if (!safety.pass) return { ok: false, reason: 'public_export_unsafe', safety };
    next.saved = true;
    next.returned_home = true;
  }

  const complete = next.completed_step_ids.length === GAZA_RECOVERY_ROOM_STEPS.length;
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

export function gazaRecoveryRoomProgress(journey) {
  const total = GAZA_RECOVERY_ROOM_STEPS.length;
  const done = journey?.completed_step_ids?.length || 0;
  return {
    done,
    total,
    next_step: GAZA_RECOVERY_ROOM_STEPS[done] || null,
    complete: done === total,
    active_room_key: journey?.active_room_key || null,
    representation_state: 'planning_concept',
  };
}

export function runGazaRecoveryRoomPlayable({ learnerId = 'learner-gz', now = '2026-10-30T17:10:00.000Z' } = {}) {
  const created = createGazaRecoveryRoomJourney({ learnerId, now });
  if (!created.ok) return created;
  let journey = created.journey;
  const inputs = {
    shared_device_orient: 'Shared-device kiosk session; sign-out required; no site coordinates; not a permanent campus.',
    offline_continue: 'Offline learning kit resumed without network; caregiver guide open.',
    recover_portfolio: 'Recovered private reconstruction documentation draft — metadata only, no locations.',
    withdraw_sharing: 'Sharing withdrawn; portfolio stays private on this device.',
    save_and_return: 'OK',
  };
  const transcript = [];
  let privateNode = null;
  for (const step of GAZA_RECOVERY_ROOM_STEPS) {
    const result = advanceGazaRecoveryRoomJourney(journey, step.id, {
      learnerInput: inputs[step.id],
      now,
      actorId: learnerId,
    });
    if (!result.ok) return { ok: false, reason: result.reason, at: step.id, transcript };
    journey = result.journey;
    if (result.private_node) privateNode = result.private_node;
    transcript.push({ step_id: step.id, room_key: step.room_key, phase_hint: step.phase_hint });
  }
  const safety = gazaPublicExportSafe(journey);
  return {
    ok: safety.pass && journey.sharing_withdrawn && journey.returned_home === true,
    journey,
    transcript,
    private_node: privateNode,
    private_visibility: privateNode?.visibility === VISIBILITY.PRIVATE,
    safety,
    rooms_include_learning_circle: transcript.some((t) => t.room_key === 'SAFE_TEMPORARY_LEARNING_CIRCLE'),
    rooms_include_offline_kit: transcript.some((t) => t.room_key === 'OFFLINE_LEARNING_KIT'),
    no_sensitive_locations: true,
    returned_home: journey.returned_home === true,
    location_id: 'loc.campus.gaza',
    representation_state: 'planning_concept',
    nav_only: false,
  };
}
