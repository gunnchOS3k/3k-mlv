/**
 * Graham Land remote polar education twin specialty.
 * Low-bandwidth climate/NTN exercise with explicit assumptions.
 * Rejects fictional WAIKE Antarctic station ownership claims.
 */

import { createPrivateNode, VISIBILITY } from '../privacyPolicy.js';
import { specialistWaikeDeepLink, SPECIALIST_WAIKE_TRACKS } from './waikeContract.js';

export const GRAHAM_POLAR_JOURNEY_ID = 'graham.polar_twin.low_bw_to_home';

export const GRAHAM_ASSUMPTIONS = Object.freeze([
  'Remote-first polar education twin',
  'Physical host outside Antarctica if needed',
  'No fictional WAIKE Antarctic station',
  'Simulation ≠ field validation',
]);

export const GRAHAM_POLAR_STEPS = Object.freeze([
  {
    id: 'state_assumptions',
    room_key: 'FLEXIBLE_VIRTUAL_CLASSROOM',
    phase_hint: 'pilot',
    title: 'State twin assumptions (no fake station)',
    produces: 'assumptions_ack',
    min_chars: 20,
  },
  {
    id: 'low_bw_climate',
    room_key: 'DATA_LAB',
    phase_hint: 'pilot',
    title: 'Low-bandwidth climate data exercise',
    produces: 'climate_packet',
    min_chars: 12,
  },
  {
    id: 'ntn_exercise',
    room_key: 'NETWORKING_SATCOM_DEMO_CART',
    phase_hint: 'pilot',
    title: 'NTN / satcom demo cart exercise',
    produces: 'ntn_log',
    min_chars: 12,
  },
  {
    id: 'twin_ops_note',
    room_key: 'GIS_REMOTE_SENSING_STUDIO',
    phase_hint: 'semi',
    title: 'GIS / remote-sensing twin ops note',
    produces: 'twin_ops_note',
    min_chars: 12,
  },
  {
    id: 'portfolio_and_home',
    room_key: 'PUBLIC_EDUCATION_STUDIO',
    phase_hint: 'semi',
    title: 'Private portfolio and return Home',
    produces: 'portfolio_item',
    min_chars: 16,
  },
]);

export function createGrahamPolarTwinJourney({ learnerId, now = new Date().toISOString() } = {}) {
  if (!learnerId) return { ok: false, reason: 'learner_required' };
  return {
    ok: true,
    journey: {
      journey_id: GRAHAM_POLAR_JOURNEY_ID,
      learner_id: learnerId,
      campus_slug: 'graham-land',
      representation_state: 'planning_concept',
      location_id: 'loc.campus.graham-land',
      created_at: now,
      updated_at: now,
      completed_step_ids: [],
      artifacts: {},
      assumptions: [...GRAHAM_ASSUMPTIONS],
      no_fake_station: true,
      active_room_key: null,
      active_phase_hint: 'pilot',
      saved: false,
      returned_home: false,
      heritage_ref: 'loc.heritage.port_lockroy',
      waike_deep_link: specialistWaikeDeepLink(SPECIALIST_WAIKE_TRACKS.NTN_LAB),
    },
  };
}

