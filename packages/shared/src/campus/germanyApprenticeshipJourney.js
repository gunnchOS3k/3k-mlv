/**
 * Germany apprenticeship specialty: build → document → test → improve → present.
 * Room-bound across pilot mechatronics cart / docs workstation and semi I4.0 twin studio.
 * Industrial cybersecurity is a learning activity, not a certification claim.
 */

import { createPrivateNode, VISIBILITY } from '../privacyPolicy.js';
import { specialistWaikeDeepLink, SPECIALIST_WAIKE_TRACKS } from './waikeContract.js';

export const GERMANY_APPRENTICE_JOURNEY_ID = 'germany.apprenticeship.build_to_present';

export const GERMANY_APPRENTICE_STEPS = Object.freeze([
  {
    id: 'build',
    room_key: 'MOBILE_HARDWARE_MECHATRONICS_CART',
    phase_hint: 'pilot',
    title: 'Build mechatronics station exercise',
    produces: 'build_log',
    min_chars: 12,
  },
  {
    id: 'document',
    room_key: 'TECHNICAL_DOCUMENTATION_WORKSTATION',
    phase_hint: 'pilot',
    title: 'Document SOP / quality checklist',
    produces: 'sop_draft',
    min_chars: 16,
  },
  {
    id: 'test',
    room_key: 'INDUSTRY40_DIGITAL_TWIN_STUDIO',
    phase_hint: 'semi',
    title: 'Test on Industry 4.0 / twin bench',
    produces: 'test_record',
    min_chars: 12,
  },
  {
    id: 'improve',
    room_key: 'INDUSTRY40_DIGITAL_TWIN_STUDIO',
    phase_hint: 'semi',
    title: 'Improve after quality review',
    produces: 'improvement_notes',
    min_chars: 12,
  },
  {
    id: 'present',
    room_key: 'CAREER_APPRENTICESHIP_STUDIO',
    phase_hint: 'semi',
    title: 'Present portfolio and return Home',
    produces: 'portfolio_item',
    min_chars: 16,
  },
]);

export function createGermanyApprenticeshipJourney({ learnerId, now = new Date().toISOString() } = {}) {
  if (!learnerId) return { ok: false, reason: 'learner_required' };
  return {
    ok: true,
    journey: {
      journey_id: GERMANY_APPRENTICE_JOURNEY_ID,
      learner_id: learnerId,
      campus_slug: 'germany',
      representation_state: 'planning_concept',
      location_id: 'loc.campus.germany',
      created_at: now,
      updated_at: now,
      completed_step_ids: [],
      artifacts: {},
      active_room_key: null,
      active_phase_hint: 'pilot',
      saved: false,
      returned_home: false,
      industrial_cyber_note: 'Industrial cybersecurity treated as learning activity, not certification.',
      waike_deep_link: specialistWaikeDeepLink(SPECIALIST_WAIKE_TRACKS.INDUSTRY40_TWIN_LAB),
    },
  };
}

export function advanceGermanyApprenticeshipJourney(journey, stepId, { learnerInput = '', now = new Date().toISOString(), actorId } = {}) {
  if (!journey || journey.journey_id !== GERMANY_APPRENTICE_JOURNEY_ID) return { ok: false, reason: 'invalid_journey' };
  const step = GERMANY_APPRENTICE_STEPS.find((s) => s.id === stepId);
  if (!step) return { ok: false, reason: 'unknown_step' };
  const expected = GERMANY_APPRENTICE_STEPS[journey.completed_step_ids.length];
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
        visibility: stepId === 'present' ? VISIBILITY.PRIVATE : 'learner_private',
      },
    },
  };

  let privateNode = null;
  if (stepId === 'present') {
    if (!next.artifacts.sop_draft || !next.artifacts.test_record) {
      return { ok: false, reason: 'sop_and_test_required_before_present' };
    }
    privateNode = createPrivateNode({
      ownerId: actorId || journey.learner_id,
      name: 'Germany apprenticeship portfolio',
      mimeType: 'text/plain',
      extra: {
        id: `germany-apprentice-portfolio-${now}`,
        campus_slug: 'germany',
        journey_id: journey.journey_id,
        room_key: step.room_key,
        representation_state: 'planning_concept',
        body: text,
        sop_title: 'Mechatronics quality checklist (planning concept)',
        industrial_cyber_note: journey.industrial_cyber_note,
        gallery_zone: 'my_gallery',
        gallery_file: true,
        published: false,
      },
    });
    next.artifacts.portfolio_item.private_node_id = privateNode.id;
    next.artifacts.portfolio_item.visibility = VISIBILITY.PRIVATE;
    next.saved = true;
    next.returned_home = true;
  }

  const complete = next.completed_step_ids.length === GERMANY_APPRENTICE_STEPS.length;
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

export function germanyApprenticeshipProgress(journey) {
  const total = GERMANY_APPRENTICE_STEPS.length;
  const done = journey?.completed_step_ids?.length || 0;
  return {
    done,
    total,
    next_step: GERMANY_APPRENTICE_STEPS[done] || null,
    complete: done === total,
    active_room_key: journey?.active_room_key || null,
    representation_state: 'planning_concept',
  };
}

export function runGermanyApprenticeshipPlayable({ learnerId = 'learner-de', now = '2026-10-30T16:00:00.000Z' } = {}) {
  const created = createGermanyApprenticeshipJourney({ learnerId, now });
  if (!created.ok) return created;
  let journey = created.journey;
  const inputs = {
    build: 'Assembled sensor/actuator station on mobile mechatronics cart; verified I/O lights.',
    document: 'SOP: lockout steps, torque table, and quality checklist for apprentice review — learning activity only.',
    test: 'Twin bench test: cycle time within planning envelope; cyber note logged as coursework not cert.',
    improve: 'Improvement: clarified cable dress; added peer-review gate before employer briefing.',
    present: 'Portfolio: build log + SOP draft + twin test notes for Career/apprenticeship studio (private).',
  };
  const transcript = [];
  let privateNode = null;
  for (const step of GERMANY_APPRENTICE_STEPS) {
    const result = advanceGermanyApprenticeshipJourney(journey, step.id, {
      learnerInput: inputs[step.id],
      now,
      actorId: learnerId,
    });
    if (!result.ok) return { ok: false, reason: result.reason, at: step.id, transcript };
    journey = result.journey;
    if (result.private_node) privateNode = result.private_node;
    transcript.push({
      step_id: step.id,
      room_key: step.room_key,
      phase_hint: step.phase_hint,
    });
  }
  return {
    ok: true,
    journey,
    transcript,
    private_node: privateNode,
    private_visibility: privateNode?.visibility === VISIBILITY.PRIVATE,
    rooms_include_industry40_studio: transcript.some((t) => t.room_key === 'INDUSTRY40_DIGITAL_TWIN_STUDIO'),
    rooms_include_mechatronics_cart: transcript.some((t) => t.room_key === 'MOBILE_HARDWARE_MECHATRONICS_CART'),
    steps_completed: journey.completed_step_ids,
    returned_home: journey.returned_home === true,
    industrial_cyber_not_cert: true,
    location_id: 'loc.campus.germany',
    representation_state: 'planning_concept',
    schematic_planning_twin_only: true,
    PIXEL_7GC_CAMPUS_PASS: false,
    HUMAN_7GC_SPATIAL_FIDELITY_PASS: false,
    nav_only: false,
  };
}
