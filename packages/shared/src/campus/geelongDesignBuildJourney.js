/**
 * Geelong design/build critique → revise → portfolio journey.
 * Binds DESIGN_BUILD_STUDIO (semi+) and pilot prototype yard / mobile cart.
 * Temporal layers stay separately labeled; planning concept never inherits built status.
 */

import { createPrivateNode, VISIBILITY } from '../privacyPolicy.js';
import { loadLocationRecord, sceneStateLabel } from './locationRecords.js';
import { specialistWaikeDeepLink, SPECIALIST_WAIKE_TRACKS } from './waikeContract.js';

export const GEELONG_DB_JOURNEY_ID = 'geelong.design_build.critique_to_portfolio';

export const GEELONG_DB_STEPS = Object.freeze([
  {
    id: 'orient_temporal_layers',
    room_key: 'FLEXIBLE_CLASSROOM',
    phase_hint: 'pilot',
    title: 'Orient temporal / proposal layers',
    produces: 'layer_orientation',
    min_chars: 12,
  },
  {
    id: 'design_critique',
    room_key: 'DESIGN_BUILD_STUDIO',
    phase_hint: 'semi',
    title: 'Design / build critique in studio',
    produces: 'critique_notes',
    min_chars: 16,
  },
  {
    id: 'revise_prototype',
    room_key: 'DESIGN_BUILD_STUDIO',
    phase_hint: 'semi',
    title: 'Revise prototype after critique',
    produces: 'prototype_revision',
    min_chars: 16,
  },
  {
    id: 'portfolio_artifact',
    room_key: 'CAREER_PORTFOLIO_STUDIO',
    phase_hint: 'semi',
    title: 'Document portfolio artifact',
    produces: 'portfolio_item',
    min_chars: 16,
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

export const GEELONG_LAYER_REFS = Object.freeze([
  { location_id: 'loc.heritage.geelong_gallery_shell', role: 'building_shell' },
  { location_id: 'loc.heritage.geelong_rone_2021', role: 'exhibition_2021' },
  { location_id: 'loc.heritage.geelong_jwa_proposal', role: 'institutional_proposal' },
  { location_id: 'loc.heritage.geelong_student_resonance', role: 'student_exploration' },
  { location_id: 'loc.campus.geelong', role: 'waike_planning_concept' },
]);

export function createGeelongDesignBuildJourney({ learnerId, now = new Date().toISOString() } = {}) {
  if (!learnerId) return { ok: false, reason: 'learner_required' };
  const layers = GEELONG_LAYER_REFS.map((ref) => {
    const record = loadLocationRecord(ref.location_id);
    const label = sceneStateLabel(record);
    return {
      ...ref,
      representation_state: label?.representation_state || null,
      scene_version: label?.scene_version || null,
      capture: label?.capture || null,
    };
  });
  return {
    ok: true,
    journey: {
      journey_id: GEELONG_DB_JOURNEY_ID,
      learner_id: learnerId,
      campus_slug: 'geelong',
      representation_state: 'planning_concept',
      location_id: 'loc.campus.geelong',
      created_at: now,
      updated_at: now,
      completed_step_ids: [],
      artifacts: {},
      layers,
      active_room_key: null,
      active_phase_hint: 'pilot',
      saved: false,
      returned_home: false,
      waike_deep_link: specialistWaikeDeepLink(SPECIALIST_WAIKE_TRACKS.DESIGN_BUILD_STUDIO),
    },
  };
}

export function advanceGeelongDesignBuildJourney(journey, stepId, { learnerInput = '', now = new Date().toISOString(), actorId } = {}) {
  if (!journey || journey.journey_id !== GEELONG_DB_JOURNEY_ID) return { ok: false, reason: 'invalid_journey' };
  const step = GEELONG_DB_STEPS.find((s) => s.id === stepId);
  if (!step) return { ok: false, reason: 'unknown_step' };
  const expected = GEELONG_DB_STEPS[journey.completed_step_ids.length];
  if (!expected || expected.id !== stepId) return { ok: false, reason: 'out_of_order', expected: expected?.id || null };
  const text = String(learnerInput || '').trim();
  if (text.length < step.min_chars) return { ok: false, reason: 'insufficient_learner_work', required_chars: step.min_chars };

  // Enforce temporal label honesty on first step
  if (stepId === 'orient_temporal_layers') {
    const states = new Set((journey.layers || []).map((l) => l.representation_state));
    if (!states.has('planning_concept') || !states.has('documented_snapshot')) {
      return { ok: false, reason: 'layer_labels_incomplete' };
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
        visibility: stepId === 'portfolio_artifact' ? VISIBILITY.PRIVATE : 'learner_private',
      },
    },
  };

  let privateNode = null;
  if (stepId === 'portfolio_artifact') {
    privateNode = createPrivateNode({
      ownerId: actorId || journey.learner_id,
      name: 'Geelong design/build portfolio',
      mimeType: 'text/plain',
      extra: {
        id: `geelong-db-portfolio-${now}`,
        campus_slug: 'geelong',
        journey_id: journey.journey_id,
        room_key: step.room_key,
        representation_state: 'planning_concept',
        body: text,
        gallery_zone: 'my_gallery',
        gallery_file: true,
        published: false,
        layer_refs: journey.layers,
      },
    });
    next.artifacts.portfolio_item.private_node_id = privateNode.id;
    next.artifacts.portfolio_item.visibility = VISIBILITY.PRIVATE;
  }

  if (stepId === 'save_and_return') {
    if (!next.artifacts.portfolio_item) return { ok: false, reason: 'portfolio_required_before_save' };
    next.saved = true;
    next.returned_home = true;
  }

  const complete = next.completed_step_ids.length === GEELONG_DB_STEPS.length;
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

export function geelongDesignBuildProgress(journey) {
  const total = GEELONG_DB_STEPS.length;
  const done = journey?.completed_step_ids?.length || 0;
  return {
    done,
    total,
    next_step: GEELONG_DB_STEPS[done] || null,
    complete: done === total,
    active_room_key: journey?.active_room_key || null,
    representation_state: 'planning_concept',
  };
}

export function runGeelongDesignBuildPlayable({ learnerId = 'learner-au', now = '2026-10-30T15:00:00.000Z' } = {}) {
  const created = createGeelongDesignBuildJourney({ learnerId, now });
  if (!created.ok) return created;
  let journey = created.journey;
  const inputs = {
    orient_temporal_layers: 'Shell=documented snapshot; RONE=2021 reconstruction; JWA=proposal; campus=planning concept — not mixed.',
    design_critique: 'Critique: maker-yard adjacency works; proposal wing must stay labeled unpublished; prototype wall needs clearer circulation.',
    revise_prototype: 'Revision: separated proposal volume label; moved prototype cart clear of shed egress; kept Wadawurrung naming gated.',
    portfolio_artifact: 'Portfolio: critique notes + revised prototype photoset placeholders (metadata-only) + layer state table.',
    save_and_return: 'OK',
  };
  const transcript = [];
  let privateNode = null;
  for (const step of GEELONG_DB_STEPS) {
    const result = advanceGeelongDesignBuildJourney(journey, step.id, {
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
    rooms_include_design_build_studio: transcript.some((t) => t.room_key === 'DESIGN_BUILD_STUDIO'),
    layer_states: (journey.layers || []).map((l) => l.representation_state),
    returned_home: journey.returned_home === true,
    nav_only: false,
  };
}