export function advanceGrahamPolarTwinJourney(journey, stepId, { learnerInput = '', now = new Date().toISOString(), actorId } = {}) {
  if (!journey || journey.journey_id !== GRAHAM_POLAR_JOURNEY_ID) return { ok: false, reason: 'invalid_journey' };
  const step = GRAHAM_POLAR_STEPS.find((s) => s.id === stepId);
  if (!step) return { ok: false, reason: 'unknown_step' };
  const expected = GRAHAM_POLAR_STEPS[journey.completed_step_ids.length];
  if (!expected || expected.id !== stepId) return { ok: false, reason: 'out_of_order', expected: expected?.id || null };
  const text = String(learnerInput || '').trim();
  if (text.length < step.min_chars) return { ok: false, reason: 'insufficient_learner_work', required_chars: step.min_chars };

  if (stepId === 'state_assumptions') {
    const deniesFake = /no (fictional|fake)\s+(waike\s+)?(antarctic\s+)?station|not\s+(a\s+)?(waike\s+)?(owned\s+)?(antarctic\s+)?(station|campus)/i.test(text);
    const affirmsSimulation = /simulation|remote-first|outside antarctica|≠\s*field|not field/i.test(text);
    const claimsOwnership = /\b(waike\s+(owns|owned|operates)|our\s+(antarctic\s+)?(station|campus)\s+in\s+antarctica)\b/i.test(text);
    if (claimsOwnership || !deniesFake || !affirmsSimulation) {
      return { ok: false, reason: 'no_fake_station_required' };
    }
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
        visibility: stepId === 'portfolio_and_home' ? VISIBILITY.PRIVATE : 'learner_private',
      },
    },
  };

  let privateNode = null;
  if (stepId === 'portfolio_and_home') {
    if (!next.artifacts.assumptions_ack || !next.artifacts.ntn_log) {
      return { ok: false, reason: 'assumptions_and_ntn_required' };
    }
    privateNode = createPrivateNode({
      ownerId: actorId || journey.learner_id,
      name: 'Graham Land polar twin portfolio',
      mimeType: 'application/json',
      extra: {
        id: `graham-polar-portfolio-${now}`,
        campus_slug: 'graham-land',
        journey_id: journey.journey_id,
        room_key: step.room_key,
        representation_state: 'planning_concept',
        body: text,
        assumptions: journey.assumptions,
        no_fake_station: true,
        heritage_ref: journey.heritage_ref,
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

  const complete = next.completed_step_ids.length === GRAHAM_POLAR_STEPS.length;
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

export function grahamPolarTwinProgress(journey) {
  const total = GRAHAM_POLAR_STEPS.length;
  const done = journey?.completed_step_ids?.length || 0;
  return {
    done,
    total,
    next_step: GRAHAM_POLAR_STEPS[done] || null,
    complete: done === total,
    active_room_key: journey?.active_room_key || null,
    representation_state: 'planning_concept',
    no_fake_station: true,
  };
}

export function runGrahamPolarTwinPlayable({ learnerId = 'learner-gl', now = '2026-10-30T16:20:00.000Z' } = {}) {
  const created = createGrahamPolarTwinJourney({ learnerId, now });
  if (!created.ok) return created;
  let journey = created.journey;
  const inputs = {
    state_assumptions: 'Remote-first polar education twin; host outside Antarctica; no fictional WAIKE station; simulation ≠ field validation.',
    low_bw_climate: 'Compressed climate packet for intermittent downlink; assumptions retained.',
    ntn_exercise: 'Satcom demo cart: link budget worksheet for education twin (not field ops).',
    twin_ops_note: 'GIS/RS studio note: partner references stay external; twin ops only.',
    portfolio_and_home: 'Portfolio: assumptions + climate packet + NTN log for public education studio (private).',
  };
  const transcript = [];
  let privateNode = null;
  for (const step of GRAHAM_POLAR_STEPS) {
    const result = advanceGrahamPolarTwinJourney(journey, step.id, {
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
    rooms_include_data_lab: transcript.some((t) => t.room_key === 'DATA_LAB'),
    rooms_include_satcom_cart: transcript.some((t) => t.room_key === 'NETWORKING_SATCOM_DEMO_CART'),
    exercise: {
      id: `gl-ntn-${learnerId}`,
      kind: 'low_bandwidth_climate_network',
      assumptions: journey.assumptions,
      waike_deep_link: journey.waike_deep_link,
      heritage_ref: journey.heritage_ref,
    },
    no_fake_station: true,
    returned_home: journey.returned_home === true,
    location_id: 'loc.campus.graham-land',
    representation_state: 'planning_concept',
    nav_only: false,
  };
}
